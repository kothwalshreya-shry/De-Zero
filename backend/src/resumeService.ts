import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractResumeText(
  buffer: Buffer,
  mimetype: string,
  filename: string
): Promise<string> {
  const extension = filename
    .split(".")
    .pop()
    ?.toLowerCase();

  // PDF
  if (
    mimetype === "application/pdf" ||
    extension === "pdf"
  ) {
    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();

      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  // DOCX
  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    const result = await mammoth.extractRawText({
      buffer,
    });

    return result.value.trim();
  }

  // TXT
  if (
    mimetype === "text/plain" ||
    extension === "txt"
  ) {
    return buffer.toString("utf-8").trim();
  }

  throw new Error(
    "Unsupported resume format. Please upload a PDF, DOCX, or TXT file."
  );
}