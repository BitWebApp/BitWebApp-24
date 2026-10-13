import cron from "node-cron";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Professor } from "../models/professor.model.js";
import { getMinorBatches } from "../utils/projectEligibility.js";
import {
  filterMinorEligibleGroups,
  getMinorCountsByBatch,
  minorSeatsLeft,
} from "../utils/minorCapacity.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

async function sendMinorNotificationEmail(professor, accepted, pending) {
  const currentStudents = getMinorBatches().map(
    (batch) => `K${batch}: ${accepted[batch] || 0}`
  ).join(", ");

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
    subject: "Minor Project Applications Pending Review",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">Hello Professor ${professor.fullName},</h2>
        <p style="color: #555;">You have pending student applications for minor projects that require your attention.</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #444;">Current Details:</h3>
          <ul style="color: #555; line-height: 1.6;">
            <li><strong>Current Minor Project Students:</strong> ${currentStudents}</li>
            <li><strong>Maximum Limit (per batch):</strong> ${professor.limits.minor_project}</li>
            <li><strong>Pending Applications:</strong> ${pending}</li>
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
    console.log(`Minor project email sent successfully to ${professor.email}`);
  } catch (error) {
    console.error(
      `Error sending minor project email to ${professor.email}:`,
      error
    );
  }
}

const checkAndNotifyMinorProf = async () => {
  try {
    const allProfs = await Professor.find().populate(
      "appliedGroups.minor_project"
    );
    const acceptedByProf = await getMinorCountsByBatch(allProfs);
    // Requests from batches past the minor project year are not shown to the
    // professor, so they must not trigger a reminder either.
    const eligibleGroupIds = new Set(
      (
        await filterMinorEligibleGroups(
          allProfs.flatMap((prof) => prof.appliedGroups.minor_project)
        )
      ).map((group) => group._id.toString())
    );
    const pendingCount = (prof) =>
      prof.appliedGroups.minor_project.filter((group) =>
        eligibleGroupIds.has(group._id.toString())
      ).length;
    const eligibleProfs = allProfs.filter((prof) => {
      const accepted = acceptedByProf.get(prof._id.toString());
      const hasSpace = getMinorBatches().some(
        (batch) => minorSeatsLeft(prof, accepted, batch) > 0
      );
      const hasPendingApplications = pendingCount(prof) > 0;
      return hasSpace && hasPendingApplications;
    });
    console.log("eligible minor project profs:", eligibleProfs);
    console.log(
      `📢 Notifying ${eligibleProfs.length} professors for minor projects...`
    );
    await Promise.all(
      eligibleProfs.map((prof) =>
        sendMinorNotificationEmail(
          prof,
          acceptedByProf.get(prof._id.toString()),
          pendingCount(prof)
        )
      )
    );
    console.log(
      "✅ All eligible professors have been notified for minor projects."
    );
  } catch (error) {
    console.log("Error in checkAndNotifyMinorProfessors:", error);
  }
};

cron.schedule(
  "30 0 * * *",
  () => {
    console.log(
      "Running minor project notification task every day at 6:15 AM IST"
    );
    checkAndNotifyMinorProf();
  },
  {
    timezone: "UTC",
  }
);

export { checkAndNotifyMinorProf };
