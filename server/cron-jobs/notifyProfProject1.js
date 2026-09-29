import cron from "node-cron";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { Professor } from "../models/professor.model.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

async function sendNotificationEmail(professor) {
  // Generate auto-login token (valid for 30 minutes)
  const autoLoginToken = jwt.sign(
    { _id: professor._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );

  const autoLoginUrl = `http://139.167.188.221:3000/faculty-auto-login?token=${autoLoginToken}`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: professor.email,
    subject: "Student Applications Pending Review (Project 1)",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">Hello Professor ${professor.fullName},</h2>
        <p style="color: #555;">You have pending student applications for Project 1 that require your attention.</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #444;">Current Details:</h3>
          <ul style="color: #555; line-height: 1.6;">
            <li><strong>Current Project 1 Students:</strong> ${professor.currentCount.project1 || 0}</li>
            <li><strong>Maximum Limit:</strong> ${professor.limits.project1 || 0}</li>
            <li><strong>Pending Applications:</strong> ${professor.appliedGroups.project1.length}</li>
          </ul>
        </div>

        <p style="margin-top: 15px; color: #555;">Click the button below to instantly access your dashboard:</p>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${autoLoginUrl}" style="background-color: #007bff; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Visit Dashboard</a>
        </div>

        <p style="margin-top: 15px; color: #999; font-size: 12px;">This link is valid for 30 minutes. If you prefer to login manually, <a href="http://139.167.188.221:3000/faculty-login" style="color: #007bff; text-decoration: none;">click here</a>.</p>

        <p style="margin-top: 20px; color: #777; font-size: 12px; text-align: center;">Best regards,<br><strong>BITACADEMIA</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${professor.email} for Project 1`);
  } catch (error) {
    console.error(`Error sending email to ${professor.email}:`, error);
  }
}

const checkAndNotifyProfProject1 = async () => {
  try {
    const allProfs = await Professor.find().populate(
      "appliedGroups.project1"
    );
    const eligibleProfs = allProfs.filter((prof) => {
      const { currentCount, limits, appliedGroups } = prof;
      const limit = limits.project1 || 0;
      const count = currentCount.project1 || 0;
      const hasSpace = count < limit;
      const hasPendingApplications = appliedGroups.project1.length > 0;
      return hasSpace && hasPendingApplications;
    });
    console.log(`📢 Notifying ${eligibleProfs.length} professors for Project 1...`);
    await Promise.all(eligibleProfs.map((prof) => sendNotificationEmail(prof)));
    console.log("✅ All eligible professors for Project 1 have been notified.");
  } catch (error) {
    console.log("Error in checkAndNotifyProfProject1:", error);
  }
};
cron.schedule(
  "30 0 * * *",
  () => {
    console.log("Running a task every day at 6:00 AM IST for Project 1");
    checkAndNotifyProfProject1();
  },
  {
    timezone: "UTC",
  }
);

export { checkAndNotifyProfProject1 };
