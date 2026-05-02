import Twilio from "twilio";
import { ENV } from "./env";

let twilioClient: any = null;

function getTwilioClient() {
  if (!ENV.twilioAccountSid || !ENV.twilioAuthToken) {
    return null;
  }
  if (!twilioClient) {
    twilioClient = new Twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);
  }
  return twilioClient;
}

export async function sendOrderNotificationSMS(
  orderNumber: string,
  customerName: string,
  items: { productName: string; quantity: number }[]
) {
  const client = getTwilioClient();
  if (!client || !ENV.ownerPhoneNumber) {
    console.log("SMS not configured, skipping notification");
    return;
  }

  try {
    const itemsList = items.map(item => `${item.quantity}x ${item.productName}`).join(", ");
    const body = `New order #${orderNumber} from ${customerName}: ${itemsList}`;

    await client.messages.create({
      body,
      from: ENV.twilioPhoneNumber,
      to: ENV.ownerPhoneNumber,
    });
  } catch (error) {
    console.error("Failed to send SMS notification:", error);
  }
}
