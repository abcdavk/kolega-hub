import type { RowDataPacket } from "mysql2";
import { errorResponse, requireUser } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    let milestones: RowDataPacket[];
    const authorization = request.headers.get("authorization");

    if (authorization) {
      try {
        const auth = await requireUser(request);
        const [rows] = await getDb().execute<RowDataPacket[]>(
          `SELECT m.id, m.level, m.target_points, m.reward_karma,
                  COALESCE(um.is_claimed, 0) AS is_claimed,
                  CASE WHEN um.id IS NULL THEN 0 ELSE 1 END AS is_assigned
           FROM milestones m
           LEFT JOIN user_milestones um
             ON um.milestone_id = m.id AND um.user_id = ?
           ORDER BY m.level`,
          [auth.id],
        );
        milestones = rows;
      } catch {
        const [rows] = await getDb().execute<RowDataPacket[]>(
          "SELECT id, level, target_points, reward_karma FROM milestones ORDER BY level",
        );
        milestones = rows;
      }
    } else {
      const [rows] = await getDb().execute<RowDataPacket[]>(
        "SELECT id, level, target_points, reward_karma FROM milestones ORDER BY level",
      );
      milestones = rows;
    }

    return Response.json({ milestones });
  } catch (error) {
    return errorResponse(error);
  }
}
