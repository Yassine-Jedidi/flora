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

  // If it's already an UploadThing URL, we can use their transformation service
  if (url.includes("utfs.io")) {
    const baseUrl = url.replace("utfs.io", "img.utfs.io").replace("/f/", "/");
    return `${baseUrl}?width=${width}&quality=${quality}`;
  }

  return url;
}
