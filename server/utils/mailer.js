import nodemailer from "nodemailer";

let cachedTransporter = null;

/**
 * Pooled transporter reused across a bulk send so we don't open a fresh
 * SMTP connection per recipient.
 * @returns {import("nodemailer").Transporter}
 */
const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });
  }
  return cachedTransporter;
};

/**
 * Send a single mail. Never throws - returns a result object so bulk callers
 * can report per-recipient status.
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<{ sent: boolean, error?: string }>}
 */
export const sendMail = async ({ to, subject, html }) => {
  try {
    await getTransporter().sendMail({
      from: process.env.AUTH_EMAIL,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("Error sending email to:", to, error.message);
    return { sent: false, error: error.message };
  }
};

/**
 * Base URL of the student facing app, used for the login link in emails.
 * @returns {string}
 */
export const getClientUrl = () =>
  (process.env.CLIENT_URL || process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");

/**
 * Welcome email sent to a student account created by an admin.
 * @param {{ fullName: string, username: string, email: string, password: string }} user
 * @returns {{ subject: string, html: string }}
 */
export const buildWelcomeEmail = ({ fullName, username, email, password }) => {
  const loginUrl = `${getClientUrl()}/log`;

  return {
    subject: "Welcome to BITAcademia - Your Account Credentials",
    html: `
      <html>
      <head>
        <style>
          .email-container {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #dddddd;
            border-radius: 5px;
            overflow: hidden;
          }
          .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 24px;
          }
          .content {
            padding: 30px;
            background-color: #ffffff;
          }
          .content p {
            font-size: 16px;
            margin: 0 0 15px;
          }
          .creds {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .creds td {
            padding: 8px;
            border: 1px solid #dddddd;
            font-size: 16px;
          }
          .creds td:first-child {
            font-weight: bold;
            width: 35%;
            background-color: #f7f7f7;
          }
          .btn {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
          }
          .footer {
            background-color: #f2f2f2;
            padding: 15px;
            text-align: center;
            font-size: 14px;
            color: #888888;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">Welcome to BITAcademia!</div>
          <div class="content">
            <p>Hello ${fullName || "there"},</p>
            <p>An account has been created for you on BITAcademia by your department admin. Use the credentials below to log in:</p>
            <table class="creds">
              <tr><td>Username</td><td>${username}</td></tr>
              <tr><td>Email</td><td>${email}</td></tr>
              <tr><td>Temporary Password</td><td>${password}</td></tr>
            </table>
            <p style="text-align:center;"><a class="btn" href="${loginUrl}">Log in to BITAcademia</a></p>
            <p>For your security, please change this temporary password after your first login.</p>
            <p>If you believe this account was created by mistake, please contact your department admin.</p>
            <p>Best regards,</p>
            <p>TEAM BITACADEMIA</p>
          </div>
          <div class="footer">&copy; BITAcademia. All rights reserved.</div>
        </div>
      </body>
      </html>
    `,
  };
};
