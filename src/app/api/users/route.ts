import type { RowDataPacket } from "mysql2";
import { errorResponse } from "@/lib/api";
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

export async function GET() {
  try {
    const [users] = await getDb().execute<UserSummary[]>(
      `SELECT u.id AS user_id, u.name, COUNT(r.id) AS total_reviews,
              ROUND(AVG(r.technical_score), 1) AS avg_technical,
              ROUND(AVG(r.collaboration_score), 1) AS avg_collaboration,
              ROUND(AVG(r.problem_solving_score), 1) AS avg_problem_solving,
              ROUND(AVG(r.mentorship_score), 1) AS avg_mentorship,
              ROUND(AVG((r.technical_score + r.collaboration_score +
                         r.problem_solving_score + r.mentorship_score) / 4), 1) AS avg_overall
       FROM users u LEFT JOIN reviews r ON r.reviewee_id = u.id
       GROUP BY u.id, u.name ORDER BY u.name`,
    );
    return Response.json({ users });
  } catch (error) {
    return errorResponse(error);
  }
}
