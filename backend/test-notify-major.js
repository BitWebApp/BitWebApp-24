import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { Professor } from "./src/models/professor.model.js";
import { Major } from "./src/models/major.model.js";
import { User } from "./src/models/user.model.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

async function sendTestNotification() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected to database");

    // Get a sample professor with major projects
    const professors = await Professor.find({
      "appliedGroups.major_project": { $exists: true, $ne: [] },
    })
      .populate({
        path: "appliedGroups.major_project",
        populate: { path: "members" },
      })
      .limit(1);

    if (professors.length === 0) {
      console.log("No professors found in database");
      process.exit(0);
    }

    const professor = professors[0];
    console.log(`\nTesting notification for professor: ${professor.fullName}`);
    console.log(`Email: ${professor.email}`);
    console.log(`Applied Major Projects: ${professor.appliedGroups.major_project.length}`);

    if (professor.appliedGroups.major_project.length === 0) {
      console.log("This professor has no major project applications");
      process.exit(0);
    }

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
      subject: "Major Project Applications Pending Review - TEST",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Hello Professor ${professor.fullName},</h2>
          <p style="color: #555;">You have pending student applications for major projects that require your attention.</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #444;">Current Details:</h3>
            <ul style="color: #555; line-height: 1.6;">
              <li><strong>Current Major Project Students:</strong> ${professor.currentCount.major_project}</li>
              <li><strong>Maximum Limit:</strong> ${professor.limits.major_project}</li>
              <li><strong>Pending Applications:</strong> ${professor.appliedGroups.major_project.length}</li>
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

    console.log("\nSending test email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Auto-login URL: ${autoLoginUrl}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    process.exit(1);
  }
}

sendTestNotification();
