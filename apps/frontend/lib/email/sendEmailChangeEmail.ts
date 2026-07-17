import { sendEmail } from './sendEmail';
import { render } from '@react-email/render';
import { EmailChangeEmail } from '@/components/emailTemplates';
import env from '../env';

export const sendEmailChangeEmail = async (newEmail: string, token: string) => {
  const confirmationLink = `${
    env.appUrl
  }/auth/confirm-email-change?token=${encodeURIComponent(token)}`;
  const subject = 'Confirm your new email address';
  const html = await render(EmailChangeEmail({ subject, confirmationLink }));

  await sendEmail({ to: newEmail, subject, html });
};
