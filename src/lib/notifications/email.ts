import { NotificationPayload } from "./types";

export async function sendEmail({
  recipient,
  subject,
  message,
}: NotificationPayload) {
  console.log("EMAIL");

  console.log(recipient);

  console.log(subject);

  console.log(message);

  return true;
}