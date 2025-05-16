import nodemailer from 'nodemailer';

import env from '../env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false
});

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  if (!env.smtp.host) {
    return;
  }

  const emailDefaults = {
    from: env.smtp.from,
  };

  return await transporter.sendMail({ ...emailDefaults, ...data });
};
