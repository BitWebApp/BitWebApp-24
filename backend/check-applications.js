import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { Professor } from "./src/models/professor.model.js";
import { Major } from "./src/models/major.model.js";
import { User } from "./src/models/user.model.js";

dotenv.config();

async function checkProfessorsWithApplications() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected to database\n");

    // Get professors with major projects
    const professorsWithMajor = await Professor.find({
      "appliedGroups.major_project": { $exists: true, $ne: [] },
    }).populate({
      path: "appliedGroups.major_project",
      populate: { path: "members" },
    });

    console.log(
      `Found ${professorsWithMajor.length} professors with major project applications:`
    );
    professorsWithMajor.forEach((prof, idx) => {
      console.log(
        `${idx + 1}. ${prof.fullName} (${prof.email}) - ${prof.appliedGroups.major_project.length} applications`
      );
    });

    if (professorsWithMajor.length > 0) {
      console.log(
        `\nUsing first professor for test: ${professorsWithMajor[0].fullName}`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkProfessorsWithApplications();
