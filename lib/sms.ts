import twilio from "twilio";

export async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    console.warn("SMS env vars missing; skipping send", { to, body });
    return;
  }

  try {
    const client = twilio(sid, token);
    const res = await client.messages.create({ to, from, body });
    console.log("SMS sent", { to, sid: res.sid });
  } catch (error) {
    console.error("Failed to send SMS", { to, error });
  }
}
