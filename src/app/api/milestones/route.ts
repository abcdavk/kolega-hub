import type { RowDataPacket } from "mysql2";
import { errorResponse } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const [milestones] = await getDb().execute<RowDataPacket[]>(
      "SELECT id, level, target_points, reward_karma FROM milestones ORDER BY level",
    );
    return Response.json({ milestones });
  } catch (error) {
    return errorResponse(error);
  }
}
