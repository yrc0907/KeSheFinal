import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { stat, mkdir } from "fs/promises";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const files: File[] = data.getAll("files") as unknown as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ success: false, error: "No files uploaded." });
  }

  const uploadDir = join(process.cwd(), "public", "uploads");

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      console.error(
        "Error while trying to create directory when uploading a file\n",
        e
      );
      return NextResponse.json(
        { success: false, error: "Something went wrong." },
        { status: 500 }
      );
    }
  }

  const filenames = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);
    filenames.push(`/uploads/${filename}`);
  }

  return NextResponse.json({ success: true, filenames });
} 