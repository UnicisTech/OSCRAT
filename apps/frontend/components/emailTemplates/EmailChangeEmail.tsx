import {
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import EmailLayout from './EmailLayout';

interface EmailChangeEmailProps {
  subject: string;
  confirmationLink: string;
}

const EmailChangeEmail = ({
  subject,
  confirmationLink,
}: EmailChangeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Heading as="h2">Confirm your new email address</Heading>

        <Text>
          We received a request to change the email address on your account to
          this one. To confirm the change, please click the link below:
        </Text>

        <Container className="text-center">
          <Button
            href={confirmationLink}
            style={{ padding: '16px 20px' }}
            className="rounded bg-[#0052cc] text-center text-[12px] font-semibold text-white no-underline"
          >
            Confirm new email
          </Button>
        </Container>

        <Text>
          If you did not request this change, you can safely ignore this email
          and your address will remain unchanged.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default EmailChangeEmail;
