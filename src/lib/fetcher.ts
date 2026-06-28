/**
 * Default fetcher for SWR
 * Handles JSON responses and errors
 */
interface FetchError extends Error {
  info?: unknown;
  status?: number;
}

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    const error: FetchError = new Error("An error occurred while fetching the data.");
    const info = await res.json();
    error.info = info;
    error.status = res.status;
    throw error;
  }

  return res.json();
}
