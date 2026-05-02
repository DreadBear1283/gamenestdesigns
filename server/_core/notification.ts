import { ENV } from "./env";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!ENV.resendApiKey) {
    console.log("[Email/Disabled]", payload.subject, "→", payload.to);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.emailFrom,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });
    if (!res.ok) {
      console.warn("[Email] Send failed:", res.status, await res.text().catch(() => ""));
    }
  } catch (error) {
    console.warn("[Email] Error:", error);
  }
}

export async function notifyOwner(opts: { title: string; content: string }): Promise<void> {
  if (!ENV.ownerEmail) {
    console.log("[Owner notify]", opts.title);
    return;
  }
  await sendEmail({
    to: ENV.ownerEmail,
    subject: opts.title,
    text: opts.content,
    html: `<pre style="font-family:ui-monospace,Consolas,monospace;white-space:pre-wrap;">${opts.content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</pre>`,
  });
}
