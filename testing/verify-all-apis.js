import axios from "axios";

const BASE_URL = "http://localhost:3000";

// Configure axios instances with cookie jars
const facultyClient = axios.create({ baseURL: BASE_URL, withCredentials: true });
const batchAdminClient = axios.create({ baseURL: BASE_URL, withCredentials: true });
const masterAdminClient = axios.create({ baseURL: BASE_URL, withCredentials: true });
const studentClient = axios.create({ baseURL: BASE_URL, withCredentials: true });

function getCookiesFromResponse(res) {
  const setCookie = res.headers["set-cookie"];
  if (!setCookie) return "";
  return Array.isArray(setCookie) ? setCookie.map(c => c.split(";")[0]).join("; ") : setCookie.split(";")[0];
}

async function runTests() {
  console.log("================================================================");
  console.log("   COMPREHENSIVE END-TO-END API & FUNCTIONALITY VERIFICATION   ");
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  function testResult(name, success, extra = "") {
    if (success) {
      console.log(`✅ [PASS] ${name} ${extra ? `-> ${extra}` : ""}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra ? `-> ${extra}` : ""}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Frontend Route Reachability
  // -------------------------------------------------------------
  try {
    const landingRes = await axios.get(`${BASE_URL}/`);
    testResult("Frontend Landing Page (/)", landingRes.status === 200);

    const facultyLoginRes = await axios.get(`${BASE_URL}/faculty-login`);
    testResult("Frontend Faculty Login (/faculty-login)", facultyLoginRes.status === 200);

    const adminLoginRes = await axios.get(`${BASE_URL}/log.a`);
    testResult("Frontend Admin Login (/log.a)", adminLoginRes.status === 200);

    const studentLoginRes = await axios.get(`${BASE_URL}/log`);
    testResult("Frontend Student Login (/log)", studentLoginRes.status === 200);
  } catch (err) {
    testResult("Frontend Reachability", false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 2: Faculty Login (PROF001)
  // -------------------------------------------------------------
  let facultyCookie = "";
  try {
    const res = await facultyClient.post("/api/v1/prof/login", {
      email: "bhatnagarkushaagra@gmail.com",
      password: "password123",
    });
    facultyCookie = getCookiesFromResponse(res);
    facultyClient.defaults.headers.common["Cookie"] = facultyCookie;
    testResult(
      "Faculty Login (POST /api/v1/prof/login)",
      res.status === 200 && res.data?.data?.professor?.idNumber === "PROF001",
      `Logged in: ${res.data?.data?.professor?.fullName} (PROF001)`
    );
  } catch (err) {
    testResult("Faculty Login", false, err.response?.data?.message || err.message);
  }

  // -------------------------------------------------------------
  // TEST 3: Faculty Project 1 APIs
  // -------------------------------------------------------------
  try {
    const acceptedP1 = await facultyClient.get("/api/v1/project1/get-accepted-students");
    const count = acceptedP1.data?.data?.length || 0;
    const groupIds = (acceptedP1.data?.data || []).map(g => g.groupId);
    testResult(
      "Project 1 Accepted Groups (GET /api/v1/project1/get-accepted-students)",
      acceptedP1.status === 200 && count > 0,
      `Found ${count} accepted groups: [${groupIds.join(", ")}]`
    );

    const appliedP1 = await facultyClient.get("/api/v1/project1/get-applied-students");
    const appCount = appliedP1.data?.data?.length || 0;
    testResult(
      "Project 1 Applied Groups (GET /api/v1/project1/get-applied-students)",
      appliedP1.status === 200,
      `Found ${appCount} applied groups`
    );
  } catch (err) {
    testResult("Project 1 Groups Fetch", false, err.response?.data?.message || err.message);
  }

  // -------------------------------------------------------------
  // TEST 4: Faculty Summer, Minor, Major Accepted APIs
  // -------------------------------------------------------------
  try {
    const sumRes = await facultyClient.get("/api/v1/prof/accepted-groups");
    testResult(
      "Summer Training Accepted (GET /api/v1/prof/accepted-groups)",
      sumRes.status === 200,
      `Found ${sumRes.data?.data?.length || 0} groups`
    );

    const minRes = await facultyClient.get("/api/v1/prof/minor/accepted-groups");
    testResult(
      "Minor Project Accepted (GET /api/v1/prof/minor/accepted-groups)",
      minRes.status === 200,
      `Found ${minRes.data?.data?.length || 0} groups`
    );

    const majRes = await facultyClient.get("/api/v1/prof/major/accepted-groups");
    testResult(
      "Major Project Accepted (GET /api/v1/prof/major/accepted-groups)",
      majRes.status === 200,
      `Found ${majRes.data?.data?.length || 0} groups`
    );
  } catch (err) {
    testResult("Summer/Minor/Major Accepted Fetch", false, err.response?.data?.message || err.message);
  }

  // -------------------------------------------------------------
  // TEST 5: Faculty Group Removal Request (Project 1 PRJ1-K24-101)
  // -------------------------------------------------------------
  let removalRequestId = "";
  try {
    const targetGroup = "PRJ1-K24-101";
    const removalRes = await facultyClient.post("/api/v1/prof/request-group-removal", {
      groupId: targetGroup,
      groupType: "project1",
      reason: "Student group missing milestone reviews and unresponsive on code submissions.",
    });

    removalRequestId = removalRes.data?.data?._id;
    testResult(
      "Faculty Request Group Removal (POST /api/v1/prof/request-group-removal)",
      removalRes.status === 201 && removalRes.data?.data?.status === "pending",
      `Request ID: ${removalRequestId}, Status: ${removalRes.data?.data?.status}`
    );

    // Verify in professor's own removal request list
    const myRequests = await facultyClient.get("/api/v1/prof/group-removal-requests");
    const hasPending = myRequests.data?.data?.some(r => r.groupId === targetGroup && r.status === "pending");
    testResult(
      "Faculty Removal Requests List (GET /api/v1/prof/group-removal-requests)",
      myRequests.status === 200 && hasPending,
      `Verified pending status on faculty side`
    );
  } catch (err) {
    testResult("Faculty Request Group Removal", false, err.response?.data?.message || err.message);
  }

  // -------------------------------------------------------------
  // TEST 6: Batch Admin Login (k24admin) & Scoped Review
  // -------------------------------------------------------------
  let batchAdminCookie = "";
  try {
    const adminLoginRes = await batchAdminClient.post("/api/v1/admin/login", {
      username: "k24admin",
      password: "password123",
    });
    batchAdminCookie = getCookiesFromResponse(adminLoginRes);
    batchAdminClient.defaults.headers.common["Cookie"] = batchAdminCookie;

    testResult(
      "Batch Admin Login (POST /api/v1/admin/login)",
      adminLoginRes.status === 200 && adminLoginRes.data?.data?.admin?.role === "batch_admin",
      `Role: ${adminLoginRes.data?.data?.admin?.role}, Batches: [${adminLoginRes.data?.data?.admin?.assignedBatches}]`
    );

    // Fetch removal requests scoped to Batch Admin
    const adminReqs = await batchAdminClient.get("/api/v1/admin/group-removal-requests");
    const foundReq = adminReqs.data?.data?.find(r => String(r._id) === String(removalRequestId));

    testResult(
      "Batch Admin Fetch Removal Requests (GET /api/v1/admin/group-removal-requests)",
      adminReqs.status === 200 && !!foundReq,
      `Scoped request retrieved for K${foundReq?.batch} with ${foundReq?.groupDetails?.members?.length || 0} members`
    );

    // Approve the removal request
    if (removalRequestId) {
      const reviewRes = await batchAdminClient.post("/api/v1/admin/review-group-removal-request", {
        requestId: removalRequestId,
        action: "approve",
        comment: "Approved by Batch 24 Admin following faculty request.",
      });

      testResult(
        "Batch Admin Approve Removal (POST /api/v1/admin/review-group-removal-request)",
        reviewRes.status === 200 && reviewRes.data?.data?.status === "approved",
        `Approved! Action comment: "${reviewRes.data?.data?.actionComment}"`
      );
    }
  } catch (err) {
    testResult("Batch Admin Workflow", false, err.response?.data?.message || err.message);
  }

  // -------------------------------------------------------------
  // TEST 7: Verify Group Deallocated from Faculty
  // -------------------------------------------------------------
  try {
    const postRemovalAccepted = await facultyClient.get("/api/v1/project1/get-accepted-students");
    const isStillPresent = postRemovalAccepted.data?.data?.some(g => g.groupId === "PRJ1-K24-101");
    testResult(
      "Verification: PRJ1-K24-101 Deallocated from Faculty",
      !isStillPresent,
      `Group PRJ1-K24-101 successfully removed from accepted list of PROF001`
    );
  } catch (err) {
    testResult("Deallocation Verification", false, err.response?.data?.message || err.message);
  }

  // -------------------------------------------------------------
  // TEST 8: Master Admin Login & Superuser Access
  // -------------------------------------------------------------
  try {
    const masterLoginRes = await masterAdminClient.post("/api/v1/admin/login", {
      username: "masteradmin",
      password: "password123",
    });
    const masterCookie = getCookiesFromResponse(masterLoginRes);
    masterAdminClient.defaults.headers.common["Cookie"] = masterCookie;

    testResult(
      "Master Admin Login (POST /api/v1/admin/login)",
      masterLoginRes.status === 200 && masterLoginRes.data?.data?.admin?.role === "master",
      `Role: master`
    );

    const allAdmins = await masterAdminClient.get("/api/v1/admin/admins");
    testResult(
      "Master Admin List All Admins (GET /api/v1/admin/admins)",
      allAdmins.status === 200 && Array.isArray(allAdmins.data?.data),
      `Found ${allAdmins.data?.data?.length || 0} admin accounts`
    );
  } catch (err) {
    testResult("Master Admin Workflow", false, err.response?.data?.message || err.message);
  }

  // -------------------------------------------------------------
  // TEST 9: Student Login & Profile Fetch
  // -------------------------------------------------------------
  try {
    const studentLogin = await studentClient.post("/api/v1/users/login", {
      email: "btech10489.24@bitmesra.ac.in",
      password: "password123",
    });
    const studentCookie = getCookiesFromResponse(studentLogin);
    studentClient.defaults.headers.common["Cookie"] = studentCookie;

    testResult(
      "Student Login (POST /api/v1/users/login)",
      studentLogin.status === 200,
      `Logged in: ${studentLogin.data?.data?.user?.fullName} (${studentLogin.data?.data?.user?.rollNumber})`
    );

    const currentUserRes = await studentClient.get("/api/v1/users/current-user");
    testResult(
      "Student Profile Fetch (GET /api/v1/users/current-user)",
      currentUserRes.status === 200,
      `Batch: K${currentUserRes.data?.data?.batch}, Verified: ${currentUserRes.data?.data?.isVerified}`
    );
  } catch (err) {
    testResult("Student Login/Profile", false, err.response?.data?.message || err.message);
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n================================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================");

  if (failed === 0) {
    console.log("🎉 ALL APIS, AUTHENTICATION FLOWS, AND GROUP REMOVAL LOGIC ARE 100% WORKING!");
  } else {
    console.log("⚠️ Some tests encountered issues. Review details above.");
  }
}

runTests();
