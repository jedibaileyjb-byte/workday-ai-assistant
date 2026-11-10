/** A stale page can reference a route chunk removed by the latest deployment. */
export function isModuleLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|Failed to load module script|Loading chunk .* failed/i.test(message);
}