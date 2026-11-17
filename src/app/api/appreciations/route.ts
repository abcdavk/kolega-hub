import type { RowDataPacket } from "mysql2";
import { errorResponse } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const [appreciations] = await getDb().execute<RowDataPacket[]>(
      "SELECT id, label FROM appreciations ORDER BY label",
    );
    return Response.json({ appreciations });
  } catch (error) {
    return errorResponse(error);
  }
}
