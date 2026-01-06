import type { NextApiRequest, NextApiResponse } from "next";

function getAlfredoEngineUrl(): string {
  const baseUrl = process.env.ENGINE_ENDPOINT;
  if (!baseUrl) throw new Error("ENGINE_ENDPOINT is not set");
  return baseUrl;
}

function getAlfredoApiKey(): string {
  const apiKey = process.env.ENGINE_API_KEY;
  if (!apiKey) throw new Error("ENGINE_API_KEY is not set");
  return apiKey;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { platform_hash } = req.query;

  if (!platform_hash || typeof platform_hash !== "string") {
    return res.status(400).json({ error: "platform_hash is required" });
  }

  const url = `${getAlfredoEngineUrl()}/prospect/listing/${platform_hash}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getAlfredoApiKey(),
      },
    });
  } catch (err) {
    console.error("Network error in metasearch-property route:", err);
    return res.status(502).json({
      error: "Failed to connect to listings service.",
    });
  }

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: "Unknown error" };
    }
    console.error("Upstream error in metasearch-property route:", errorBody);
    return res.status(response.status).json({
      error: "Failed to fetch listing.",
      details: errorBody,
    });
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (err) {
    console.error("Failed to parse JSON from listings service:", err);
    return res.status(502).json({
      error: "Invalid response from listings service.",
    });
  }

  return res.status(200).json(data);
}
