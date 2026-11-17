import type { RowDataPacket } from "mysql2";
import { errorResponse } from "@/lib/api";
import { getDb } from "@/lib/db";

type UserSummary = RowDataPacket & {
  user_id: number;
  name: string;
  division: string | null;
  avatar_url: string | null;
  total_reviews: number | string;
  avg_technical: number | string | null;
  avg_collaboration: number | string | null;
  avg_problem_solving: number | string | null;
  avg_mentorship: number | string | null;
  avg_overall: number | string | null;
};

type VisibleTitle = RowDataPacket & {
  user_id: number;
  name: string;
};

export async function GET() {
  try {
    const [users] = await getDb().execute<UserSummary[]>(
      `SELECT u.id AS user_id, u.name, u.division, u.avatar_url,
              COUNT(r.id) AS total_reviews,
              ROUND(AVG(r.technical_score), 1) AS avg_technical,
              ROUND(AVG(r.collaboration_score), 1) AS avg_collaboration,
              ROUND(AVG(r.problem_solving_score), 1) AS avg_problem_solving,
              ROUND(AVG(r.mentorship_score), 1) AS avg_mentorship,
              ROUND(AVG((r.technical_score + r.collaboration_score +
                         r.problem_solving_score + r.mentorship_score) / 4), 1) AS avg_overall
       FROM users u LEFT JOIN reviews r ON r.reviewee_id = u.id
       GROUP BY u.id, u.name, u.division, u.avatar_url ORDER BY u.name`,
    );

    const titlesByUser = new Map<number, string[]>();
    if (users.length > 0) {
      const userIds = users.map((user) => user.user_id);
      const [titles] = await getDb().execute<VisibleTitle[]>(
        `SELECT ut.user_id, t.name
         FROM user_titles ut
         JOIN titles t ON t.id = ut.title_id
         WHERE ut.is_visible = 1 AND ut.user_id IN (${userIds.map(() => "?").join(", ")})
         ORDER BY ut.user_id, ut.display_order, t.name`,
        userIds,
      );
      for (const title of titles) {
        const userTitles = titlesByUser.get(title.user_id) ?? [];
        userTitles.push(title.name);
        titlesByUser.set(title.user_id, userTitles);
      }
    }

    return Response.json({
      users: users.map((user) => ({
        ...user,
        total_reviews: Number(user.total_reviews),
        avg_technical: user.avg_technical === null ? null : Number(user.avg_technical),
        avg_collaboration: user.avg_collaboration === null ? null : Number(user.avg_collaboration),
        avg_problem_solving: user.avg_problem_solving === null ? null : Number(user.avg_problem_solving),
        avg_mentorship: user.avg_mentorship === null ? null : Number(user.avg_mentorship),
        avg_overall: user.avg_overall === null ? null : Number(user.avg_overall),
        titles: titlesByUser.get(user.user_id) ?? [],
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
