import { constants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { config } from "../config.js";

export async function cvExists() {
  try {
    await access(config.cvPath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readCv() {
  return readFile(config.cvPath, "utf8");
}

export async function saveCv(file: File) {
  let text: string;

  if (file.type === "text/markdown") {
    text = await file.text();
  } else if (file.type === "application/pdf") {
    const parser = new PDFParse({ data: await file.arrayBuffer() });

    try {
      text = (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  } else {
    throw new Error("UNSUPPORTED_CV_FILE");
  }

  if (!text.trim()) {
    throw new Error("EMPTY_CV_TEXT");
  }

  await mkdir(path.dirname(config.cvPath), { recursive: true });
  await writeFile(config.cvPath, text, "utf8");
}
