import { ArchivedBatch } from "../models/archivedBatch.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  DEFAULT_PROGRAM,
  PROGRAM_VALUES,
  parseProgram,
  programLabel,
  programYears,
} from "../utils/programs.js";
import { getStudentYear } from "../utils/studentYear.js";

/**
 * Archived batches as a Set of "PROGRAM|batch" keys.
 * @returns {Promise<Set<string>>}
 */
export const getArchivedBatchKeys = async () => {
  const archived = await ArchivedBatch.find().select("program batch");
  return new Set(archived.map((a) => `${a.program}|${a.batch}`));
};

/**
 * GET /api/v1/batches
 *
 * Every program and batch that has students, newest first, with the year
 * of study, whether it has passed out and whether it is archived. Used by
 * filters across admin and faculty pages, so it needs no login (it holds
 * no personal data).
 */
const listBatches = asyncHandler(async (req, res) => {
  const [counts, archivedKeys] = await Promise.all([
    User.aggregate([
      { $match: { batch: { $ne: null } } },
      {
        $group: {
          _id: {
            program: { $ifNull: ["$program", DEFAULT_PROGRAM] },
            batch: "$batch",
          },
          students: { $sum: 1 },
        },
      },
    ]),
    getArchivedBatchKeys(),
  ]);

  const batches = counts
    .map(({ _id, students }) => {
      const year = getStudentYear(_id.batch);
      const years = programYears(_id.program);
      return {
        program: _id.program,
        programLabel: programLabel(_id.program),
        batch: _id.batch,
        students,
        year,
        passedOut: year > years,
        archived: archivedKeys.has(`${_id.program}|${_id.batch}`),
      };
    })
    .sort(
      (a, b) =>
        PROGRAM_VALUES.indexOf(a.program) - PROGRAM_VALUES.indexOf(b.program) ||
        b.batch - a.batch
    );

  return res.status(200).json(new ApiResponse(200, batches, "Batches fetched"));
});

const readBatchBody = (body) => {
  const program = parseProgram(body.program);
  const batch = Number(String(body.batch ?? "").replace(/^[kK]/, ""));
  if (!program) throw new ApiError(400, "Choose a program");
  if (!body.batch || Number.isNaN(batch)) {
    throw new ApiError(400, "Batch must look like 22 or K22");
  }
  return { program, batch };
};

/**
 * POST /api/v1/batches/archive   Body: { program, batch }   (master admin)
 */
const archiveBatch = asyncHandler(async (req, res) => {
  const { program, batch } = readBatchBody(req.body);
  await ArchivedBatch.updateOne(
    { program, batch },
    { $setOnInsert: { program, batch, archivedBy: req.admin._id } },
    { upsert: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { program, batch, archived: true },
        `${programLabel(program)} K${batch} archived`
      )
    );
});

/**
 * POST /api/v1/batches/unarchive   Body: { program, batch }   (master admin)
 */
const unarchiveBatch = asyncHandler(async (req, res) => {
  const { program, batch } = readBatchBody(req.body);
  await ArchivedBatch.deleteOne({ program, batch });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { program, batch, archived: false },
        `${programLabel(program)} K${batch} is active again`
      )
    );
});

export { archiveBatch, listBatches, unarchiveBatch };
