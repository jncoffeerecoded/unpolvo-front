import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const hasS3 = !!(
  process.env.S3_ENDPOINT &&
  process.env.S3_BUCKET &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY
);

let s3: S3Client | null = null;
function getClient(): S3Client {
  if (!s3) {
    s3 = new S3Client({
      region: process.env.S3_REGION ?? "auto",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3;
}

// Comprime y normaliza a WebP: ahorra espacio sin pérdida de calidad apreciable.
async function compress(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate() // respeta la orientación EXIF
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

/**
 * Sube una imagen (validada y comprimida) y devuelve su URL pública.
 * - Producción: bucket S3-compatible (Railway / storageapi).
 * - Desarrollo sin credenciales S3: guarda en /public/uploads.
 *
 * Solo imágenes (no vídeos), máximo 5 MB por archivo. Todo se convierte a WebP.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Tipo de archivo no permitido (solo imágenes JPG, PNG, WEBP o AVIF).");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen supera el límite de 5 MB.");
  }

  const original = Buffer.from(await file.arrayBuffer());
  const buffer = await compress(original);
  const id = `${randomUUID()}.webp`;

  if (hasS3) {
    const key = `profiles/${id}`;
    await getClient().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    // El bucket es privado: servimos vía proxy same-origin (estable y cacheable).
    // Si haces el bucket público, puedes devolver la URL directa del CDN.
    return `/api/img/${key}`;
  }

  // Fallback de desarrollo: disco local servido desde /public.
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, id), buffer);
  return `/uploads/${id}`;
}
