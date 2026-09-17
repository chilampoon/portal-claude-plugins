const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a `public/` asset path with the site's basePath (empty in dev). */
export function withBasePath(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
