export function parseYouTubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id || null;
    }
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/embed/")[1];
    }
    return null;
  } catch {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/);
    return match ? match[1] : null;
  }
}

export function isYouTubeUrl(url: string) {
  return /youtu\.be|youtube\.com/.test(url) && Boolean(parseYouTubeId(url));
}
