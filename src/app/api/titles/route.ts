import type { RowDataPacket } from "mysql2";
import { errorResponse } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const [titles] = await getDb().execute<RowDataPacket[]>(
      "SELECT id, name, color_hex FROM titles ORDER BY name",
    );
    return Response.json({ titles });
  } catch (error) {
    return errorResponse(error);
  }
}
