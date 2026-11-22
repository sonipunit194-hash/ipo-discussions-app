
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "YouTube API key is missing"
      });
    }

    // Fetch channel details
    const channelUrl = new URL(
      "https://www.googleapis.com/youtube/v3/channels"
    );

    channelUrl.searchParams.set("part", "snippet,contentDetails");
    channelUrl.searchParams.set("forHandle", "ipodiscussions");
    channelUrl.searchParams.set("key", apiKey);

    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelResponse.ok || !channelData.items?.length) {
      return res.status(502).json({
        error: "YouTube channel not found"
      });
    }

    const channel = channelData.items[0];

    const playlistId =
      channel.contentDetails.relatedPlaylists.uploads;

    // Fetch latest videos
    const videosUrl = new URL(
      "https://www.googleapis.com/youtube/v3/playlistItems"
    );

    videosUrl.searchParams.set("part", "snippet");
    videosUrl.searchParams.set("playlistId", playlistId);
    videosUrl.searchParams.set("maxResults", "10");
    videosUrl.searchParams.set("key", apiKey);

    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    if (!videosResponse.ok) {
      return res.status(502).json({
        error: "Latest videos could not be loaded"
      });
    }

    const videos = (videosData.items || [])
      .filter(item => item.snippet.resourceId?.videoId)
      .map(item => ({
        title: item.snippet.title,
        description: item.snippet.description,
        videoId: item.snippet.resourceId.videoId,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt
      }));

    // Subscriber count intentionally excluded
    return res.status(200).json({
      channel: {
        title: channel.snippet.title,
        thumbnail:
          channel.snippet.thumbnails.high?.url ||
          channel.snippet.thumbnails.default?.url
      },
      videos
    });

  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
}
