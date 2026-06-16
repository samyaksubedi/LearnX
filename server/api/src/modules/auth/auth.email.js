import { envVariables } from '../../configs/env.config.js';
import { sendEmail } from '../../utils/email.util.js';

const getEmailShell = ({
  name,
  verificationUrl,
  headline,
  introParagraph,
}) => ({
  html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>LearnX</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f0f5; color: #1a1a2e; }
          .wrapper { max-width: 580px; margin: 48px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e8e8f0; }

          .header { background: #1a1a2e; padding: 36px 40px; display: flex; align-items: center; gap: 14px; }
          .header-logo { width: 36px; height: 36px; background: #7c6af7; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
          .header-logo svg { width: 20px; height: 20px; fill: #ffffff; }
          .header h1 { color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: 0.3px; }
          .header p { color: #8888aa; font-size: 13px; margin-top: 2px; }

          .body { padding: 40px 40px 32px; }
          .body h2 { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 12px; }
          .body p { font-size: 15px; line-height: 1.75; color: #555570; margin-bottom: 16px; }

          .verify-box { background: #f7f6ff; border: 1px solid #e2deff; border-radius: 12px; padding: 28px 32px; text-align: center; margin: 28px 0; }
          .verify-box p { font-size: 14px; color: #7777aa; margin-bottom: 20px; }
          .cta-btn { display: inline-block; padding: 13px 40px; background: #7c6af7; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.2px; }
          .fallback { margin-top: 16px; font-size: 12px; color: #aaaacc; }
          .fallback a { color: #7c6af7; word-break: break-all; text-decoration: none; }

          .divider { border: none; border-top: 1px solid #f0f0f5; margin: 28px 0; }

          .notice { font-size: 13px; color: #9999bb; line-height: 1.6; }
          .notice a { color: #7c6af7; text-decoration: none; }

          .footer { background: #f7f7fb; padding: 20px 40px; border-top: 1px solid #eeeef5; }
          .footer p { font-size: 12px; color: #aaaacc; text-align: center; line-height: 1.7; }
          .footer a { color: #7c6af7; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="wrapper">

          <div class="header">
            <div class="header-logo">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1>LearnX</h1>
              <p>Intelligent learning, redefined.</p>
            </div>
          </div>

          <div class="body">
            <h2>${headline}</h2>
            <p>${introParagraph}</p>

            <div class="verify-box">
              <p>Click below to verify your email — this link expires in <strong>24 hours</strong>.</p>
              <a href="${verificationUrl}" class="cta-btn">Verify my email →</a>
              <div class="fallback">
                Button not working? Copy this link:<br/>
                <a href="${verificationUrl}">${verificationUrl}</a>
              </div>
            </div>

            <hr class="divider" />

            <p class="notice">
              Didn't create a LearnX account? You can safely ignore this email.<br/>
              Questions? Reach us at <a href="mailto:${envVariables.GMAIL_USER}">${envVariables.GMAIL_USER}</a>.
            </p>
            <p class="notice" style="margin-top: 12px;">The LearnX Team</p>
          </div>

          <div class="footer">
            <p>
              You're receiving this because you signed up at LearnX.<br/>
              <a href="${envVariables.CLIENT_URL}/privacy">Privacy Policy</a> &nbsp;·&nbsp;
              <a href="${envVariables.CLIENT_URL}/unsubscribe">Unsubscribe</a>
            </p>
          </div>

        </div>
      </body>
    </html>
  `,
  text: `Hey ${name}, ${introParagraph} Verify here: ${verificationUrl} — expires in 24 hours.`,
});

const sendWelcomeEmail = async ({ to, name, emailVerificationToken }) => {
  const verificationUrl = `${envVariables.CLIENT_URL}/auth/verify/${emailVerificationToken}`;

  const { html, text } = getEmailShell({
    name,
    verificationUrl,
    headline: `Hey ${name}, welcome to LearnX!`,
    introParagraph: `We're glad you're here. Before you dive in, please verify your email address to activate your account and get started.`,
  });

  return sendEmail({
    to,
    subject: 'Welcome to LearnX — verify your email',
    html,
    text,
  });
};

const resendVerificationEmail = async ({
  to,
  name,
  emailVerificationToken,
}) => {
  const verificationUrl = `${envVariables.CLIENT_URL}/auth/verify/${emailVerificationToken}`;

  const { html, text } = getEmailShell({
    name,
    verificationUrl,
    headline: `New verification link for ${name}`,
    introParagraph: `You requested a new verification email. Use the link below to verify your account and start using LearnX.`,
  });

  return sendEmail({
    to,
    subject: 'LearnX — new verification link',
    html,
    text,
  });
};

export { sendWelcomeEmail, resendVerificationEmail };
