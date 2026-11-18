import type { RowDataPacket } from "mysql2";
import { ApiError, errorResponse, readJson, requireUser } from "@/lib/api";
import { getDb } from "@/lib/db";

type TitleIdRow = RowDataPacket & { id: number };

export async function PUT(request: Request) {
  let connection;
  try {
    const auth = await requireUser(request);
    const body = await readJson(request);
    if (
      !Array.isArray(body.title_ids) ||
      body.title_ids.length > 3 ||
      body.title_ids.some((id) => !Number.isSafeInteger(id) || Number(id) < 1)
    ) {
      throw new ApiError("title_ids harus berisi maksimal 3 ID title yang valid.", 400);
    }

    const titleIds = body.title_ids as number[];
    if (new Set(titleIds).size !== titleIds.length) {
      throw new ApiError("title_ids tidak boleh berisi duplikat.", 400);
    }

    connection = await getDb().getConnection();
    await connection.beginTransaction();

    if (titleIds.length > 0) {
      const placeholders = titleIds.map(() => "?").join(", ");
      const [titles] = await connection.execute<TitleIdRow[]>(
        `SELECT id FROM titles WHERE id IN (${placeholders})`,
        titleIds,
      );
      if (titles.length !== titleIds.length) {
        throw new ApiError("Satu atau lebih title tidak tersedia.", 400);
      }
    }

    await connection.execute(
      "UPDATE user_titles SET is_visible = 0, display_order = 0 WHERE user_id = ?",
      [auth.id],
    );

    if (titleIds.length > 0) {
      const values = titleIds.map(() => "(?, ?, 1, ?)").join(", ");
      const parameters = titleIds.flatMap((titleId, index) => [auth.id, titleId, index + 1]);
      await connection.execute(
        `INSERT INTO user_titles (user_id, title_id, is_visible, display_order)
         VALUES ${values}
         ON DUPLICATE KEY UPDATE is_visible = 1, display_order = VALUES(display_order)`,
        parameters,
      );
    }

    await connection.commit();
    return Response.json({ title_ids: titleIds });
  } catch (error) {
    if (connection) await connection.rollback();
    return errorResponse(error);
  } finally {
    connection?.release();
  }
}
