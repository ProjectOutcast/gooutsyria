import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { notFound } from "next/navigation";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";

/**
 * Serves runtime-uploaded files from UPLOAD_DIR (a mounted volume in
 * production — files added after build aren't part of the static bundle).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const name = path.basename(segments.join("/")); // flatten: no traversal
  const filePath = path.join(UPLOAD_DIR, name);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) notFound();

  const stream = Readable.toWeb(
    createReadStream(filePath)
  ) as ReadableStream;
  const type = name.endsWith(".webp")
    ? "image/webp"
    : name.endsWith(".svg")
      ? "image/svg+xml"
      : "application/octet-stream";

  return new Response(stream, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
