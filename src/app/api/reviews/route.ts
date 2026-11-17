import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ApiError, errorResponse, integerSetting, readJson, requireUser } from "@/lib/api";
import { getDb } from "@/lib/db";

type ReviewRow = RowDataPacket & {
  id: number;
  reviewer_id: number;
  reviewer_name: string;
  reviewee_id: number;
  reviewee_name: string;
  technical_score: number;
  collaboration_score: number;
  problem_solving_score: number;
  mentorship_score: number;
  comment: string | null;
  points_awarded: number;
  created_at: Date;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const revieweeId = url.searchParams.get("reviewee_id");
    const reviewerId = url.searchParams.get("reviewer_id");
    const conditions: string[] = [];
    const values: number[] = [];
    if (revieweeId) {
      const id = Number(revieweeId);
      if (!Number.isSafeInteger(id) || id < 1) throw new ApiError("reviewee_id tidak valid.", 400);
      conditions.push("r.reviewee_id = ?");
      values.push(id);
    }
    if (reviewerId) {
      const id = Number(reviewerId);
      if (!Number.isSafeInteger(id) || id < 1) throw new ApiError("reviewer_id tidak valid.", 400);
      conditions.push("r.reviewer_id = ?");
      values.push(id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [reviews] = await getDb().execute<ReviewRow[]>(
      `SELECT r.id, r.reviewer_id, reviewer.name AS reviewer_name,
              r.reviewee_id, reviewee.name AS reviewee_name,
              r.technical_score, r.collaboration_score, r.problem_solving_score,
              r.mentorship_score, r.comment, r.points_awarded, r.created_at
       FROM reviews r
       JOIN users reviewer ON reviewer.id = r.reviewer_id
       JOIN users reviewee ON reviewee.id = r.reviewee_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT 100`,
      values,
    );
    return Response.json({ reviews });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  let connection;
  try {
    const auth = await requireUser(request);
    const body = await readJson(request);
    const revieweeId = Number(body.reviewee_id);
    if (!Number.isSafeInteger(revieweeId) || revieweeId < 1) {
      throw new ApiError("reviewee_id tidak valid.", 400);
    }
    if (revieweeId === auth.id) throw new ApiError("Anda tidak dapat mengulas diri sendiri.", 400);

    const scoreFields = [
      ["technical_score", "technical_score"],
      ["collaboration_score", "collaboration_score"],
      ["problem_solving_score", "problem_solving_score"],
      ["mentorship_score", "mentorship_score"],
    ] as const;
    const scores = scoreFields.map(([key]) => Number(body[key]));
    if (scores.some((score) => !Number.isInteger(score) || score < 1 || score > 5)) {
      throw new ApiError("Semua nilai harus berupa bilangan bulat dari 1 sampai 5.", 400);
    }
    const comment =
      body.comment === undefined || body.comment === null
        ? null
        : typeof body.comment === "string"
          ? body.comment.trim()
          : (() => {
              throw new ApiError("comment harus berupa teks.", 400);
            })();
    if (comment && comment.length > 500) throw new ApiError("comment maksimal 500 karakter.", 400);

    const appreciationIds = body.appreciation_ids ?? [];
    if (
      !Array.isArray(appreciationIds) ||
      appreciationIds.some((id) => !Number.isSafeInteger(Number(id)) || Number(id) < 1)
    ) {
      throw new ApiError("appreciation_ids harus berupa daftar ID positif.", 400);
    }
    const uniqueAppreciationIds = [...new Set(appreciationIds.map(Number))];

    connection = await getDb().getConnection();
    await connection.beginTransaction();
    const [reviewee] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [revieweeId],
    );
    if (!reviewee[0]) throw new ApiError("Pengguna yang diulas tidak ditemukan.", 404);

    const cooldown = integerSetting("REVIEW_COOLDOWN_HOURS", 0);
    if (cooldown > 0) {
      const [recentReviews] = await connection.execute<RowDataPacket[]>(
        `SELECT id FROM reviews
         WHERE reviewer_id = ? AND reviewee_id = ?
           AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? HOUR)
         LIMIT 1`,
        [auth.id, revieweeId, cooldown],
      );
      if (recentReviews[0]) {
        throw new ApiError(`Anda baru saja mengulas kolega ini. Coba lagi setelah ${cooldown} jam.`, 409);
      }
    }

    if (uniqueAppreciationIds.length > 0) {
      const placeholders = uniqueAppreciationIds.map(() => "?").join(", ");
      const [appreciations] = await connection.execute<RowDataPacket[]>(
        `SELECT id FROM appreciations WHERE id IN (${placeholders})`,
        uniqueAppreciationIds,
      );
      if (appreciations.length !== uniqueAppreciationIds.length) {
        throw new ApiError("Satu atau lebih appreciation tidak ditemukan.", 400);
      }
    }

    const points = 250;
    const feedbackExp = integerSetting("FEEDBACK_EXP_PER_REVIEW", 10);
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO reviews
       (reviewer_id, reviewee_id, technical_score, collaboration_score,
        problem_solving_score, mentorship_score, comment, points_awarded)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [auth.id, revieweeId, ...scores, comment, points],
    );
    if (uniqueAppreciationIds.length > 0) {
      const appreciationValues = uniqueAppreciationIds.map((id) => [result.insertId, id]);
      await connection.query(
        "INSERT INTO review_appreciations (review_id, appreciation_id) VALUES ?",
        [appreciationValues],
      );
    }
    await connection.execute(
      `UPDATE users
       SET karma_balance = karma_balance + ?, feedback_exp = feedback_exp + ?
       WHERE id = ?`,
      [points, feedbackExp, auth.id],
    );
    await connection.execute(
      `INSERT IGNORE INTO user_milestones (user_id, milestone_id)
       SELECT ?, id FROM milestones
       WHERE target_points <= (SELECT feedback_exp FROM users WHERE id = ?)`,
      [auth.id, auth.id],
    );
    await connection.commit();
    return Response.json({ id: result.insertId, points_awarded: points }, { status: 201 });
  } catch (error) {
    if (connection) await connection.rollback();
    return errorResponse(error);
  } finally {
    connection?.release();
  }
}
