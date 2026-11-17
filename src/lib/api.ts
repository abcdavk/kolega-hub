import { jwtVerify, SignJWT } from "jose";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function jwtKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(user: { id: number; email: string }) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtKey());
}

export async function requireUser(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    throw new ApiError("Bearer token diperlukan.", 401);
  }

  try {
    const { payload } = await jwtVerify(token, jwtKey());
    const id = Number(payload.sub);
    if (!Number.isSafeInteger(id) || id < 1) {
      throw new ApiError("Token tidak valid.", 401);
    }
    return { id, email: typeof payload.email === "string" ? payload.email : "" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Token tidak valid atau kedaluwarsa.", 401);
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new ApiError("Body harus berupa JSON yang valid.", 400);
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError("Body harus berupa object JSON.", 400);
  }
  return value as Record<string, unknown>;
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("API request failed:", error);
  return Response.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
}

export function positiveId(value: string) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ApiError("ID harus berupa bilangan bulat positif.", 400);
  }
  return id;
}

export function integerSetting(name: string, defaultValue: number) {
  const value = Number(process.env[name] ?? defaultValue);
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }
  return value;
}
