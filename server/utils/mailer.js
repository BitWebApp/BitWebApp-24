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

/**
 * Email sent to Batch Admin when a professor requests group removal.
 */
export const buildGroupRemovalRequestEmailForAdmin = ({
  adminName,
  professorName,
  professorEmail,
  groupType,
  groupId,
  batch,
  reason,
  members,
}) => {
  const adminUrl = `${getClientUrl()}/admin-db/group-removal-requests`;
  const typeDisplay =
    groupType === "summer"
      ? "Summer Training"
      : groupType === "major"
      ? "Major Project"
      : groupType === "minor"
      ? "Minor Project"
      : "Project 1";

  const membersHtml = (members || [])
    .map(
      (m) =>
        `<tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${m.fullName || m.name || "N/A"}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${m.rollNumber || "N/A"}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${m.email || "N/A"}</td>
        </tr>`
    )
    .join("");

  return {
    subject: `[Action Required] Group Removal Request - Group ${groupId} (${typeDisplay}, Batch K${batch})`,
    html: `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
        <div style="max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background: #ffffff;">
          <div style="background-color: #d9534f; color: white; padding: 20px; text-align: center; font-size: 20px; font-weight: bold;">
            Group Removal Request
          </div>
          <div style="padding: 24px;">
            <p>Hello ${adminName || "Batch Admin"},</p>
            <p><strong>Prof. ${professorName}</strong> (${professorEmail}) has requested to remove an accepted group under their mentorship.</p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #d9534f; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 4px 0;"><strong>Group ID:</strong> ${groupId}</p>
              <p style="margin: 4px 0;"><strong>Project Type:</strong> ${typeDisplay}</p>
              <p style="margin: 4px 0;"><strong>Batch:</strong> K${batch}</p>
              <p style="margin: 4px 0;"><strong>Reason:</strong> ${reason}</p>
            </div>

            <h4 style="margin: 16px 0 8px 0; color: #444;">Group Members:</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f1f1f1;">
                  <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Name</th>
                  <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Roll Number</th>
                  <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Email</th>
                </tr>
              </thead>
              <tbody>
                ${membersHtml}
              </tbody>
            </table>

            <p style="text-align: center; margin: 24px 0;">
              <a href="${adminUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Review in Admin Dashboard
              </a>
            </p>

            <p style="font-size: 13px; color: #777;">Please log in to your admin dashboard to approve or reject this removal request.</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #888;">
            &copy; BITAcademia - Automated Notification System
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

/**
 * Email sent to Group Members when Batch Admin approves the group removal.
 */
export const buildGroupRemovedEmailForStudents = ({
  studentName,
  professorName,
  groupType,
  groupId,
  reason,
  adminComment,
}) => {
  const typeDisplay =
    groupType === "summer"
      ? "Summer Training"
      : groupType === "major"
      ? "Major Project"
      : groupType === "minor"
      ? "Minor Project"
      : "Project 1";

  const portalUrl = `${getClientUrl()}/log`;

  return {
    subject: `Notification: Your ${typeDisplay} Group has been deallocated from Prof. ${professorName}`,
    html: `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background: #ffffff;">
          <div style="background-color: #ff9800; color: white; padding: 20px; text-align: center; font-size: 20px; font-weight: bold;">
            Group Allocation Update
          </div>
          <div style="padding: 24px;">
            <p>Dear ${studentName || "Student"},</p>
            <p>This is to inform you that following a removal request by <strong>Prof. ${professorName}</strong> and approval by the <strong>Batch Admin</strong>, your group (${groupId}) has been deallocated from their mentorship.</p>

            <div style="background-color: #fff8e1; border-left: 4px solid #ff9800; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 4px 0;"><strong>Group ID:</strong> ${groupId}</p>
              <p style="margin: 4px 0;"><strong>Project Type:</strong> ${typeDisplay}</p>
              <p style="margin: 4px 0;"><strong>Reason given by Faculty:</strong> ${reason}</p>
              ${adminComment ? `<p style="margin: 4px 0;"><strong>Admin Remark:</strong> ${adminComment}</p>` : ""}
            </div>

            <p><strong>Next Steps:</strong></p>
            <p>Your group is now unallocated. Please log in to the portal to apply for available faculty members or reach out to your department coordinator.</p>

            <p style="text-align: center; margin: 24px 0;">
              <a href="${portalUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Log in to Portal
              </a>
            </p>

            <p>Best regards,</p>
            <p><strong>Department Academic Office</strong><br/>BITAcademia</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #888;">
            &copy; BITAcademia. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

