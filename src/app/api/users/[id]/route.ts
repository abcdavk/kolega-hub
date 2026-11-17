import type { RowDataPacket } from "mysql2";
import { errorResponse, positiveId } from "@/lib/api";
import { getDb } from "@/lib/db";

type UserSummary = RowDataPacket & {
  user_id: number;
  name: string;
  total_reviews: number;
  avg_technical: number | null;
  avg_collaboration: number | null;
  avg_problem_solving: number | null;
  avg_mentorship: number | null;
  avg_overall: number | null;
};

type TitleRow = RowDataPacket & {
  id: number;
  name: string;
  color_hex: string;
  is_visible: number;
  display_order: number;
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const id = positiveId((await context.params).id);
    const [users] = await getDb().execute<UserSummary[]>(
      `SELECT u.id AS user_id, u.name, COUNT(r.id) AS total_reviews,
              ROUND(AVG(r.technical_score), 1) AS avg_technical,
              ROUND(AVG(r.collaboration_score), 1) AS avg_collaboration,
              ROUND(AVG(r.problem_solving_score), 1) AS avg_problem_solving,
              ROUND(AVG(r.mentorship_score), 1) AS avg_mentorship,
              ROUND(AVG((r.technical_score + r.collaboration_score +
                         r.problem_solving_score + r.mentorship_score) / 4), 1) AS avg_overall
       FROM users u LEFT JOIN reviews r ON r.reviewee_id = u.id
       WHERE u.id = ? GROUP BY u.id, u.name LIMIT 1`,
      [id],
    );
    if (!users[0]) return Response.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });

    const [titles] = await getDb().execute<TitleRow[]>(
      `SELECT t.id, t.name, t.color_hex, ut.is_visible, ut.display_order
       FROM user_titles ut
       JOIN titles t ON t.id = ut.title_id
       WHERE ut.user_id = ?
       ORDER BY ut.is_visible DESC, ut.display_order, t.name`,
      [id],
    );
    return Response.json({ user: users[0], titles });
  } catch (error) {
    return errorResponse(error);
  }
}
