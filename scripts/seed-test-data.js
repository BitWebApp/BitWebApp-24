/**
 * Seed script to create default test data for development.
 * Creates a master admin and test students for each batch.
 *
 * Run: node -r dotenv/config scripts/seed-test-data.js
 */

import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bitwebapp";

// Define schemas inline to avoid import issues
const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["master", "batch_admin"],
      default: "batch_admin",
    },
    assignedBatches: [{ type: Number }],
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    idCard: { type: String, default: "placeholder-id-card.jpg" },
    batch: { type: Number, required: true },
    branch: { type: String, default: "CSE" },
    section: { type: String, default: "A" },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
const User = mongoose.model("User", userSchema);

async function seedData() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to database.");

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create Master Admin
    const masterAdminData = {
      username: "masteradmin",
      password: hashedPassword,
      email: "masteradmin@bitacademia.com",
      isAdmin: true,
      role: "master",
      assignedBatches: [],
    };

    const existingMaster = await Admin.findOne({ username: "masteradmin" });
    if (!existingMaster) {
      await Admin.create(masterAdminData);
      console.log("✓ Created Master Admin: masteradmin / password123");
    } else {
      console.log("→ Master Admin already exists");
    }

    // Create Batch Admins
    const batchAdmins = [
      {
        username: "k22admin",
        email: "k22admin@bitacademia.com",
        batches: [22],
      },
      {
        username: "k23admin",
        email: "k23admin@bitacademia.com",
        batches: [23],
      },
    ];

    for (const admin of batchAdmins) {
      const existing = await Admin.findOne({ username: admin.username });
      if (!existing) {
        await Admin.create({
          username: admin.username,
          password: hashedPassword,
          email: admin.email,
          isAdmin: true,
          role: "batch_admin",
          assignedBatches: admin.batches,
        });
        console.log(
          `✓ Created Batch Admin: ${admin.username} (K${admin.batches.join(",")}) / password123`
        );
      } else {
        console.log(`→ Batch Admin ${admin.username} already exists`);
      }
    }

    // Create Test Students
    const testStudents = [
      {
        username: "btech10001.22",
        rollNumber: "BTECH/10001/22",
        fullName: "Test Student K22",
        email: "student22@test.com",
        batch: 22,
        isVerified: true,
      },
      {
        username: "btech10002.22",
        rollNumber: "BTECH/10002/22",
        fullName: "Unverified K22",
        email: "unverified22@test.com",
        batch: 22,
        isVerified: false,
      },
      {
        username: "btech10001.23",
        rollNumber: "BTECH/10001/23",
        fullName: "Test Student K23",
        email: "student23@test.com",
        batch: 23,
        isVerified: true,
      },
      {
        username: "btech10002.23",
        rollNumber: "BTECH/10002/23",
        fullName: "Unverified K23",
        email: "unverified23@test.com",
        batch: 23,
        isVerified: false,
      },
      {
        username: "btech10001.24",
        rollNumber: "BTECH/10001/24",
        fullName: "Test Student K24",
        email: "student24@test.com",
        batch: 24,
        isVerified: false,
      },
    ];

    for (const student of testStudents) {
      const existing = await User.findOne({ username: student.username });
      if (!existing) {
        await User.create({
          ...student,
          password: hashedPassword,
        });
        console.log(
          `✓ Created Student: ${student.rollNumber} (${student.isVerified ? "verified" : "unverified"}) / password123`
        );
      } else {
        console.log(`→ Student ${student.rollNumber} already exists`);
      }
    }

    console.log("\n=== Test Credentials ===");
    console.log("Master Admin: masteradmin / password123");
    console.log("K22 Admin:    k22admin / password123");
    console.log("K23 Admin:    k23admin / password123");
    console.log("Student:      btech10001.22 / password123");
    console.log("========================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
