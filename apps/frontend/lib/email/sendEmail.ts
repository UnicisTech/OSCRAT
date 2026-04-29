import nodemailer from 'nodemailer';
import { ApiError } from '@/lib/errors';
import env from '../env';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  if (!env.smtp?.host || !env.smtp?.from) {
    throw new ApiError(
      500,
      'SMTP not configured. Set SMTP_HOST and SMTP_FROM environment variables.'
    );
  }

  const isSecurePort = env.smtp.port === 465;
  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: isSecurePort,
    auth: env.smtp.user
      ? { user: env.smtp.user, pass: env.smtp.password }
      : undefined,
  });

  const info = await transporter.sendMail({
    from: `"OSCRAT" <${env.smtp.from}>`,
    to: data.to,
    subject: data.subject,
    html: data.html,
    ...(data.text && { text: data.text }),
  });

  return {
    messageId: info.messageId,
    response: info.response,
  };
};
