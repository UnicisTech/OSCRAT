import axios from 'axios';
import {ApiError} from '@/lib/errors';
import env from '../env';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const sendgridClient = axios.create({
  baseURL: 'https://api.sendgrid.com/v3',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendEmail = async (data: EmailData) => {
  if (!env.sendgrid?.apiKey) {
    throw new ApiError(500, 'SendGrid API key not configured');
  }

  if (!env.sendgrid?.fromEmail) {
    console.error('SendGrid from email not configured');
    throw new ApiError(500, 'SendGrid from email not configured');
  }

  const emailPayload = {
    personalizations: [
      {
        to: [{ email: data.to }],
        subject: data.subject,
      },
    ],
    from: { email: env.sendgrid.fromEmail },
    content: [
      {
        type: 'text/html',
        value: data.html,
      },
      ...(data.text ? [{
        type: 'text/plain',
        value: data.text,
      }] : []),
    ],
  };

  try {
    const response = await sendgridClient.post('/mail/send', emailPayload, {
      headers: {
        'Authorization': `Bearer ${env.sendgrid.apiKey}`,
      },
    });

    console.log('Email sent successfully:', response.headers['x-message-id']);
    return {
      messageId: response.headers['x-message-id'],
      response: `${response.status} ${response.statusText}`,
    };
  } catch (error: any) {
    console.error('Failed to send email:', error.response?.data || error.message);
    throw new ApiError(500, 'Failed to send email');
  }
};
