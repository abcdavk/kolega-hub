import type { RowDataPacket } from "mysql2";
import { ApiError, errorResponse, positiveId, requireUser } from "@/lib/api";
import { getDb } from "@/lib/db";

type UserExp = RowDataPacket & { feedback_exp: number };
type UserMilestone = RowDataPacket & {
  target_points: number;
  reward_karma: number;
  is_claimed: number;
};

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const auth = await requireUser(request);
    const milestoneId = positiveId((await context.params).id);
    connection = await getDb().getConnection();
    await connection.beginTransaction();

    const [users] = await connection.execute<UserExp[]>(
      "SELECT feedback_exp FROM users WHERE id = ? FOR UPDATE",
      [auth.id],
    );
    if (!users[0]) throw new ApiError("Pengguna tidak ditemukan.", 404);
    const [milestones] = await connection.execute<UserMilestone[]>(
      `SELECT m.target_points, m.reward_karma, um.is_claimed
       FROM milestones m
       JOIN user_milestones um ON um.milestone_id = m.id AND um.user_id = ?
       WHERE m.id = ?
       FOR UPDATE`,
      [auth.id, milestoneId],
    );
    const milestone = milestones[0];
    if (!milestone) throw new ApiError("Milestone tidak ditemukan untuk pengguna ini.", 404);
    if (milestone.is_claimed) throw new ApiError("Milestone sudah diklaim.", 409);
    if (users[0].feedback_exp < milestone.target_points) {
      throw new ApiError("Target feedback belum tercapai.", 409);
    }

    await connection.execute(
      `UPDATE user_milestones SET is_claimed = 1, claimed_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND milestone_id = ?`,
      [auth.id, milestoneId],
    );
    await connection.execute(
      "UPDATE users SET karma_balance = karma_balance + ? WHERE id = ?",
      [milestone.reward_karma, auth.id],
    );
    await connection.commit();
    return Response.json({ milestone_id: milestoneId, reward_karma: milestone.reward_karma });
  } catch (error) {
    if (connection) await connection.rollback();
    return errorResponse(error);
  } finally {
    connection?.release();
  }
}
