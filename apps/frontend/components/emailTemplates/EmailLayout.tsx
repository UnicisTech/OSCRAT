import React, { ReactNode } from 'react';
import {
  Body,
  Container,
  Hr,
  Img,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import app from '@/lib/app';
import env from '@/lib/env';

interface EmailLayoutProps {
  children: ReactNode;
}

const EmailLayout = ({ children }: EmailLayoutProps) => {
  // Emails are rendered outside the app, so relative asset paths do not
  // resolve. Build an absolute URL to a raster (PNG) logo so it loads in mail
  // clients (SVG is unsupported by most clients, and a relative path falls
  // back to the <Img> alt text). Trailing slashes on APP_URL would produce
  // `//logo-oscrat.png` which some proxies (incl. Brevo's image fetcher)
  // treat as 404 and cache permanently.
  const baseUrl = (env.appUrl || env.publicAppUrl).replace(/\/+$/, '');
  const logoSrc = `${baseUrl}${app.emailLogoUrl}`;

  return (
    <Tailwind>
      <Body className="bg-surface mx-auto my-auto font-sans">
        <Container className="bg-surface mx-auto my-[40px] w-[465px] rounded border border-solid border-[#f0f0f0] p-[20px]">
          <Img
            src={logoSrc}
            alt={app.name}
            width="200"
            height="60"
            style={{ display: 'block', margin: '32px auto' }}
          />

          <Section>
            {children}

            <Hr className="mx-0 my-[20px] w-full border border-solid border-[#eaeaea]" />

            <Text className="my-0 text-center text-xs text-[#666666]">
              <span className="block">{app.name}</span>
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  );
};

export default EmailLayout;
