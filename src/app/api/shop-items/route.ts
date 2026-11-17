import type { RowDataPacket } from "mysql2";
import { errorResponse } from "@/lib/api";
import { getDb } from "@/lib/db";

type ShopItem = RowDataPacket & {
  id: number;
  name: string;
  image_url: string | null;
  point_cost: number;
  stock: number;
};

export async function GET() {
  try {
    const [items] = await getDb().execute<ShopItem[]>(
      `SELECT id, name, image_url, point_cost, stock
       FROM shop_items WHERE is_active = 1 ORDER BY id`,
    );
    return Response.json({ items });
  } catch (error) {
    return errorResponse(error);
  }
}
