import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Saves an uploaded image: re-encodes to WebP (strips metadata, caps width at
 * 1600px) so a phone photo of several MB lands at a bandwidth-friendly size.
 * Returns the public URL path.
 */
export async function saveImage(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("حجم الصورة كبير جداً (الحد الأقصى 10MB)");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();

  const name = `${crypto.randomBytes(12).toString("hex")}.webp`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), webp);
  return `/uploads/${name}`;
}

export async function deleteImage(url: string): Promise<void> {
  const name = path.basename(url);
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch {
    // already gone
  }
}
