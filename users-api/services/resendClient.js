// Cliente Resend API HTTP para envío de mails
// https://resend.com/docs/api-reference/emails/send-email

const fetch = require('node-fetch');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com/emails';

async function sendResendEmail({ to, subject, html, text, from }) {
  const payload = {
    from: from || 'CarwashFreaks <onboarding@resend.dev>',
    to,
    subject,
    html,
    text
  };

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Error enviando email con Resend');
  }
  return data;
}

module.exports = { sendResendEmail };
