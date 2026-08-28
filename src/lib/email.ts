import "server-only";

/**
 * Email helpers for OTP and password reset.
 * Uses RESEND_API_KEY if present; otherwise logs in development
 * so the build and local flow still work.
 */

function requiredEnv(name: string): string | null {
  return process.env[name] ?? null;
}

async function sendViaResend(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = requiredEnv("RESEND_API_KEY");
  const from =
    process.env.EMAIL_FROM ??
    "Sreshta <noreply@sreshta.local>";

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY not set. Email content:",
      {
        to: params.to,
        subject: params.subject,
        text: params.text,
      },
    );
    // Allow local/dev without a real provider
    return { id: "dev-mock" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  const raw = await response.json();

  if (!response.ok) {
    throw new Error(
      `Email provider failed (${response.status}): ${JSON.stringify(raw)}`,
    );
  }

  return raw;
}

export async function sendOtpEmail(
  email: string,
  otp: string,
): Promise<void> {
  const subject = "Your Sreshta verification code";
  const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>Sreshta verification</h2>
      <p>Your one-time verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This code expires in 10 minutes. If you did not request it, ignore this email.</p>
    </div>
  `;

  await sendViaResend({ to: email, subject, html, text });
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
): Promise<void> {
  const subject = "Reset your Sreshta password";
  const text = `Open this link to reset your password: ${resetLink}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>Password reset</h2>
      <p>Click the button below to reset your password. The link expires soon.</p>
      <p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 20px;background:#0B1F3A;color:#fff;text-decoration:none;border-radius:6px;">
          Reset password
        </a>
      </p>
      <p style="color:#666;font-size:12px;">If the button does not work, copy this URL:<br/>${resetLink}</p>
    </div>
  `;

  await sendViaResend({ to: email, subject, html, text });
}
