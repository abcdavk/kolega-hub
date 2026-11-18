import type { RowDataPacket } from "mysql2";
import { errorResponse, requireUser } from "@/lib/api";
import { getDb } from "@/lib/db";
import { milestoneRewardKarma, milestoneTargetPoints } from "@/lib/milestones";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    let rows: RowDataPacket[];
    if (authorization) {
      const auth = await requireUser(request);
      const [claimedRows] = await getDb().execute<RowDataPacket[]>(
        `SELECT COALESCE(MAX(m.level), 0) AS claimed_level
         FROM user_milestones um
         JOIN milestones m ON m.id = um.milestone_id
         WHERE um.user_id = ? AND um.is_claimed = 1`,
        [auth.id],
      );
      const nextLevel = Number(claimedRows[0]?.claimed_level ?? 0) + 1;
      await getDb().execute(
        `INSERT IGNORE INTO milestones (level, target_points, reward_karma)
         VALUES (?, ?, ?)`,
        [nextLevel, milestoneTargetPoints(nextLevel), milestoneRewardKarma(nextLevel)],
      );

      [rows] = await getDb().execute<RowDataPacket[]>(
        `SELECT m.id, m.level, m.reward_karma,
                COALESCE(um.is_claimed, 0) AS is_claimed,
                CASE WHEN um.id IS NULL THEN 0 ELSE 1 END AS is_assigned
         FROM milestones m
         LEFT JOIN user_milestones um
           ON um.milestone_id = m.id AND um.user_id = ?
         ORDER BY m.level`,
        [auth.id],
      );
    } else {
      [rows] = await getDb().execute<RowDataPacket[]>(
        "SELECT id, level, reward_karma FROM milestones ORDER BY level",
      );
    }

    const milestones = rows.map((row) => ({
      ...row,
      target_points: milestoneTargetPoints(Number(row.level)),
    }));
    return Response.json({ milestones });
  } catch (error) {
    return errorResponse(error);
  }
}
