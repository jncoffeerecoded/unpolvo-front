import { NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

// Sirve las imágenes del bucket (privado) como contenido same-origin y cacheable.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

  // Solo imágenes de perfiles: evita lecturas arbitrarias del bucket.
  if (!objectKey.startsWith("profiles/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const obj = await s3.send(
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: objectKey }),
    );
    const bytes = await obj.Body!.transformToByteArray();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": obj.ContentType ?? "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
