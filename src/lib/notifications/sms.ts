import { NotificationPayload } from "./types";

export async function sendSMS({
  recipient,
  message,
}: NotificationPayload) {
  const response = await fetch(
    `${process.env.TERMII_BASE_URL}/sms/send`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,

        to: recipient,

        from: process.env.TERMII_SENDER_ID,

        sms: message,

        type: "plain",

        channel: "generic",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send SMS.");
  }

  return await response.json();
}