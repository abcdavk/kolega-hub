import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ApiError, errorResponse, positiveId, readJson, requireUser } from "@/lib/api";
import { getDb } from "@/lib/db";

type Redemption = RowDataPacket & {
  id: number;
  item_id: number;
  item_name: string;
  points_spent: number;
  status: "pending" | "completed" | "cancelled";
  redeemed_at: Date;
};

type UserBalance = RowDataPacket & { karma_balance: number };
type ShopItemForRedemption = RowDataPacket & {
  id: number;
  point_cost: number;
  stock: number;
};

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    const [redemptions] = await getDb().execute<Redemption[]>(
      `SELECT r.id, r.item_id, i.name AS item_name, r.points_spent, r.status, r.redeemed_at
       FROM redemptions r
       JOIN shop_items i ON i.id = r.item_id
       WHERE r.user_id = ?
       ORDER BY r.redeemed_at DESC
       LIMIT 100`,
      [auth.id],
    );
    return Response.json({ redemptions });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  let connection;
  try {
    const auth = await requireUser(request);
    const body = await readJson(request);
    const itemId = positiveId(String(body.item_id ?? ""));

    connection = await getDb().getConnection();
    await connection.beginTransaction();
    const [users] = await connection.execute<UserBalance[]>(
      "SELECT karma_balance FROM users WHERE id = ? FOR UPDATE",
      [auth.id],
    );
    if (!users[0]) throw new ApiError("Pengguna tidak ditemukan.", 404);
    const [items] = await connection.execute<ShopItemForRedemption[]>(
      "SELECT id, point_cost, stock FROM shop_items WHERE id = ? AND is_active = 1 FOR UPDATE",
      [itemId],
    );
    const item = items[0];
    if (!item) throw new ApiError("Item tidak ditemukan atau tidak aktif.", 404);
    if (item.stock < 1) throw new ApiError("Stok item habis.", 409);
    if (users[0].karma_balance < item.point_cost) {
      throw new ApiError("Saldo karma tidak mencukupi.", 409);
    }

    await connection.execute(
      "UPDATE users SET karma_balance = karma_balance - ? WHERE id = ?",
      [item.point_cost, auth.id],
    );
    await connection.execute("UPDATE shop_items SET stock = stock - 1 WHERE id = ?", [itemId]);
    const [result] = await connection.execute<ResultSetHeader>(
      "INSERT INTO redemptions (user_id, item_id, points_spent) VALUES (?, ?, ?)",
      [auth.id, itemId, item.point_cost],
    );
    await connection.commit();
    return Response.json(
      { redemption: { id: result.insertId, item_id: itemId, points_spent: item.point_cost, status: "pending" } },
      { status: 201 },
    );
  } catch (error) {
    if (connection) await connection.rollback();
    return errorResponse(error);
  } finally {
    connection?.release();
  }
}
