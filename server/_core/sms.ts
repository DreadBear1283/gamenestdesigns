import Twilio from "twilio";
import { ENV } from "./env";

const twilioClient = new Twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);

export async function sendOrderNotificationSMS(
  orderNumber: string,
  customerName: string,
  items: { productName: string; quantity: number }[]
) {
  if (!ENV.twilioAccountSid || !ENV.twilioAuthToken || !ENV.ownerPhoneNumber) {
    console.log("SMS not configured, skipping notification");
    return;
  }

  try {
    const itemsList = items.map(item => `${item.quantity}x ${item.productName}`).join(", ");
    const body = `New order #${orderNumber} from ${customerName}: ${itemsList}`;

    await twilioClient.messages.create({
      body,
      from: ENV.twilioPhoneNumber,
      to: ENV.ownerPhoneNumber,
    });
  } catch (error) {
    console.error("Failed to send SMS notification:", error);
  }
}
