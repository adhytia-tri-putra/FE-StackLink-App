const RESERVED_PATHS = new Set([
  "login", "register", "forgot-password", "reset-password", "verify-email", "privacy", "terms", "help",
  "welcome", "dashboard", "links", "insights", "profile-settings", "account-settings", "publishing",
  "addlink", "add-link", "preview", "preview-links", "old-dashboard", "api", "assets",
]);

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function metaTags(profile: Record<string, unknown>, canonical: string): string {
  const title = escapeHtml(profile.seoTitle || profile.name || profile.username || "StackLink");
  const description = escapeHtml(profile.seoDescription || profile.bio || profile.headline || "View this StackLink profile");
  const image = escapeHtml(profile.socialImage || profile.avatar || "");
  const imageTags = image ? `<meta property="og:image" content="${image}"><meta name="twitter:image" content="${image}">` : "";

  return `<title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:type" content="profile"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${escapeHtml(canonical)}">${imageTags}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}">`;
}

export default async (request: Request, context: { next(): Promise<Response> }) => {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const isAsset = segments.some((segment) => segment.includes("."));
  const username = segments.length === 1 && !RESERVED_PATHS.has(segments[0]) && !isAsset ? segments[0] : null;
  const isCustomRoot = segments.length === 0 && !url.hostname.endsWith("netlify.app");

  if (!username && !isCustomRoot) return context.next();

  const apiBase = Deno.env.get("API_BASE_URL") || Deno.env.get("VITE_API_BASE_URL");
  if (!apiBase) return context.next();

  const profileUrl = username
    ? `${apiBase.replace(/\/$/, "")}/u/${encodeURIComponent(username)}`
    : `${apiBase.replace(/\/$/, "")}/u/domain/${encodeURIComponent(url.hostname)}`;

  const pageResponse = await context.next();
  try {
    const profileResponse = await fetch(profileUrl, { headers: { accept: "application/json" } });
    if (!pageResponse.ok || !profileResponse.ok) return pageResponse;

    const payload = await profileResponse.json();
    const profile = payload?.data;
    if (!profile) return pageResponse;

    const html = await pageResponse.text();
    const withMeta = html.replace(/<title>.*?<\/title>/i, metaTags(profile, url.href));
    const headers = new Headers(pageResponse.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "public, max-age=60, s-maxage=300");
    return new Response(withMeta, { status: pageResponse.status, headers });
  } catch {
    return pageResponse;
  }
};
