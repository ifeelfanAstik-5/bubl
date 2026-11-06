import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: 'login' | 'signup' = 'signup'
): Promise<{ success: boolean; id?: string; error?: string }> {
  const isLogin = purpose === 'login';
  const subject = isLogin
    ? '🫧 Your Bubl Sign-In Code'
    : '🫧 Welcome to Bubl — Verify Your Email';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #2C2623;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #ECE4DA; box-shadow: 0 10px 30px rgba(180, 160, 140, 0.08); overflow: hidden;">
    <tr>
      <td style="padding: 40px 36px; text-align: center;">
        <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: linear-gradient(135deg, #FDE6D2 0%, #D8E7FA 100%); font-size: 28px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(220, 200, 180, 0.25);">
          🫧
        </div>
        <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 700; color: #1E1A18; letter-spacing: -0.02em;">
          ${isLogin ? 'Welcome Back to the Airspace' : 'Begin Your Mindful Journey'}
        </h1>
        <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #6D635B;">
          ${isLogin
            ? 'Here is your single-use verification code to return to your letters and drifting bubbles.'
            : 'Welcome to Bubl, a slow social space where thoughts travel on real atmospheric winds. Please use this verification code to confirm your email.'}
        </p>
        
        <div style="background: #F8F5F0; border: 1px dashed #D6CBC0; border-radius: 16px; padding: 22px; margin: 0 auto 28px; max-width: 320px;">
          <div style="font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2B2623; margin-left: 8px;">
            ${code}
          </div>
          <p style="margin: 8px 0 0; font-size: 12px; color: #8F8378; letter-spacing: 0.02em;">
            Valid for 15 minutes · Never share this code
          </p>
        </div>

        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #9C8F85;">
          If you did not request this verification code, you can safely disregard this letter.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #F8F5F0; padding: 18px 36px; text-align: center; border-top: 1px solid #ECE4DA;">
        <p style="margin: 0; font-size: 12px; color: #8C8075;">
          🫧 <strong>Bubl</strong> · Mindful Paced Pen Pals & Thought Exchange · Anti-Lookism
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const result = await resend.emails.send({
      from: 'Bubl <onboarding@resend.dev>',
      to: [to],
      subject,
      html
    });

    if (result.error) {
      console.error('[Resend Error]:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`[Resend Email Sent] Successfully sent ${purpose} OTP to ${to} (ID: ${result.data?.id})`);
    return { success: true, id: result.data?.id };
  } catch (err: any) {
    console.error('[Resend Exception]:', err);
    return { success: false, error: err.message || 'Failed to send email via Resend' };
  }
}
