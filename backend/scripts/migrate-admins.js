/**
 * Migration script to update existing admins with new role-based fields.
 * 
 * Run this script once after deploying the new admin schema:
 * node -r dotenv/config scripts/migrate-admins.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { Admin } from "../src/models/admin.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateAdmins() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to database.");

    // Find all admins without the role field, sorted by creation date for deterministic selection
    const adminsWithoutRole = await Admin.find({ role: { $exists: false } }).sort({ createdAt: 1 });
    console.log(`Found ${adminsWithoutRole.length} admins to migrate.`);

    if (adminsWithoutRole.length === 0) {
      console.log("No admins need migration. Exiting.");
      process.exit(0);
    }

    // Update admins: set first admin as master, rest as batch_admin with all batches
    let isFirstAdmin = true;
    for (const admin of adminsWithoutRole) {
      if (isFirstAdmin) {
        // First admin becomes master
        await Admin.findByIdAndUpdate(admin._id, {
          $set: {
            role: "master",
            assignedBatches: [], // Master has access to all, no need for specific batches
            email: admin.email || `${admin.username}@bitacademia.com`, // Fallback email
          },
        });
        console.log(`Updated admin "${admin.username}" as MASTER admin.`);
        isFirstAdmin = false;
      } else {
        // Other admins become batch_admin with all current batches
        await Admin.findByIdAndUpdate(admin._id, {
          $set: {
            role: "batch_admin",
            assignedBatches: [21, 22, 23, 24, 25], // All historical batches
            email: admin.email || `${admin.username}@bitacademia.com`,
          },
        });
        console.log(`Updated admin "${admin.username}" as BATCH_ADMIN.`);
      }
    }

    console.log("\nMigration completed successfully!");
    console.log("Summary:");
    console.log("- 1 Master Admin created");
    console.log(`- ${adminsWithoutRole.length - 1} Batch Admins created`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateAdmins();
