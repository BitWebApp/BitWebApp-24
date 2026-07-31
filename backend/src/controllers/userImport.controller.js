import crypto from "crypto";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseCSV, toCSV } from "../utils/csv.js";
import { buildWelcomeEmail, sendMail } from "../utils/mailer.js";

/** Hard cap so a single request can't fan out into thousands of mails. */
const MAX_ROWS = 500;

/** How many welcome mails are dispatched concurrently. */
const MAIL_CONCURRENCY = 5;

/** Users created here never upload an ID card, so a marker is stored instead. */
const IMPORTED_ID_CARD = "admin-onboarded";

/** Canonical CSV columns, in template order. */
const TEMPLATE_HEADERS = [
  "rollNumber",
  "fullName",
  "email",
  "batch",
  "branch",
  "section",
  "mobileNumber",
  "username",
];

/** Accepted header spellings mapped onto the canonical field names. */
const HEADER_ALIASES = {
  rollnumber: "rollNumber",
  rollno: "rollNumber",
  roll: "rollNumber",
  "roll number": "rollNumber",
  roll_number: "rollNumber",
  fullname: "fullName",
  name: "fullName",
  "full name": "fullName",
  full_name: "fullName",
  studentname: "fullName",
  email: "email",
  emailid: "email",
  "email id": "email",
  email_id: "email",
  mail: "email",
  batch: "batch",
  year: "batch",
  branch: "branch",
  department: "branch",
  dept: "branch",
  section: "section",
  sec: "section",
  mobilenumber: "mobileNumber",
  mobile: "mobileNumber",
  "mobile number": "mobileNumber",
  mobile_number: "mobileNumber",
  phone: "mobileNumber",
  contact: "mobileNumber",
  username: "username",
  userid: "username",
};

/**
 * Map a raw CSV row onto canonical field names.
 * @param {Record<string,string>} values
 * @returns {Record<string,string>}
 */
const normalizeRow = (values) => {
  const normalized = {};
  Object.entries(values).forEach(([rawKey, rawValue]) => {
    const key = HEADER_ALIASES[rawKey.trim().toLowerCase()];
    if (key && normalized[key] === undefined) {
      normalized[key] = (rawValue ?? "").trim();
    }
  });
  return normalized;
};

/**
 * Accepts 22, "22", "K22" or "2022" and returns the two digit batch number
 * this app stores (22 for K22).
 * @param {string|number} raw
 * @returns {number|null}
 */
const parseBatch = (raw) => {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return null;
  }
  const digits = String(raw).trim().replace(/^[kK]/, "");
  if (!/^\d+$/.test(digits)) return null;
  const value = Number(digits);
  if (value >= 1900 && value <= 2999) return value % 100;
  if (value >= 0 && value <= 99) return value;
  return null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Random, human-typeable temporary password.
 * @returns {string}
 */
const generatePassword = (length = 10) => {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += PASSWORD_ALPHABET[crypto.randomInt(PASSWORD_ALPHABET.length)];
  }
  return password;
};

/**
 * Validate and clean a single candidate record.
 * @param {Record<string,string>} raw
 * @returns {{ data: Record<string, any>, errors: string[] }}
 */
const validateRecord = (raw) => {
  const errors = [];

  const rollNumber = (raw.rollNumber || "").trim();
  const fullName = (raw.fullName || "").trim();
  const email = (raw.email || "").trim().toLowerCase();
  const batch = parseBatch(raw.batch);
  const branch = (raw.branch || "").trim();
  const section = (raw.section || "").trim();
  const mobileNumber = (raw.mobileNumber || "").replace(/[\s-]/g, "");
  // The model expects "roll number in small case without special chars",
  // so an omitted username is derived that way from the roll number.
  const username = (raw.username || "").trim()
    ? raw.username.trim().toLowerCase()
    : rollNumber.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!rollNumber) errors.push("rollNumber is required");
  if (!fullName) errors.push("fullName is required");
  if (!email) {
    errors.push("email is required");
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push("email is not a valid address");
  }
  if (batch === null) {
    errors.push("batch is required and must look like 22, K22 or 2022");
  }
  if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
    errors.push("mobileNumber must be exactly 10 digits");
  }
  if (rollNumber && !username) {
    errors.push(
      "username could not be derived from the roll number; add a username column"
    );
  } else if (username && !/^[a-z0-9._-]+$/.test(username)) {
    errors.push(
      "username may only contain letters, digits, dot, underscore or hyphen"
    );
  }

  return {
    data: {
      rollNumber,
      fullName,
      email,
      batch,
      branch,
      section,
      username,
      ...(mobileNumber ? { mobileNumber } : {}),
    },
    errors,
  };
};

/**
 * Batch admins may only onboard students into the batches assigned to them.
 * @param {object} admin
 * @param {number|null} batch
 * @returns {string|null} error message, or null when allowed
 */
const batchPermissionError = (admin, batch) => {
  if (!admin || admin.role === "master") return null;
  if (batch === null || batch === undefined) return null;
  if (!admin.assignedBatches?.length) {
    return "You have no batches assigned, so you cannot onboard students";
  }
  if (!admin.assignedBatches.includes(Number(batch))) {
    return `You don't have access to batch K${batch}`;
  }
  return null;
};

/**
 * Turn CSV text into per-row records annotated with validation status and
 * conflicts against both the file itself and the database.
 * @param {string} csvText
 * @param {object} admin
 * @returns {Promise<{ rows: Array<object>, summary: object }>}
 */
const analyseCsv = async (csvText, admin) => {
  const { headers, rows: rawRows } = parseCSV(csvText);

  if (rawRows.length === 0) {
    throw new ApiError(400, "The CSV file has no data rows");
  }
  if (rawRows.length > MAX_ROWS) {
    throw new ApiError(
      400,
      `The CSV has ${rawRows.length} rows; please split it into files of at most ${MAX_ROWS} rows`
    );
  }

  const recognised = headers
    .map((h) => HEADER_ALIASES[h.trim().toLowerCase()])
    .filter(Boolean);
  const missing = ["rollNumber", "fullName", "email", "batch"].filter(
    (field) => !recognised.includes(field)
  );
  if (missing.length) {
    throw new ApiError(
      400,
      `CSV is missing required column(s): ${missing.join(", ")}. Download the template for the expected format.`
    );
  }

  const rows = rawRows.map((row, index) => {
    const { data, errors } = validateRecord(normalizeRow(row.values));
    return {
      rowNumber: index + 1,
      lineNumber: row.lineNumber,
      data,
      errors,
    };
  });

  // Conflicts inside the uploaded file itself.
  const seen = { email: new Map(), rollNumber: new Map(), username: new Map() };
  rows.forEach((row) => {
    ["email", "rollNumber", "username"].forEach((field) => {
      const value = row.data[field];
      if (!value) return;
      const key = value.toLowerCase();
      if (seen[field].has(key)) {
        row.errors.push(
          `duplicate ${field} "${value}" (also on row ${seen[field].get(key)})`
        );
      } else {
        seen[field].set(key, row.rowNumber);
      }
    });
  });

  // Batch permissions.
  rows.forEach((row) => {
    const permissionError = batchPermissionError(admin, row.data.batch);
    if (permissionError) row.errors.push(permissionError);
  });

  // Conflicts against existing accounts.
  const emails = rows.map((r) => r.data.email).filter(Boolean);
  const rollNumbers = rows.map((r) => r.data.rollNumber).filter(Boolean);
  const usernames = rows.map((r) => r.data.username).filter(Boolean);

  const existing = await User.find({
    $or: [
      { email: { $in: emails } },
      { rollNumber: { $in: rollNumbers } },
      { username: { $in: usernames } },
    ],
  }).select("email rollNumber username");

  const existingEmails = new Set(existing.map((u) => u.email?.toLowerCase()));
  const existingRolls = new Set(existing.map((u) => u.rollNumber?.toLowerCase()));
  const existingUsernames = new Set(existing.map((u) => u.username?.toLowerCase()));

  rows.forEach((row) => {
    if (existingEmails.has(row.data.email)) {
      row.errors.push("an account with this email already exists");
    }
    if (existingRolls.has(row.data.rollNumber?.toLowerCase())) {
      row.errors.push("an account with this roll number already exists");
    }
    if (existingUsernames.has(row.data.username)) {
      row.errors.push("an account with this username already exists");
    }
  });

  rows.forEach((row) => {
    row.status = row.errors.length ? "invalid" : "ready";
  });

  return {
    rows,
    summary: {
      total: rows.length,
      ready: rows.filter((r) => r.status === "ready").length,
      invalid: rows.filter((r) => r.status === "invalid").length,
    },
  };
};

/**
 * Run an async worker over items with a bounded concurrency.
 * @param {Array} items
 * @param {number} limit
 * @param {(item: any) => Promise<any>} worker
 */
const runWithConcurrency = async (items, limit, worker) => {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index]);
    }
  });
  await Promise.all(runners);
};

/**
 * Create one student account and mail the credentials.
 * @param {Record<string, any>} data
 * @param {boolean} autoVerify
 * @param {boolean} sendEmail
 */
const createUserAndNotify = async (data, autoVerify, sendEmail) => {
  const password = generatePassword();

  const user = await User.create({
    username: data.username,
    password,
    fullName: data.fullName,
    rollNumber: data.rollNumber,
    email: data.email,
    branch: data.branch || "",
    section: data.section || "",
    ...(data.mobileNumber ? { mobileNumber: data.mobileNumber } : {}),
    batch: data.batch,
    idCard: IMPORTED_ID_CARD,
    isVerified: Boolean(autoVerify),
  });

  let mail = { sent: false, error: "email sending was skipped" };
  if (sendEmail) {
    const { subject, html } = buildWelcomeEmail({
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      password,
    });
    mail = await sendMail({ to: data.email, subject, html });
  }

  return { userId: user._id, mail };
};

/**
 * GET /api/v1/admin/user-import/template
 * Downloads a ready-to-fill CSV template.
 */
const downloadUserImportTemplate = asyncHandler(async (req, res) => {
  const sample = [
    {
      rollNumber: "BTECH/10001/22",
      fullName: "Asha Verma",
      email: "asha.verma@example.com",
      batch: "22",
      branch: "CSE",
      section: "A",
      mobileNumber: "9876543210",
      username: "btech1000122",
    },
    {
      rollNumber: "BTECH/10002/22",
      fullName: "Rahul Nair",
      email: "rahul.nair@example.com",
      batch: "K22",
      branch: "ECE",
      section: "B",
      mobileNumber: "",
      username: "",
    },
  ];

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="user-import-template.csv"'
  );
  return res.status(200).send(toCSV(TEMPLATE_HEADERS, sample));
});

/**
 * POST /api/v1/admin/user-import/preview
 * Dry run: validates the CSV without touching the database.
 */
const previewUserImport = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    throw new ApiError(400, "A CSV file is required");
  }

  const { rows, summary } = await analyseCsv(
    req.file.buffer.toString("utf-8"),
    req.admin
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { fileName: req.file.originalname, summary, rows },
        "CSV parsed successfully"
      )
    );
});

/**
 * POST /api/v1/admin/user-import/import
 * Creates every valid row and mails the generated credentials.
 * Invalid rows are skipped and reported back rather than failing the request.
 */
const importUsersFromCSV = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    throw new ApiError(400, "A CSV file is required");
  }

  const autoVerify = req.body.autoVerify !== "false";
  const sendEmail = req.body.sendEmail !== "false";

  const { rows } = await analyseCsv(req.file.buffer.toString("utf-8"), req.admin);

  const results = rows.map((row) => ({
    rowNumber: row.rowNumber,
    rollNumber: row.data.rollNumber,
    fullName: row.data.fullName,
    email: row.data.email,
    batch: row.data.batch,
    status: row.status === "ready" ? "pending" : "skipped",
    mailSent: false,
    message: row.errors.join("; "),
  }));

  const pending = results.filter((r) => r.status === "pending");

  await runWithConcurrency(pending, MAIL_CONCURRENCY, async (result) => {
    const row = rows.find((r) => r.rowNumber === result.rowNumber);
    try {
      const { mail } = await createUserAndNotify(row.data, autoVerify, sendEmail);
      result.status = "created";
      result.mailSent = mail.sent;
      result.message = mail.sent
        ? "Account created and credentials emailed"
        : `Account created, but the email failed: ${mail.error}`;
    } catch (error) {
      result.status = "failed";
      result.message = error?.message || "Failed to create the account";
    }
  });

  const summary = {
    total: results.length,
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    mailsSent: results.filter((r) => r.mailSent).length,
  };
  summary.mailsFailed = summary.created - summary.mailsSent;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { fileName: req.file.originalname, summary, results },
        `${summary.created} of ${summary.total} account(s) created`
      )
    );
});

/**
 * POST /api/v1/admin/user-import/register
 * Single student onboarding, same rules as a one row CSV.
 */
const registerUserByAdmin = asyncHandler(async (req, res) => {
  const { data, errors } = validateRecord({
    rollNumber: req.body.rollNumber,
    fullName: req.body.fullName,
    email: req.body.email,
    batch: req.body.batch,
    branch: req.body.branch,
    section: req.body.section,
    mobileNumber: req.body.mobileNumber,
    username: req.body.username,
  });

  if (errors.length) {
    throw new ApiError(400, errors.join("; "));
  }

  const permissionError = batchPermissionError(req.admin, data.batch);
  if (permissionError) {
    throw new ApiError(403, permissionError);
  }

  const existing = await User.findOne({
    $or: [
      { email: data.email },
      { rollNumber: data.rollNumber },
      { username: data.username },
    ],
  }).select("email rollNumber username");

  if (existing) {
    const clash =
      existing.email === data.email
        ? "email"
        : existing.rollNumber === data.rollNumber
          ? "roll number"
          : "username";
    throw new ApiError(409, `An account with this ${clash} already exists`);
  }

  const autoVerify = req.body.autoVerify !== false && req.body.autoVerify !== "false";
  const sendEmail = req.body.sendEmail !== false && req.body.sendEmail !== "false";

  const { userId, mail } = await createUserAndNotify(data, autoVerify, sendEmail);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        userId,
        rollNumber: data.rollNumber,
        email: data.email,
        batch: data.batch,
        isVerified: autoVerify,
        mailSent: mail.sent,
        mailError: mail.sent ? null : mail.error,
      },
      mail.sent
        ? "Account created and credentials emailed"
        : sendEmail
          ? `Account created, but the email failed: ${mail.error}`
          : "Account created"
    )
  );
});

export {
  downloadUserImportTemplate,
  importUsersFromCSV,
  previewUserImport,
  registerUserByAdmin,
};
