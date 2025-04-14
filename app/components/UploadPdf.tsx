"use client";

import React, { useRef, useState } from "react";
import { ISummarizeResponse } from "../lib/interfaces/summarize-response";

export default function UploadPdf({
  initialData,
}: {
  initialData: ISummarizeResponse[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isBtnDisabled = file === null || isLoading;
  const [data, setData] = useState<ISummarizeResponse[]>(initialData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (file === null) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });

      const summaryResponse: ISummarizeResponse = await res.json();

      setData((prev) => [summaryResponse, ...prev.slice(0, 4)]);

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Upload PDF File
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 mb-2 font-medium">
              Choose PDF
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition disabled:bg-gray-300"
            disabled={isBtnDisabled}
          >
            Upload
          </button>
        </form>
      </div>

      {!!data && (
        <div className="mt-10 w-full max-w-md bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Upload History
          </h2>
          <ul className="space-y-3">
            {data.map((item, index) => (
              <li
                key={index}
                className="border p-3 rounded-md shadow-sm bg-gray-50"
              >
                <p className="font-medium text-gray-700 ">📄 {item.summary}</p>

                <p className="text-sm text-gray-400">
                  Uploaded at: {item.uploadedAt}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
