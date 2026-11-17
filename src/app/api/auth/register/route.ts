import { hash } from "bcryptjs";
import type { ResultSetHeader } from "mysql2";
import { createToken, errorResponse, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || name.length > 100) {
      return Response.json({ error: "Nama wajib diisi (maksimal 100 karakter)." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
      return Response.json({ error: "Email tidak valid." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 72) {
      return Response.json({ error: "Password harus berisi 8–72 karakter." }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);
    const [result] = await getDb().execute<ResultSetHeader>(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, passwordHash],
    );
    const user = { id: result.insertId, name, email };
    const token = await createToken(user);
    return Response.json({ user, token }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    return errorResponse(error);
  }
}
