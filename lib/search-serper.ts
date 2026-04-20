interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

export async function searchWeb(query: string): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.error("[Search] No SERPER_API_KEY found");
    return [];
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "ve", // Google Location: Venezuela
        hl: "es", // Language: Spanish
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.organic?.map((res: any) => ({
      title: res.title,
      link: res.link,
      snippet: res.snippet,
    })) || [];

  } catch (error) {
    console.error("[Search] Failed to fetch from Serper:", error);
    return [];
  }
}
