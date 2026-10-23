import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { DB_NAME } from "../server/constants.js";
import { Professor } from "../server/models/professor.model.js";
import { User } from "../server/models/user.model.js";
import { Project1 } from "../server/models/project1.model.js";
import { Group } from "../server/models/group.model.js";
import { Minor } from "../server/models/minor.model.js";
import { Major } from "../server/models/major.model.js";
import { GroupRemovalRequest } from "../server/models/groupRemovalRequest.model.js";

const MONGODB_URI = `${process.env.MONGODB_URI || "mongodb://localhost:27017"}/${DB_NAME}`;

async function main() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected successfully!\n");

  const rawPassword = "password123";

  // 1. Find or create Professor PROF001
  const profEmail = "bhatnagarkushaagra@gmail.com";
  let professor = await Professor.findOne({
    $or: [{ idNumber: "PROF001" }, { email: profEmail }],
  });

  if (!professor) {
    professor = await Professor.create({
      idNumber: "PROF001",
      fullName: "Dr. Kushaagra Bhatnagar",
      contact: "9876543210",
      email: profEmail,
      password: rawPassword,
      limits: {
        summer_training: 20,
        minor_project: 20,
        major_project: 20,
        project1: 20,
      },
      currentCount: {
        summer_training: 0,
        minor_project: 0,
        major_project: 0,
        project1: 0,
      },
      students: {
        summer_training: [],
        minor_project: [],
        major_project: [],
        project1: [],
      },
      appliedGroups: {
        summer_training: [],
        minor_project: [],
        major_project: [],
        project1: [],
      },
    });
    console.log(`✓ Created Professor PROF001: ${professor.fullName} (${profEmail})`);
  } else {
    professor.password = rawPassword;
    professor.fullName = "Dr. Kushaagra Bhatnagar";
    professor.email = profEmail;
    if (!professor.limits) professor.limits = {};
    professor.limits.summer_training = 20;
    professor.limits.minor_project = 20;
    professor.limits.major_project = 20;
    professor.limits.project1 = 20;

    if (!professor.students) {
      professor.students = { summer_training: [], minor_project: [], major_project: [], project1: [] };
    }
    if (!professor.appliedGroups) {
      professor.appliedGroups = { summer_training: [], minor_project: [], major_project: [], project1: [] };
    }
    if (!professor.currentCount) {
      professor.currentCount = { summer_training: 0, minor_project: 0, major_project: 0, project1: 0 };
    }
    await professor.save();
    console.log(`✓ Found & updated Professor PROF001: ${professor.fullName}`);
  }

  // 2. Helper to find or create student
  async function getOrCreateStudent({ rollNumber, username, fullName, email, batch, branch = "CSE" }) {
    let student = await User.findOne({
      $or: [{ rollNumber }, { username }, { email }],
    });
    if (!student) {
      student = await User.create({
        username,
        password: rawPassword,
        fullName,
        rollNumber,
        email,
        batch,
        branch,
        section: "A",
        isVerified: true,
        idCard: "https://example.com/idcard.jpg",
      });
      console.log(`  + Created student: ${fullName} (${rollNumber}, K${batch})`);
    } else {
      student.isVerified = true;
      student.batch = batch;
      student.fullName = fullName;
      student.password = rawPassword;
      await student.save();
    }
    return student;
  }

  console.log("\nEnsuring Students exist...");
  // Batch 24 students (for Project 1)
  const s24_1 = await getOrCreateStudent({
    rollNumber: "BTECH/10489/24",
    username: "btech10489.24",
    fullName: "Kushaagra Bhatnagar",
    email: "btech10489.24@bitmesra.ac.in",
    batch: 24,
  });
  const s24_2 = await getOrCreateStudent({
    rollNumber: "BTECH/10490/24",
    username: "btech10490.24",
    fullName: "Aarav Sharma",
    email: "aarav24@bitmesra.ac.in",
    batch: 24,
  });
  const s24_3 = await getOrCreateStudent({
    rollNumber: "BTECH/10491/24",
    username: "btech10491.24",
    fullName: "Priya Patel",
    email: "priya24@bitmesra.ac.in",
    batch: 24,
  });
  const s24_4 = await getOrCreateStudent({
    rollNumber: "BTECH/10492/24",
    username: "btech10492.24",
    fullName: "Rohan Verma",
    email: "rohan24@bitmesra.ac.in",
    batch: 24,
  });
  const s24_5 = await getOrCreateStudent({
    rollNumber: "BTECH/10493/24",
    username: "btech10493.24",
    fullName: "Sneha Reddy",
    email: "sneha24@bitmesra.ac.in",
    batch: 24,
  });
  const s24_6 = await getOrCreateStudent({
    rollNumber: "BTECH/10494/24",
    username: "btech10494.24",
    fullName: "Vikram Malhotra",
    email: "vikram24@bitmesra.ac.in",
    batch: 24,
  });

  // Batch 23 students (for Minor Project)
  const s23_1 = await getOrCreateStudent({
    rollNumber: "BTECH/10201/23",
    username: "btech10201.23",
    fullName: "Aditya Roy",
    email: "aditya23@bitmesra.ac.in",
    batch: 23,
  });
  const s23_2 = await getOrCreateStudent({
    rollNumber: "BTECH/10202/23",
    username: "btech10202.23",
    fullName: "Ananya Iyer",
    email: "ananya23@bitmesra.ac.in",
    batch: 23,
  });
  const s23_3 = await getOrCreateStudent({
    rollNumber: "BTECH/10203/23",
    username: "btech10203.23",
    fullName: "Kabir Das",
    email: "kabir23@bitmesra.ac.in",
    batch: 23,
  });

  // Batch 22 students (for Major & Summer Project)
  const s22_1 = await getOrCreateStudent({
    rollNumber: "BTECH/10001/22",
    username: "btech10001.22",
    fullName: "Test Student K22",
    email: "student22@test.com",
    batch: 22,
  });
  const s22_2 = await getOrCreateStudent({
    rollNumber: "BTECH/10055/22",
    username: "btech10055.22",
    fullName: "Rahul Sengupta",
    email: "rahul22@bitmesra.ac.in",
    batch: 22,
  });
  const s22_3 = await getOrCreateStudent({
    rollNumber: "BTECH/10056/22",
    username: "btech10056.22",
    fullName: "Neha Kulkarni",
    email: "neha22@bitmesra.ac.in",
    batch: 22,
  });

  console.log("\n--- Seeding Groups for PROF001 ---");

  // ==========================================
  // A. PROJECT 1 GROUPS (Batch 24)
  // ==========================================
  // Group 1: Accepted (2 members)
  const p1_accepted1_id = "PRJ1-K24-101";
  let p1_1 = await Project1.findOne({ groupId: p1_accepted1_id });
  if (!p1_1) {
    p1_1 = await Project1.create({
      groupId: p1_accepted1_id,
      projectTitle: "Autonomous Drone Fleet Coordination & Swarm Intelligence",
      leader: s24_1._id,
      members: [s24_1._id, s24_2._id],
      allocatedProf: professor._id,
      appliedProfs: [],
      deniedProf: [],
    });
  } else {
    p1_1.projectTitle = "Autonomous Drone Fleet Coordination & Swarm Intelligence";
    p1_1.leader = s24_1._id;
    p1_1.members = [s24_1._id, s24_2._id];
    p1_1.allocatedProf = professor._id;
    p1_1.appliedProfs = [];
    await p1_1.save({ validateBeforeSave: false });
  }

  // Group 2: Accepted (2 members)
  const p1_accepted2_id = "PRJ1-K24-102";
  let p1_2 = await Project1.findOne({ groupId: p1_accepted2_id });
  if (!p1_2) {
    p1_2 = await Project1.create({
      groupId: p1_accepted2_id,
      projectTitle: "Decentralized Academic Credential Verification on Ethereum",
      leader: s24_3._id,
      members: [s24_3._id, s24_4._id],
      allocatedProf: professor._id,
      appliedProfs: [],
      deniedProf: [],
    });
  } else {
    p1_2.projectTitle = "Decentralized Academic Credential Verification on Ethereum";
    p1_2.leader = s24_3._id;
    p1_2.members = [s24_3._id, s24_4._id];
    p1_2.allocatedProf = professor._id;
    p1_2.appliedProfs = [];
    await p1_2.save({ validateBeforeSave: false });
  }

  // Group 3: Applied (Pending Application) (2 members)
  const p1_applied_id = "PRJ1-K24-103";
  let p1_3 = await Project1.findOne({ groupId: p1_applied_id });
  if (!p1_3) {
    p1_3 = await Project1.create({
      groupId: p1_applied_id,
      projectTitle: "Real-time AI Proctoring & Continuous Biometric Verification",
      leader: s24_5._id,
      members: [s24_5._id, s24_6._id],
      allocatedProf: null,
      appliedProfs: [professor._id],
      deniedProf: [],
    });
  } else {
    p1_3.projectTitle = "Real-time AI Proctoring & Continuous Biometric Verification";
    p1_3.leader = s24_5._id;
    p1_3.members = [s24_5._id, s24_6._id];
    p1_3.allocatedProf = null;
    p1_3.appliedProfs = [professor._id];
    await p1_3.save({ validateBeforeSave: false });
  }

  // Update professor Project1 arrays
  professor.students.project1 = [p1_1._id, p1_2._id];
  professor.appliedGroups.project1 = [p1_3._id];
  professor.currentCount.project1 = p1_1.members.length + p1_2.members.length;
  console.log(`✓ Project 1: 2 Accepted Groups (${p1_accepted1_id}, ${p1_accepted2_id}), 1 Applied (${p1_applied_id})`);

  // ==========================================
  // B. SUMMER TRAINING GROUPS (Batch 22)
  // ==========================================
  // Summer Group 1: Accepted
  const sum_accepted_id = "SUM-K22-101";
  let sum_1 = await Group.findOne({ groupId: sum_accepted_id });
  if (!sum_1) {
    sum_1 = await Group.create({
      groupId: sum_accepted_id,
      type: "summer",
      typeOfSummer: "research",
      location: "inside_bit",
      projectTitle: "LLM-Powered Biomedical Information Extraction Pipeline",
      leader: s22_1._id,
      members: [s22_1._id, s22_2._id],
      summerAllocatedProf: professor._id,
      summerAppliedProfs: [],
      deniedProf: [],
    });
  } else {
    sum_1.summerAllocatedProf = professor._id;
    sum_1.members = [s22_1._id, s22_2._id];
    sum_1.leader = s22_1._id;
    await sum_1.save({ validateBeforeSave: false });
  }

  // Summer Group 2: Applied (Pending)
  const sum_applied_id = "SUM-K22-102";
  let sum_2 = await Group.findOne({ groupId: sum_applied_id });
  if (!sum_2) {
    sum_2 = await Group.create({
      groupId: sum_applied_id,
      type: "summer",
      typeOfSummer: "research",
      location: "inside_bit",
      projectTitle: "Computer Vision for Defect Detection in High-Precision Manufacturing",
      leader: s22_3._id,
      members: [s22_3._id],
      summerAllocatedProf: null,
      summerAppliedProfs: [professor._id],
      deniedProf: [],
    });
  } else {
    sum_2.summerAllocatedProf = null;
    sum_2.summerAppliedProfs = [professor._id];
    await sum_2.save({ validateBeforeSave: false });
  }

  professor.students.summer_training = [sum_1._id];
  professor.appliedGroups.summer_training = [sum_2._id];
  professor.currentCount.summer_training = sum_1.members.length;
  console.log(`✓ Summer Training: 1 Accepted (${sum_accepted_id}), 1 Applied (${sum_applied_id})`);

  // ==========================================
  // C. MINOR PROJECT GROUPS (Batch 23)
  // ==========================================
  // Minor Group 1: Accepted
  const min_accepted_id = "MIN-K23-101";
  let min_1 = await Minor.findOne({ groupId: min_accepted_id });
  if (!min_1) {
    min_1 = await Minor.create({
      groupId: min_accepted_id,
      projectTitle: "Smart IoT Sensor Network for Urban Water Quality Monitoring",
      leader: s23_1._id,
      members: [s23_1._id, s23_2._id],
      minorAllocatedProf: professor._id,
      minorAppliedProfs: [],
      deniedProf: [],
    });
  } else {
    min_1.minorAllocatedProf = professor._id;
    min_1.members = [s23_1._id, s23_2._id];
    min_1.leader = s23_1._id;
    await min_1.save({ validateBeforeSave: false });
  }

  // Minor Group 2: Applied (Pending)
  const min_applied_id = "MIN-K23-102";
  let min_2 = await Minor.findOne({ groupId: min_applied_id });
  if (!min_2) {
    min_2 = await Minor.create({
      groupId: min_applied_id,
      projectTitle: "Automated Microgrid Energy Distribution Optimizer",
      leader: s23_3._id,
      members: [s23_3._id],
      minorAllocatedProf: null,
      minorAppliedProfs: [professor._id],
      deniedProf: [],
    });
  } else {
    min_2.minorAllocatedProf = null;
    min_2.minorAppliedProfs = [professor._id];
    await min_2.save({ validateBeforeSave: false });
  }

  professor.students.minor_project = [min_1._id];
  professor.appliedGroups.minor_project = [min_2._id];
  professor.currentCount.minor_project = min_1.members.length;
  console.log(`✓ Minor Project: 1 Accepted (${min_accepted_id}), 1 Applied (${min_applied_id})`);

  // ==========================================
  // D. MAJOR PROJECT GROUPS (Batch 22)
  // ==========================================
  // Major Group 1: Accepted
  const maj_accepted_id = "MAJ-K22-101";
  let maj_1 = await Major.findOne({ groupId: maj_accepted_id });
  if (!maj_1) {
    maj_1 = await Major.create({
      groupId: maj_accepted_id,
      type: "research",
      projectTitle: "Autonomous Obstacle Avoidance for Warehouse AGVs",
      leader: s22_1._id,
      members: [s22_1._id, s22_2._id],
      majorAllocatedProf: professor._id,
      majorAppliedProfs: [],
      deniedProf: [],
    });
  } else {
    maj_1.majorAllocatedProf = professor._id;
    maj_1.members = [s22_1._id, s22_2._id];
    maj_1.leader = s22_1._id;
    await maj_1.save({ validateBeforeSave: false });
  }

  // Major Group 2: Applied (Pending)
  const maj_applied_id = "MAJ-K22-102";
  let maj_2 = await Major.findOne({ groupId: maj_applied_id });
  if (!maj_2) {
    maj_2 = await Major.create({
      groupId: maj_applied_id,
      type: "research",
      projectTitle: "High-Speed FPGA Implementation of Post-Quantum Cryptography",
      leader: s22_3._id,
      members: [s22_3._id],
      majorAllocatedProf: null,
      majorAppliedProfs: [professor._id],
      deniedProf: [],
    });
  } else {
    maj_2.majorAllocatedProf = null;
    maj_2.majorAppliedProfs = [professor._id];
    await maj_2.save({ validateBeforeSave: false });
  }

  professor.students.major_project = [maj_1._id];
  professor.appliedGroups.major_project = [maj_2._id];
  professor.currentCount.major_project = maj_1.members.length;
  console.log(`✓ Major Project: 1 Accepted (${maj_accepted_id}), 1 Applied (${maj_applied_id})`);

  // 3. Save professor updates
  await professor.save();
  console.log("✓ Professor PROF001 record updated successfully!");

  // 4. Update student flags for allocated groups
  await User.updateMany({ _id: { $in: [s24_1._id, s24_2._id, s24_3._id, s24_4._id] } }, {
    $set: { isProject1Allocated: true, project1AllocatedProf: professor._id }
  });
  await User.updateMany({ _id: { $in: [s22_1._id, s22_2._id] } }, {
    $set: { isSummerAllocated: true, summerAllocatedProf: professor._id, isMajorAllocated: true, majorAllocatedProf: professor._id }
  });
  await User.updateMany({ _id: { $in: [s23_1._id, s23_2._id] } }, {
    $set: { isMinorAllocated: true, minorAllocatedProf: professor._id }
  });

  // 5. Clean up any stale removal requests for clean testing state
  await GroupRemovalRequest.deleteMany({
    groupId: { $in: [p1_accepted1_id, p1_accepted2_id, sum_accepted_id, min_accepted_id, maj_accepted_id] }
  });

  console.log("\n========================================================");
  console.log("           PROF001 GROUPS POPULATED SUCCESSFULLY        ");
  console.log("========================================================");
  console.log("Faculty Login: bhatnagarkushaagra@gmail.com / password123");
  console.log("\nPopulated Groups:");
  console.log("1. Project 1 (/faculty-db/accept-project1):");
  console.log(`   - [ACCEPTED] ${p1_accepted1_id}: 2 members (${s24_1.fullName}, ${s24_2.fullName})`);
  console.log(`   - [ACCEPTED] ${p1_accepted2_id}: 2 members (${s24_3.fullName}, ${s24_4.fullName})`);
  console.log(`   - [PENDING]  ${p1_applied_id}:   2 members (${s24_5.fullName}, ${s24_6.fullName})`);
  console.log("\n2. Summer Training (/faculty-db/accept-students):");
  console.log(`   - [ACCEPTED] ${sum_accepted_id}: 2 members (${s22_1.fullName}, ${s22_2.fullName})`);
  console.log(`   - [PENDING]  ${sum_applied_id}: 1 member (${s22_3.fullName})`);
  console.log("\n3. Minor Project (/faculty-db/accept-minor-project):");
  console.log(`   - [ACCEPTED] ${min_accepted_id}: 2 members (${s23_1.fullName}, ${s23_2.fullName})`);
  console.log(`   - [PENDING]  ${min_applied_id}: 1 member (${s23_3.fullName})`);
  console.log("\n4. Major Project (/faculty-db/accept-major-project):");
  console.log(`   - [ACCEPTED] ${maj_accepted_id}: 2 members (${s22_1.fullName}, ${s22_2.fullName})`);
  console.log(`   - [PENDING]  ${maj_applied_id}: 1 member (${s22_3.fullName})`);
  console.log("========================================================\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed to seed PROF001 groups:", err);
  process.exit(1);
});
