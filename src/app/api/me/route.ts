import type { RowDataPacket } from "mysql2";
import { errorResponse, requireUser } from "@/lib/api";
import { getDb } from "@/lib/db";

type ProfileRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  division: string | null;
  avatar_url: string | null;
  karma_balance: number;
  feedback_exp: number;
  created_at: Date;
};

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    const [rows] = await getDb().execute<ProfileRow[]>(
      `SELECT id, name, email, division, avatar_url, karma_balance, feedback_exp, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [auth.id],
    );
    if (!rows[0]) return Response.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    return Response.json({ user: rows[0] });
  } catch (error) {
    return errorResponse(error);
  }
}
