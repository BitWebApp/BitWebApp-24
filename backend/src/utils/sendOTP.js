import nodemailer from "nodemailer";

/**
 * Send OTP email with error handling
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} purpose - 'verification' or 'forgot-password'
 * @returns {Promise<boolean>} - Returns true if email sent successfully, false otherwise
 */
export const sendOTP = async (email, otp, purpose = "verification") => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });

    const subjects = {
      verification: "OTP for Verification",
      "forgot-password": "Forgot Password",
    };

    const messages = {
      verification:
        "Thank you for choosing BITAcademia. To complete your verification process, please use the following One-Time Password (OTP):",
      "forgot-password":
        "Thank you for choosing BITAcademia. To reset your password, please use the following One-Time Password (OTP):",
    };

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: subjects[purpose] || subjects.verification,
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
              font-size: 18px;
              margin: 0 0 15px;
            }
            .otp {
              font-weight: bold;
              color: #007bff;
              font-size: 22px;
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
            <div class="header">
              ${subjects[purpose] || subjects.verification}
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>${messages[purpose] || messages.verification}</p>
              <p class="otp">${otp}</p>
              <p>If you did not request this OTP, please ignore this email or contact our support team.</p>
              <p>Best regards,</p>
              <p>TEAM BITACADEMIA</p>
            </div>
            <div class="footer">
              &copy; BITAcademia 2024. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
    return true;
  } catch (error) {
    console.error("Error sending email to:", email, error.message);
    return false;
  }
};
