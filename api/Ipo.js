
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.EJI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "EJI_API_KEY is missing in Vercel"
      });
    }

    const response = await fetch(
      "https://fin.ejiapi.com/api/ipo",
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "EJI IPO API request failed",
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "IPO API server error",
      details: error.message
    });
  }
}
