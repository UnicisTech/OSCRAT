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
  // back to the <Img> alt text).
  const baseUrl = env.appUrl || env.publicAppUrl;
  const logoSrc = `${baseUrl}${app.emailLogoUrl}`;

  return (
    <Tailwind>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#f0f0f0] bg-white p-[20px]">
          <Img src={logoSrc} alt={app.name} className="mx-auto my-8" />

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
