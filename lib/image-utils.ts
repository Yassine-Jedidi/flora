/**
 * Utility to get optimized image URLs from UploadThing
 * Offloads resizing and quality adjustment to UploadThing's edge servers
 */
export function getOptimizedImageUrl(
  url: string,
  width: number = 800,
  quality: number = 75,
) {
  if (!url) return "";

  // If it's already an UploadThing URL, we return it as is
  // Note: img.utfs.io transformation is no longer used
  if (url.includes("utfs.io")) {
    return url;
  }

  return url;
}
