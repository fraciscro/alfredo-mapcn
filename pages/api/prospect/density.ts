import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route para buscar dados de densidade do mapa
 * Faz proxy para o engine API endpoint /prospect/density
 *
 * Query params aceites (herda de SearchRequestSchema):
 * - country: "pt" | "es" | "uk"
 * - addresses: string (IDs separados por vírgula)
 * - polygon: string (coordenadas do polígono)
 * - asset_type, ad_type, price, etc.
 */
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
  console.log("API density called with query:", req.query);

  // Build query string from req.query
  const queryString = new URLSearchParams(req.query as Record<string, string>).toString();

  const url = `${getAlfredoEngineUrl()}/prospect/density?${queryString}`;

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
    console.error("Network error in density route:", err);
    return res.status(502).json({
      error: "Failed to connect to density search service.",
    });
  }

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: "Unknown error" };
    }
    console.error("Upstream error in density route:", errorBody);
    return res.status(response.status).json({
      error: "Failed to fetch density data.",
      details: errorBody,
    });
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (err) {
    console.error("Failed to parse JSON from density search:", err);
    return res.status(502).json({
      error: "Invalid response from density search service.",
    });
  }

  return res.status(200).json(data);
}
