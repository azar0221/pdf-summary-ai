import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { PdfReader } from "pdfreader";

import { ISummarizeResponse } from "@/app/lib/interfaces/summarize-response";

import db from "@/app/lib/database";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File not found or invalid" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfReader = new PdfReader();
    const charactersList: string[] = [];

    await new Promise((res, rej) => {
      pdfReader.parseBuffer(buffer, (err, item) => {
        if (err) {
          rej(err);
          return;
        }
        if (!item) {
          res(null);
          return;
        }
        if (item?.text) {
          charactersList.push(item.text);
        }
      });
    });

    const completion = await openai.responses.create({
      model: "gpt-3.5-turbo",
      instructions: "You are a helpful assistant that summarizes documents.",
      input: `Summarize this PDF content:\n\n${charactersList.join("")}`,
      temperature: 0.7,
    });

    const summary = completion.output_text;
    const date = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO pdf_summary (baseFilename, summary, uploadedAt)
      VALUES (?, ?, ?)
    `);
    const entry = stmt.run(file.name, summary, date);
    const pdfSummary: ISummarizeResponse = {
      id: entry.lastInsertRowid.toString(),
      uploadedAt: date,
      summary,
    };

    return NextResponse.json(pdfSummary, {
      status: 201,
    });
  } catch (error) {
    console.error("> ERROR:", error);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again later",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(): Promise<Response> {
  try {
    const stmt = db.prepare(
      "SELECT * FROM pdf_summary ORDER BY id DESC LIMIT 5"
    );
    const summaries = stmt.all();

    return NextResponse.json(summaries, {
      status: 200,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Something went wrong. Please try again later",
      },
      {
        status: 500,
      }
    );
  }
}
