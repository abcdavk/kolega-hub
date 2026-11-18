import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import type { ResultSetHeader } from "mysql2";
import { join } from "node:path";
import { ApiError, errorResponse, requireUser } from "@/lib/api";
import { getDb } from "@/lib/db";

const maxAvatarSize = 5 * 1024 * 1024;
const allowedTypes = {
  "image/jpeg": { extension: "jpg", signature: (bytes: Buffer) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: "png", signature: (bytes: Buffer) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { extension: "webp", signature: (bytes: Buffer) => bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" },
};

export async function POST(request: Request) {
  let uploadedPath: string | null = null;
  try {
    const auth = await requireUser(request);
    const formData = await request.formData();
    const avatar = formData.get("avatar");
    if (!(avatar instanceof File)) throw new ApiError("File foto profil diperlukan.", 400);
    if (avatar.size === 0 || avatar.size > maxAvatarSize) {
      throw new ApiError("Ukuran foto harus lebih kecil dari 5 MB.", 400);
    }

    const imageType = allowedTypes[avatar.type as keyof typeof allowedTypes];
    if (!imageType) {
      throw new ApiError("Format foto harus JPEG, PNG, atau WebP.", 400);
    }

    const bytes = Buffer.from(await avatar.arrayBuffer());
    if (!imageType.signature(bytes)) {
      throw new ApiError("Isi file tidak sesuai dengan format gambar.", 400);
    }

    const directory = join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}.${imageType.extension}`;
    uploadedPath = join(directory, filename);
    await writeFile(uploadedPath, bytes, { flag: "wx" });

    const avatarUrl = `/uploads/avatars/${filename}`;
    const [result] = await getDb().execute<ResultSetHeader>(
      "UPDATE users SET avatar_url = ? WHERE id = ?",
      [avatarUrl, auth.id],
    );
    if (result.affectedRows === 0) throw new ApiError("Pengguna tidak ditemukan.", 404);

    return Response.json({ avatar_url: avatarUrl });
  } catch (error) {
    if (uploadedPath) {
      try {
        await unlink(uploadedPath);
      } catch (cleanupError) {
        console.error("Failed to remove an unreferenced uploaded avatar:", cleanupError);
      }
    }
    return errorResponse(error);
  }
}
