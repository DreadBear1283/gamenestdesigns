import { Twilio } from "twilio";
import { ENV } from "./env";

const twilioClient = new Twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);

export async function sendOrderNotificationSMS(orderNumber: string, customerName: string) {
  if (!ENV.twilioAccountSid || !ENV.twilioAuthToken || !ENV.ownerPhoneNumber) {
    console.log("SMS not configured, skipping notification");
    return;
  }

  try {
    await twilioClient.messages.create({
      body: `New order #${orderNumber} from ${customerName}. Check your dashboard for details.`,
      from: ENV.twilioPhoneNumber,
      to: ENV.ownerPhoneNumber,
    });
  } catch (error) {
    console.error("Failed to send SMS notification:", error);
  }
}
