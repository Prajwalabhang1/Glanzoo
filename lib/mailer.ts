import nodemailer from 'nodemailer';

// ─── Brevo SMTP Transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM = process.env.EMAIL_FROM || 'glanzoo8872@gmail.com';
const APP_NAME = 'Glanzoo';

// ─── Verification Email ───────────────────────────────────────────────────────
export async function sendVerificationEmail(email: string, verifyUrl: string) {
    try {
        await transporter.sendMail({
            from: `"${APP_NAME}" <${FROM}>`,
            to: email,
            subject: 'Verify your Glanzoo account',
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#f59e0b);padding:40px 32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px">${APP_NAME}</h1>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px">Verify your email address</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 32px">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;line-height:1.6">Hi there 👋</p>
            <p style="color:#374151;font-size:15px;margin:0 0 28px;line-height:1.7">
              Thanks for signing up with <strong>${APP_NAME}</strong>! Please verify your email address by clicking the button below. This link expires in <strong>24 hours</strong>.
            </p>
            <div style="text-align:center;margin:32px 0">
              <a href="${verifyUrl}"
                 style="display:inline-block;background:linear-gradient(135deg,#f97316,#f59e0b);color:#fff;text-decoration:none;padding:16px 44px;border-radius:50px;font-weight:700;font-size:16px;letter-spacing:0.3px">
                ✉️ Verify My Email
              </a>
            </div>
            <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6">
              If you didn't create an account, you can safely ignore this email.<br>
              Can't click the button? Copy and paste this link into your browser:<br>
              <a href="${verifyUrl}" style="color:#f97316;word-break:break-all">${verifyUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f3f4f6">
            <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });
        console.log(`[Mailer] Verification email sent to ${email}`);
    } catch (err) {
        console.error('[Mailer] Failed to send verification email:', err);
        throw err;
    }
}

// ─── Password Reset Email ─────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
    try {
        await transporter.sendMail({
            from: `"${APP_NAME}" <${FROM}>`,
            to: email,
            subject: 'Reset your Glanzoo password',
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#f59e0b);padding:40px 32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px">${APP_NAME}</h1>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px">Password Reset Request</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 32px">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;line-height:1.6">Hi there,</p>
            <p style="color:#374151;font-size:15px;margin:0 0 28px;line-height:1.7">
              We received a request to reset your <strong>${APP_NAME}</strong> password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <div style="text-align:center;margin:32px 0">
              <a href="${resetUrl}"
                 style="display:inline-block;background:linear-gradient(135deg,#f97316,#f59e0b);color:#fff;text-decoration:none;padding:16px 44px;border-radius:50px;font-weight:700;font-size:16px;letter-spacing:0.3px">
                🔐 Reset Password
              </a>
            </div>
            <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6">
              If you didn't request this, you can safely ignore this email. Your password won't change.<br>
              Can't click the button? Copy and paste this link:<br>
              <a href="${resetUrl}" style="color:#f97316;word-break:break-all">${resetUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f3f4f6">
            <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });
        console.log(`[Mailer] Password reset email sent to ${email}`);
    } catch (err) {
        console.error('[Mailer] Failed to send password reset email:', err);
        throw err;
    }
}
