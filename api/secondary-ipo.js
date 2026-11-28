
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const response = await fetch(
      "https://ipos.markets/data/issues_index.json"
    );

    if (!response.ok) {
      return res.status(502).json({
        error: "Secondary IPO source unavailable"
      });
    }

    const result = await response.json();

    return res.status(200).json({
      status: "success",
      source: "ipos.markets",
      generated: result.generated,
      total: Array.isArray(result.issues)
        ? result.issues.length
        : 0,
      data: result.issues || []
    });

  } catch (error) {
    return res.status(500).json({
      error: "Secondary IPO API failed",
      details: error.message
    });
  }
}
