import { verifyPassword } from '@/lib/auth';
import { isBusinessEmail } from '@/lib/email/utils';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  createServerSession,
  JWT_SESSION_MAX_AGE,
  refreshServerSession,
  revokeServerSession,
} from '@/lib/auth-session';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { Role } from '@oscrat/model';
import { getLinkedAccount } from 'models/account';
import { addTeamMember, getTeamDetail } from 'models/team';
import { createUser, getUser } from 'models/user';
import { ensureAwarenessTrainingTask } from 'models/task';
import NextAuth, { Account, NextAuthOptions, Profile, User } from 'next-auth';
import BoxyHQSAMLProvider from 'next-auth/providers/boxyhq-saml';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { isAuthProviderEnabled } from '@/lib/auth';
import type { Provider } from 'next-auth/providers';
import type { NextApiRequest } from 'next';
import { validateRecaptcha } from '@/lib/recaptcha';
import rateLimit from '@/lib/rate-limit';
import { getIpAddress } from '@/lib/utils';

const adapter = PrismaAdapter(prisma);

const providers: Provider[] = [];

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 requests per second
});

if (isAuthProviderEnabled('credentials')) {
  providers.push(
    CredentialsProvider({
      id: 'credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
        recaptchaToken: { type: 'text' },
      },
      async authorize(credentials, req) {
        try {
          await limiter.check(5, getIpAddress(req as NextApiRequest)); // 5 requests per minute for IP address
        } catch {
          throw new Error('auth-limited');
        }

        if (!credentials) {
          throw new Error('no-credentials');
        }

        const { email, password, recaptchaToken } = credentials;

        await validateRecaptcha(recaptchaToken);

        if (!email || !password) {
          return null;
        }

        const user = await getUser({ email: email.toLowerCase().trim() });

        if (!user) {
          throw new Error('invalid-credentials');
        }

        if (env.confirmEmail && !user.emailVerified) {
          throw new Error('confirm-your-email');
        }

        const hasValidPassword = await verifyPassword(
          password,
          user?.password as string
        );

        if (!hasValidPassword) {
          throw new Error('invalid-credentials');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    })
  );
}

if (isAuthProviderEnabled('github')) {
  providers.push(
    GitHubProvider({
      clientId: env.github.clientId,
      clientSecret: env.github.clientSecret,
    })
  );
}

if (isAuthProviderEnabled('google')) {
  providers.push(
    GoogleProvider({
      clientId: env.google.clientId,
      clientSecret: env.google.clientSecret,
    })
  );
}

if (isAuthProviderEnabled('saml')) {
  providers.push(
    BoxyHQSAMLProvider({
      authorization: { params: { scope: '' } },
      issuer: env.appUrl,
      clientId: 'dummy',
      clientSecret: 'dummy',
      httpOptions: {
        timeout: 30000,
      },
    })
  );
}

if (isAuthProviderEnabled('email')) {
  providers.push(
    EmailProvider({
      server: {
        host: env.smtp.host,
        port: env.smtp.port,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.password,
        },
      },
      from: env.smtp.from,
    })
  );
}

const cookiesOptions: Partial<Pick<NextAuthOptions, 'cookies'>> =
  process.env.NODE_ENV === 'production' &&
  process?.env?.APP_URL?.startsWith('https')
    ? {
        cookies: {
          sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
              httpOnly: true,
              sameSite: 'lax',
              path: '/',
              secure: true,
            },
          },
          csrfToken: {
            name: `__Host-next-auth.csrf-token`,
            options: {
              httpOnly: true,
              sameSite: 'lax',
              path: '/',
              secure: true,
            },
          },
        },
      }
    : {};

export const authOptions: NextAuthOptions = {
  adapter,
  providers,
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: JWT_SESSION_MAX_AGE,
  },
  ...cookiesOptions,
  secret: env.nextAuth.secret,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user || !user.email || !account) {
        return false;
      }

      if (env.disableNonBusinessEmailSignup && !isBusinessEmail(user.email)) {
        return '/auth/login?error=allow-only-work-email';
      }

      // Login via email and password
      if (account?.provider === 'credentials') {
        return true;
      }

      const existingUser = await getUser({
        email: user.email.toLowerCase().trim(),
      });

      // Login via email (Magic Link)
      if (account?.provider === 'email') {
        return existingUser ? true : false;
      }

      // First time users
      if (!existingUser) {
        if (
          account.provider === 'google' &&
          profile &&
          (profile as { email_verified?: boolean }).email_verified === false
        ) {
          return '/auth/login?error=email-unverified';
        }

        const [firstName, lastName] = user.name?.split(' ') || ['', ''];

        const newUser = await createUser({
          name: `${user.name}`,
          firstName: firstName,
          lastName: lastName,
          email: user.email.toLowerCase().trim(),
        });

        await linkAccount(newUser, account);

        if (account.provider === 'boxyhq-saml' && profile) {
          await linkToTeam(profile, newUser.id, newUser.name);
        }

        return true;
      }

      const linkedAccount = await getLinkedAccount({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      });

      if (linkedAccount && linkedAccount.userId === existingUser.id) {
        return true;
      }

      console.warn(
        `[auth] refused to link ${account.provider} identity to existing ` +
          `account for ${user.email} — identity not previously linked.`
      );
      return '/auth/login?error=account-exists';
    },

    async session({ session, token }) {
      if (token && session && token.sub) {
        const currentUser = await getUser({ id: token.sub });

        if (!currentUser) {
          throw new ApiError(401, 'User not found');
        }

        session.user.id = currentUser.id;
        session.user.name = currentUser.name;
        session.user.email = currentUser.email;
        session.user.image = currentUser.image;
        session.user.firstName = currentUser.firstName;
        session.user.lastName = currentUser.lastName;
      }

      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.sessionId = await createServerSession(user.id);
      } else if (
        !token.sessionId ||
        !(await refreshServerSession(token.sessionId))
      ) {
        throw new Error('Session revoked');
      }

      if (trigger === 'update' && session?.user.name) {
        const updateUsername = { ...user, name: session.user.name };
        return { ...token, ...updateUsername };
      }
      return { ...token, ...user };
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.sessionId) {
        await revokeServerSession(token.sessionId);
      }
    },
  },
};

export default NextAuth(authOptions);

const linkToTeam = async (
  profile: Profile,
  userId: string,
  userName?: string | null
) => {
  const team = await getTeamDetail({
    id: profile.requested.tenant,
  });

  if (!team) {
    throw new Error(`Team with ID ${profile.requested.tenant} not found`);
  }

  // Sort out roles
  const roles = profile.roles || profile.groups || [];
  let userRole: Role = team.defaultRole || Role.MEMBER;

  if (env.groupPrefix && userRole === Role.MEMBER) {
    const grantsAdmin = roles.some(
      (role) => role.replace(env.groupPrefix!, '').toUpperCase() === Role.ADMIN
    );
    if (grantsAdmin) {
      userRole = Role.ADMIN;
    }
  }

  const auditInfo = {
    user: { id: userId, name: userName },
    team: { id: team.id, name: team.name },
  };

  await addTeamMember(team.id, userId, userRole, auditInfo);

  ensureAwarenessTrainingTask(team.id, userId, userName!, auditInfo).catch(
    (err) =>
      console.error(
        '[Awareness] Failed to create training task on SAML link:',
        err
      )
  );
};

const linkAccount = async (user: User, account: Account) => {
  if (adapter.linkAccount) {
    return await adapter.linkAccount({
      providerAccountId: account.providerAccountId,
      userId: user.id,
      provider: account.provider,
      type: 'oauth',
      scope: account.scope,
      token_type: account.token_type,
      access_token: account.access_token,
    });
  }
};
