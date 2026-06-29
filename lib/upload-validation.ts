export const MAX_SOURCE_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5GB

const VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/avi", "video/msvideo"];
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi"];
const IMAGE_MIME_PREFIX = "image/";

function hasVideoExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function classifySourceKind(file: File): "video" | "photo" {
  if (file.type.startsWith(IMAGE_MIME_PREFIX)) return "photo";
  return "video";
}

// AVI MIME reporting is inconsistent across browsers/OSes, so we fall back to
// the file extension when the browser doesn't report a recognizable video MIME type.
export function validateSourceFile(file: File): string | null {
  if (file.size > MAX_SOURCE_SIZE_BYTES) {
    return `파일 크기가 너무 큽니다. 최대 5GB까지 업로드할 수 있어요. (${file.name})`;
  }

  const isImage = file.type.startsWith(IMAGE_MIME_PREFIX);
  const isVideoMime = VIDEO_MIME_TYPES.includes(file.type);
  const isVideoByExtension = hasVideoExtension(file.name);

  if (!isImage && !isVideoMime && !isVideoByExtension) {
    return `지원하지 않는 파일 형식입니다. MP4, MOV, AVI 영상 또는 이미지 파일만 업로드할 수 있어요. (${file.name})`;
  }

  return null;
}

export function getVideoDuration(file: File): Promise<number | undefined> {
  if (!file.type.startsWith("video/") && !hasVideoExtension(file.name)) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const cleanup = () => URL.revokeObjectURL(url);

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : undefined;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      resolve(undefined);
    };
    video.src = url;
  });
}
