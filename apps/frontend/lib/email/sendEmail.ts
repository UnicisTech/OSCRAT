import nodemailer from 'nodemailer';
import {ApiError} from '@/lib/errors';

import env from '../env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData) => {
  if (!env.smtp.host) {
    console.log('SMTP not configured, skipping email send');
    throw new ApiError(500, 'SMTP not configured');
  }

  if (!env.smtp.user || !env.smtp.password) {
    console.error('SMTP credentials not configured');
    throw new ApiError(500, 'SMTP credentials not configured');
  }

  const emailDefaults = {
    from: env.smtp.from,
  };

  try {
    const result = await transporter.sendMail({ ...emailDefaults, ...data });
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new ApiError(500, 'Failed to send email');
  }
};
