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

/** How many accounts are written concurrently. */
const CREATE_CONCURRENCY = 5;

/**
 * The mail provider caps how many messages we may send per rolling window.
 * Both are configurable so ops can raise them without a code change.
 */
const MAIL_LIMIT = Number(process.env.ONBOARDING_MAIL_LIMIT || 100);
const MAIL_WINDOW_HOURS = Number(process.env.ONBOARDING_MAIL_WINDOW_HOURS || 24);

/** Users created here never upload an ID card, so a marker is stored instead. */
const IMPORTED_ID_CARD = "admin-onboarded";

/** Canonical CSV columns, in template order. */
const TEMPLATE_HEADERS = [
  "rollNumber",
  "fullName",
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

/**
 * Derive the institute email from a roll number.
 * Format: <roll number without slashes, lowercase>.<2-digit batch year>@bitmesra.ac.in
 * Example: BTECH/10322/23 → btech10322.23@bitmesra.ac.in
 * @param {string} rollNumber
 * @returns {string|null}
 */
const deriveInstituteEmail = (rollNumber) => {
  if (!rollNumber) return null;
  // Split by '/' to separate parts
  const parts = rollNumber.trim().split("/");
  if (parts.length < 2) return null;

  // Last part is the batch year (2-digit)
  const batchYear = parts[parts.length - 1].trim();
  // Everything before the last part, joined without slashes, lowercased
  const prefix = parts
    .slice(0, -1)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (!prefix || !batchYear) return null;
  return `${prefix}.${batchYear}@bitmesra.ac.in`;
};

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
  // Auto-derive institute email from roll number
  const email = deriveInstituteEmail(rollNumber);
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
    errors.push("could not derive institute email from rollNumber; expected format like BTECH/1XXXX/YY");
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push("derived institute email is not valid — check rollNumber format");
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
  const missing = ["rollNumber", "fullName", "batch"].filter(
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
 * How many welcome mails were sent inside the current rolling window, and how
 * many the provider still allows. Only onboarding mails are counted - OTP and
 * verification mails sent elsewhere are not visible here.
 * @returns {Promise<{ limit: number, used: number, remaining: number, windowHours: number, resetsAt: Date|null }>}
 */
const getMailQuota = async () => {
  const since = new Date(Date.now() - MAIL_WINDOW_HOURS * 60 * 60 * 1000);
  const used = await User.countDocuments({
    "onboarding.welcomeMailSentAt": { $gte: since },
  });

  // The window frees up again when the oldest send inside it ages out.
  const oldest = await User.findOne({
    "onboarding.welcomeMailSentAt": { $gte: since },
  })
    .sort({ "onboarding.welcomeMailSentAt": 1 })
    .select("onboarding.welcomeMailSentAt");

  const oldestSentAt = oldest?.onboarding?.welcomeMailSentAt || null;

  return {
    limit: MAIL_LIMIT,
    used,
    remaining: Math.max(0, MAIL_LIMIT - used),
    windowHours: MAIL_WINDOW_HOURS,
    resetsAt: oldestSentAt
      ? new Date(oldestSentAt.getTime() + MAIL_WINDOW_HOURS * 60 * 60 * 1000)
      : null,
  };
};

/**
 * Create one student account, queued for a welcome mail.
 * No mail is sent here - see sendWelcomeMailToUser.
 * @param {Record<string, any>} data
 * @param {boolean} autoVerify
 * @param {string} [adminId]
 * @returns {Promise<import("mongoose").Document>}
 */
const createUser = async (data, autoVerify, adminId) =>
  User.create({
    username: data.username,
    // Replaced by a freshly generated one the moment the welcome mail goes
    // out, so no password we have ever shown anybody is left sitting here.
    password: generatePassword(),
    fullName: data.fullName,
    rollNumber: data.rollNumber,
    email: data.email,
    branch: data.branch || "",
    section: data.section || "",
    ...(data.mobileNumber ? { mobileNumber: data.mobileNumber } : {}),
    batch: data.batch,
    idCard: IMPORTED_ID_CARD,
    isVerified: Boolean(autoVerify),
    onboarding: {
      isAdminOnboarded: true,
      welcomeMailStatus: "pending",
      onboardedAt: new Date(),
      onboardedBy: adminId || null,
    },
  });

/**
 * Rotate the account's password and mail the new credentials.
 *
 * The password is generated at send time rather than at creation time so no
 * plaintext password is ever stored while an account waits in the queue. The
 * rotation is saved *before* the mail goes out, so a crash mid-send can only
 * leave an undelivered password behind - never a delivered one that doesn't
 * work. Retrying simply rotates again, which is safe because the account has
 * not been used yet.
 *
 * @param {import("mongoose").Document} user
 * @returns {Promise<{ sent: boolean, error?: string }>}
 */
const sendWelcomeMailToUser = async (user) => {
  const password = generatePassword();

  user.password = password; // hashed by the schema's pre-save hook
  user.onboarding.welcomeMailAttempts =
    (user.onboarding.welcomeMailAttempts || 0) + 1;
  await user.save({ validateBeforeSave: false });

  const { subject, html } = buildWelcomeEmail({
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    password,
  });
  const mail = await sendMail({ to: user.email, subject, html });

  if (mail.sent) {
    user.onboarding.welcomeMailStatus = "sent";
    user.onboarding.welcomeMailSentAt = new Date();
    user.onboarding.welcomeMailError = "";
  } else {
    user.onboarding.welcomeMailStatus = "failed";
    user.onboarding.welcomeMailError = mail.error || "unknown error";
  }
  await user.save({ validateBeforeSave: false });

  return mail;
};

/**
 * Restrict a query to the batches a non-master admin may act on.
 * @param {object} admin
 * @param {object} filter
 * @returns {object}
 */
const scopeToAdminBatches = (admin, filter) => {
  if (!admin || admin.role === "master") return filter;
  return { ...filter, batch: { $in: admin.assignedBatches || [] } };
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
      batch: "22",
      branch: "CSE",
      section: "A",
      mobileNumber: "9876543210",
      username: "btech1000122",
    },
    {
      rollNumber: "BTECH/10002/22",
      fullName: "Rahul Nair",
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
 *
 * Creates every valid row. Accounts are always created - mailing is a separate,
 * quota-bounded step. If the admin asked to mail immediately, as many of the
 * new accounts as the remaining quota allows are mailed now (optionally capped
 * further by mailLimit); the rest stay queued and can be sent later from the
 * pending list. Invalid rows are skipped and reported rather than failing the
 * request.
 */
const importUsersFromCSV = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    throw new ApiError(400, "A CSV file is required");
  }

  const autoVerify = req.body.autoVerify !== "false";
  const sendEmail = req.body.sendEmail !== "false";
  const requestedMailLimit =
    req.body.mailLimit === undefined || req.body.mailLimit === ""
      ? null
      : Number(req.body.mailLimit);

  if (
    requestedMailLimit !== null &&
    (Number.isNaN(requestedMailLimit) || requestedMailLimit < 0)
  ) {
    throw new ApiError(400, "mailLimit must be a non-negative number");
  }

  const { rows } = await analyseCsv(req.file.buffer.toString("utf-8"), req.admin);

  const results = rows.map((row) => ({
    rowNumber: row.rowNumber,
    rollNumber: row.data.rollNumber,
    fullName: row.data.fullName,
    email: row.data.email,
    batch: row.data.batch,
    status: row.status === "ready" ? "pending" : "skipped",
    mailStatus: row.status === "ready" ? "queued" : "not_created",
    mailSent: false,
    message: row.errors.join("; "),
  }));

  const toCreate = results.filter((r) => r.status === "pending");
  const created = [];

  await runWithConcurrency(toCreate, CREATE_CONCURRENCY, async (result) => {
    const row = rows.find((r) => r.rowNumber === result.rowNumber);
    try {
      const user = await createUser(row.data, autoVerify, req.admin?._id);
      result.status = "created";
      result.userId = user._id;
      result.message = "Account created, welcome email queued";
      created.push({ result, user });
    } catch (error) {
      result.status = "failed";
      result.mailStatus = "not_created";
      result.message = error?.message || "Failed to create the account";
    }
  });

  // Mail phase: bounded by the provider quota, in CSV order so the admin can
  // predict who gets contacted first.
  const quotaBefore = await getMailQuota();
  let mailBudget = 0;
  if (sendEmail) {
    mailBudget = Math.min(
      quotaBefore.remaining,
      requestedMailLimit === null ? Infinity : requestedMailLimit
    );
  }

  const toMail = created
    .sort((a, b) => a.result.rowNumber - b.result.rowNumber)
    .slice(0, mailBudget);

  await runWithConcurrency(toMail, MAIL_CONCURRENCY, async ({ result, user }) => {
    const mail = await sendWelcomeMailToUser(user);
    result.mailSent = mail.sent;
    result.mailStatus = mail.sent ? "sent" : "failed";
    result.message = mail.sent
      ? "Account created and credentials emailed"
      : `Account created, but the email failed: ${mail.error}`;
  });

  const summary = {
    total: results.length,
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    mailsSent: results.filter((r) => r.mailSent).length,
    mailsFailed: results.filter((r) => r.mailStatus === "failed").length,
    stillQueued: results.filter((r) => r.mailStatus === "queued").length,
  };

  const quota = await getMailQuota();

  let message = `${summary.created} of ${summary.total} account(s) created`;
  if (summary.stillQueued > 0) {
    message += `; ${summary.stillQueued} welcome email(s) queued for a later batch`;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { fileName: req.file.originalname, summary, results, quota },
        message
      )
    );
});

/**
 * GET /api/v1/admin/user-import/pending
 *
 * The welcome-mail queue: accounts that exist but have not been mailed yet
 * (or whose mail failed), plus the current provider quota. Batch admins only
 * ever see their own batches.
 *
 * Query: status=pending|failed|sent|all, batch, search, page, limit
 */
const listPendingWelcomeMails = asyncHandler(async (req, res) => {
  const status = req.query.status || "unsent";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));

  const statusFilter =
    status === "all"
      ? { $in: ["pending", "failed", "sent"] }
      : status === "unsent"
        ? { $in: ["pending", "failed"] }
        : status;

  let filter = scopeToAdminBatches(req.admin, {
    "onboarding.welcomeMailStatus": statusFilter,
  });

  if (req.query.batch) {
    const batch = parseBatch(req.query.batch);
    if (batch === null) {
      throw new ApiError(400, "batch must look like 22, K22 or 2022");
    }
    const permissionError = batchPermissionError(req.admin, batch);
    if (permissionError) throw new ApiError(403, permissionError);
    filter.batch = batch;
  }

  if (req.query.search) {
    const term = String(req.query.search).trim();
    // Escaped so a stray "(" in the search box can't throw a regex error.
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { fullName: { $regex: safe, $options: "i" } },
      { rollNumber: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
    ];
  }

  const [users, total, quota] = await Promise.all([
    User.find(filter)
      .select("fullName rollNumber email batch branch section isVerified onboarding createdAt")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
    getMailQuota(),
  ]);

  const countsBase = scopeToAdminBatches(req.admin, {});
  const [pendingCount, failedCount, sentCount] = await Promise.all([
    User.countDocuments({ ...countsBase, "onboarding.welcomeMailStatus": "pending" }),
    User.countDocuments({ ...countsBase, "onboarding.welcomeMailStatus": "failed" }),
    User.countDocuments({ ...countsBase, "onboarding.welcomeMailStatus": "sent" }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        counts: {
          pending: pendingCount,
          failed: failedCount,
          sent: sentCount,
          unsent: pendingCount + failedCount,
        },
        quota,
      },
      "Welcome mail queue fetched"
    )
  );
});

/**
 * POST /api/v1/admin/user-import/send-mails
 *
 * Sends welcome mails to an explicit set of users, or to the next N in the
 * queue (oldest first). Never exceeds the provider quota - the request is
 * trimmed to what is left in the window and the response says how many were
 * dropped. Each successful send flips the account to "sent" so it drops out
 * of the queue and is never mailed twice.
 *
 * Body: { userIds?: string[], count?: number, includeFailed?: boolean }
 */
const sendWelcomeMails = asyncHandler(async (req, res) => {
  const { userIds, count, includeFailed = true } = req.body;

  const eligibleStatuses = includeFailed ? ["pending", "failed"] : ["pending"];
  const quota = await getMailQuota();

  if (quota.remaining <= 0) {
    throw new ApiError(
      429,
      `The ${quota.windowHours}h email quota of ${quota.limit} is used up. ${
        quota.resetsAt
          ? `Capacity frees up from ${quota.resetsAt.toISOString()}.`
          : ""
      }`
    );
  }

  let targets;
  if (Array.isArray(userIds) && userIds.length > 0) {
    targets = await User.find(
      scopeToAdminBatches(req.admin, {
        _id: { $in: userIds },
        "onboarding.welcomeMailStatus": { $in: eligibleStatuses },
      })
    ).sort({ createdAt: 1 });
  } else {
    const requested = Number(count);
    if (!requested || Number.isNaN(requested) || requested < 1) {
      throw new ApiError(
        400,
        "Provide either userIds or a positive count of users to mail"
      );
    }
    targets = await User.find(
      scopeToAdminBatches(req.admin, {
        "onboarding.welcomeMailStatus": { $in: eligibleStatuses },
      })
    )
      .sort({ createdAt: 1 })
      .limit(Math.min(requested, quota.remaining));
  }

  if (targets.length === 0) {
    throw new ApiError(
      404,
      "No matching accounts are waiting for a welcome email"
    );
  }

  const selected = targets.slice(0, quota.remaining);
  const droppedForQuota = targets.length - selected.length;

  const results = selected.map((user) => ({
    userId: user._id,
    rollNumber: user.rollNumber,
    fullName: user.fullName,
    email: user.email,
    batch: user.batch,
    status: "pending",
    message: "",
  }));

  await runWithConcurrency(selected, MAIL_CONCURRENCY, async (user) => {
    const result = results.find(
      (r) => r.userId.toString() === user._id.toString()
    );
    try {
      const mail = await sendWelcomeMailToUser(user);
      result.status = mail.sent ? "sent" : "failed";
      result.message = mail.sent
        ? "Credentials emailed"
        : `Email failed: ${mail.error}`;
    } catch (error) {
      result.status = "failed";
      result.message = error?.message || "Failed to send the email";
    }
  });

  const summary = {
    attempted: results.length,
    sent: results.filter((r) => r.status === "sent").length,
    failed: results.filter((r) => r.status === "failed").length,
    droppedForQuota,
  };

  const quotaAfter = await getMailQuota();

  let message = `${summary.sent} welcome email(s) sent`;
  if (droppedForQuota > 0) {
    message += `; ${droppedForQuota} left queued because the ${quota.windowHours}h quota of ${quota.limit} was reached`;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { summary, results, quota: quotaAfter }, message));
});

/**
 * GET /api/v1/admin/user-import/quota
 * Just the current mail allowance, for polling the UI banner.
 */
const getMailQuotaStatus = asyncHandler(async (req, res) => {
  const quota = await getMailQuota();
  return res
    .status(200)
    .json(new ApiResponse(200, quota, "Mail quota fetched"));
});

/**
 * POST /api/v1/admin/user-import/register
 * Single student onboarding, same rules as a one row CSV.
 */
const registerUserByAdmin = asyncHandler(async (req, res) => {
  const { data, errors } = validateRecord({
    rollNumber: req.body.rollNumber,
    fullName: req.body.fullName,
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

  const user = await createUser(data, autoVerify, req.admin?._id);

  // A single account still respects the quota; if there is no room it simply
  // stays queued instead of failing the creation.
  const quotaBefore = await getMailQuota();
  let mail = { sent: false, error: null };
  let mailStatus = "queued";

  if (sendEmail && quotaBefore.remaining > 0) {
    mail = await sendWelcomeMailToUser(user);
    mailStatus = mail.sent ? "sent" : "failed";
  } else if (sendEmail) {
    mail.error = `the ${quotaBefore.windowHours}h email quota of ${quotaBefore.limit} is used up`;
  }

  const messages = {
    sent: "Account created and credentials emailed",
    failed: `Account created, but the email failed: ${mail.error}`,
    queued: sendEmail
      ? `Account created and queued - ${mail.error}. Send it from the Welcome Emails tab once quota frees up.`
      : "Account created, welcome email queued",
  };

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        userId: user._id,
        rollNumber: data.rollNumber,
        email: data.email,
        batch: data.batch,
        isVerified: autoVerify,
        mailStatus,
        mailSent: mail.sent,
        mailError: mail.sent ? null : mail.error,
        quota: await getMailQuota(),
      },
      messages[mailStatus]
    )
  );
});

export {
  downloadUserImportTemplate,
  getMailQuotaStatus,
  importUsersFromCSV,
  listPendingWelcomeMails,
  previewUserImport,
  registerUserByAdmin,
  sendWelcomeMails,
};
