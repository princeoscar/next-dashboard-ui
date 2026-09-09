import { NotificationPayload } from "./types";

export async function sendWhatsApp({
  recipient,
  message,
}: NotificationPayload) {
  console.log("WHATSAPP");

  console.log(recipient);

  console.log(message);

  return true;
}