const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // importante por cookies
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    // intenta leer error json si existe
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      msg = body?.message ?? msg;
    } catch {
      /* empty */
    }
    throw new Error(msg);
  }

  // 204 no content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
