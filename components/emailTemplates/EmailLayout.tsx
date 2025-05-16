import React, { ReactNode } from "react";
import {
  Body,
  Container,
  Hr,
  Img,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import app from "@/lib/app";

interface EmailLayoutProps {
  children: ReactNode;
}

const EmailLayout = ({ children }: EmailLayoutProps) => {
  console.log("EmailLayout", app.logoUrl);
  return (
    <Tailwind>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#f0f0f0] bg-white p-[20px]">
          <Img src={app.logoUrl} alt={app.name} className="mx-auto my-8" />

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
