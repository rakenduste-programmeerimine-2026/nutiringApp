/** Exam pages that work without a session. Everything else under /eksam needs a login. */
export const PUBLIC_EXAM_PATHS = [
  "/eksam",
  "/eksam/registreeri",
  "/eksam/ule-kirjuta",
  "/eksam/logi-sisse",
];

export const LOGIN_PATH = "/eksam/logi-sisse";

export function requiresSession(pathname: string): boolean {
  if (pathname !== "/eksam" && !pathname.startsWith("/eksam/")) return false;
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return !PUBLIC_EXAM_PATHS.includes(clean);
}
