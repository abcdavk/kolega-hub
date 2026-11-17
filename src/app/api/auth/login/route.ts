import { compare } from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { createToken, errorResponse, readJson, ApiError } from "@/lib/api";
import { getDb } from "@/lib/db";

type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      throw new ApiError("Email dan password wajib diisi.", 400);
    }

    const [rows] = await getDb().execute<UserRow[]>(
      "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    const user = rows[0];
    if (!user || !(await compare(password, user.password))) {
      throw new ApiError("Email atau password salah.", 401);
    }

    const token = await createToken(user);
    return Response.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
