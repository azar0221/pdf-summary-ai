import UploadPdf from "./components/UploadPdf";

import { ISummarizeResponse } from "./lib/interfaces/summarize-response";

async function getUsers(): Promise<ISummarizeResponse[]> {
  const res = await fetch("http://localhost:3000/api/summarize", {
    cache: "no-store",
  });
  return res.json();
}

export default async function Home() {
  const data = await getUsers();

  return <UploadPdf initialData={data} />;
}
