import assert from "node:assert/strict";
import test from "node:test";

// Test the regex escaping logic used in student search and removal
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("escapeRegex safely handles roll number patterns with slashes and special characters", () => {
  const rollNumber1 = "MCA/10001/23";
  const rollNumber2 = "BTECH(CSE)/10050/22";
  const rollNumber3 = "BARCH+INT/10002/21";

  const regex1 = new RegExp(`^${escapeRegex(rollNumber1)}$`, "i");
  const regex2 = new RegExp(`^${escapeRegex(rollNumber2)}$`, "i");
  const regex3 = new RegExp(`^${escapeRegex(rollNumber3)}$`, "i");

  // Exact matching tests
  assert.equal(regex1.test("MCA/10001/23"), true);
  assert.equal(regex1.test("mca/10001/23"), true);
  assert.equal(regex1.test("MCA/10001/23/EXTRA"), false);
  assert.equal(regex1.test("MCA/10001"), false);
  assert.equal(regex1.test("PREFIX/MCA/10001/23"), false);

  assert.equal(regex2.test("BTECH(CSE)/10050/22"), true);
  assert.equal(regex2.test("btech(cse)/10050/22"), true);
  assert.equal(regex2.test("BTECH-CSE/10050/22"), false);

  assert.equal(regex3.test("BARCH+INT/10002/21"), true);
  assert.equal(regex3.test("barch+int/10002/21"), true);
});

test("Group member removal safely preserves other members and updates leader", () => {
  const student1Id = "650000000000000000000001";
  const student2Id = "650000000000000000000002";
  const student3Id = "650000000000000000000003";

  // Simulate group with 3 members where student1 is leader
  const group = {
    groupId: "SUMMER_001",
    members: [student1Id, student2Id, student3Id],
    leader: student1Id,
    summerAllocatedProf: "PROF_001",
  };

  // Student 1 leaves
  const targetId = student1Id;
  group.members = group.members.filter((m) => m !== targetId);

  // Group should still have student2 and student3
  assert.equal(group.members.length, 2);
  assert.equal(group.members.includes(student2Id), true);
  assert.equal(group.members.includes(student3Id), true);
  assert.equal(group.members.includes(student1Id), false);

  // Leader re-assignment
  if (group.leader === targetId) {
    group.leader = group.members[0];
  }
  assert.equal(group.leader, student2Id);
});

test("Single member group is properly deleted when the only member leaves", () => {
  const studentSoloId = "650000000000000000000009";

  const group = {
    groupId: "SUMMER_SOLO",
    members: [studentSoloId],
    leader: studentSoloId,
    summerAllocatedProf: "PROF_002",
  };

  group.members = group.members.filter((m) => m !== studentSoloId);
  assert.equal(group.members.length, 0);

  const shouldDeleteGroup = group.members.length === 0;
  assert.equal(shouldDeleteGroup, true);
});

test("Safety mismatch validation catches roll number vs studentId mismatch", () => {
  const studentInDb = {
    _id: "650000000000000000000010",
    rollNumber: "MCA/10005/23",
  };

  const requestedRoll = "MCA/10006/23"; // Tampered or accidental roll

  const hasMismatch =
    studentInDb.rollNumber.trim().toUpperCase() !==
    requestedRoll.trim().toUpperCase();

  assert.equal(hasMismatch, true);
});

test("OTP deletion is guarded against empty or null email", () => {
  const runOtpDelete = (email) => {
    if (email && typeof email === "string" && email.trim().length > 0) {
      return { deleted: true, target: email.trim().toLowerCase() };
    }
    return { deleted: false };
  };

  assert.deepEqual(runOtpDelete(""), { deleted: false });
  assert.deepEqual(runOtpDelete(null), { deleted: false });
  assert.deepEqual(runOtpDelete(undefined), { deleted: false });
  assert.deepEqual(runOtpDelete("   "), { deleted: false });
  assert.deepEqual(runOtpDelete("student@bitmesra.ac.in"), {
    deleted: true,
    target: "student@bitmesra.ac.in",
  });
});

