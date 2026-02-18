import {
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import EmailLayout from './EmailLayout';

interface TeamInviteEmailProps {
  teamName: string;
  invitationLink: string;
  userFirstname?: string;
}

const TeamInviteEmail = ({ teamName, invitationLink, userFirstname }: TeamInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Team Invitation</Preview>
      <EmailLayout>
        {userFirstname && <Text>Hi {userFirstname},</Text>}
        <Text>You have been invited to join the team at {teamName}.</Text>
        <Text>
          Click the link below to accept the invitation and join the team:
        </Text>

        <Container className="text-center">
          <Button
            href={invitationLink}
            style={{ padding: '16px 20px' }}
            className="rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline"
          >
            Join team
          </Button>
        </Container>
      </EmailLayout>
    </Html>
  );
};

export default TeamInviteEmail;
