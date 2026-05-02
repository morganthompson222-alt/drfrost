type UpstashResult<T> = { result: T } | { error: string };

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  return { url, token, enabled: Boolean(url && token) };
}

export function isUpstashEnabled() {
  return getUpstashConfig().enabled;
}

export async function upstash<T = unknown>(command: string, ...args: Array<string | number>) {
  const { url, token, enabled } = getUpstashConfig();
  if (!enabled) {
    throw new Error("Upstash is not configured");
  }

  const path = [command, ...args].map((x) => encodeURIComponent(String(x))).join("/");
  const res = await fetch(`${url.replace(/\/$/, "")}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = (await res.json()) as UpstashResult<T>;
  if (!res.ok || "error" in json) {
    const msg = "error" in json ? json.error : `Upstash error (${res.status})`;
    throw new Error(msg);
  }

  return json.result;
}

