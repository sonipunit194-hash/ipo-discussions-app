
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
        error: "EJI API key is missing"
      });
    }

    const allowedParams = [
      "status",
      "segment",
      "year",
      "start",
      "end",
      "q",
      "limit",
      "offset"
    ];

    const incomingUrl = new URL(
      req.url,
      "https://ipo-discussions-app.vercel.app"
    );

    const apiUrl = new URL(
      "https://fin.ejiapi.com/api/ipo"
    );

    allowedParams.forEach(param => {
      const value = incomingUrl.searchParams.get(param);

      if (value) {
        apiUrl.searchParams.set(param, value);
      }
    });

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-api-key": apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "IPO data could not be loaded",
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong while fetching IPO data"
    });
  }
}
