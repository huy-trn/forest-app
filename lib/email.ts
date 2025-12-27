import sgMail from "@sendgrid/mail";

export async function sendEmail(options: { to: string; subject: string; text: string; html?: string }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn("SENDGRID_API_KEY or EMAIL_FROM missing; skipping email send", options);
    return;
  }

  try {
    sgMail.setApiKey(apiKey);
    const msg = {
      to: options.to,
      from,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text,
    };
    const [response] = await sgMail.send(msg);
    console.log("Email sent via SendGrid", {
      to: options.to,
      subject: options.subject,
      status: response.statusCode,
    });
  } catch (error) {
    console.error("Failed to send email via SendGrid", {
      error,
      to: options.to,
      subject: options.subject,
    });
  }
}
