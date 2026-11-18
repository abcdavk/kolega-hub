import type { RowDataPacket } from "mysql2";
import { ApiError, errorResponse, readJson, requireUser } from "@/lib/api";
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

type ProfileUpdateRow = RowDataPacket & Pick<ProfileRow, "name" | "division">;

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

export async function PATCH(request: Request) {
  try {
    const auth = await requireUser(request);
    const body = await readJson(request);
    const updates: string[] = [];
    const values: (string | null | number)[] = [];

    if ("name" in body) {
      if (typeof body.name !== "string") {
        throw new ApiError("Nama harus berupa teks.", 400);
      }
      const name = body.name.trim();
      if (!name || name.length > 100) {
        throw new ApiError("Nama wajib diisi (maksimal 100 karakter).", 400);
      }
      updates.push("name = ?");
      values.push(name);
    }

    let division: string | null | undefined;
    if ("division" in body) {
      if (body.division !== null && typeof body.division !== "string") {
        throw new ApiError("Division harus berupa teks.", 400);
      }
      division = typeof body.division === "string" ? body.division.trim() || null : null;
      if (division && division.length > 100) {
        throw new ApiError("Division maksimal 100 karakter.", 400);
      }
      updates.push("division = ?");
      values.push(division);
    }

    if (updates.length === 0) {
      throw new ApiError("Tidak ada data profil untuk diperbarui.", 400);
    }

    values.push(auth.id);
    await getDb().execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
    const [rows] = await getDb().execute<ProfileUpdateRow[]>(
      "SELECT name, division FROM users WHERE id = ? LIMIT 1",
      [auth.id],
    );
    if (!rows[0]) return Response.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    return Response.json({ name: rows[0].name, division: rows[0].division });
  } catch (error) {
    return errorResponse(error);
  }
}
