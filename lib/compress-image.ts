/**
 * Client-side image compression utility using Canvas API.
 * Resizes images to a max dimension and compresses to JPEG.
 * No external dependencies required.
 */

export type CompressOptions = {
  /** Maximum width or height in pixels (default: 1200) */
  maxDimension?: number
  /** JPEG quality 0-1 (default: 0.8) */
  quality?: number
  /** Output MIME type (default: 'image/jpeg') */
  outputType?: 'image/jpeg' | 'image/webp'
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxDimension: 1200,
  quality: 0.8,
  outputType: 'image/jpeg',
}

/**
 * Compress and resize an image file before upload.
 * Returns the compressed File. If compression fails or the file is not
 * an image, the original file is returned unchanged.
 *
 * @example
 * ```ts
 * const compressed = await compressImage(file)
 * formData.set('foto', compressed)
 * ```
 */
export async function compressImage(
  file: File,
  options?: CompressOptions
): Promise<File> {
  // Only process image files
  if (!file.type.startsWith('image/')) {
    return file
  }

  // Skip SVGs and GIFs (compression doesn't help / breaks animation)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file
  }

  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap

    // Calculate new dimensions maintaining aspect ratio
    let newWidth = width
    let newHeight = height

    if (width > opts.maxDimension || height > opts.maxDimension) {
      if (width > height) {
        newWidth = opts.maxDimension
        newHeight = Math.round((height / width) * opts.maxDimension)
      } else {
        newHeight = opts.maxDimension
        newWidth = Math.round((width / height) * opts.maxDimension)
      }
    }

    // Draw to canvas
    const canvas = new OffscreenCanvas(newWidth, newHeight)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }

    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight)
    bitmap.close()

    // Convert to blob
    const blob = await canvas.convertToBlob({
      type: opts.outputType,
      quality: opts.quality,
    })

    // If compressed is larger than original, return original
    if (blob.size >= file.size) {
      return file
    }

    // Build extension from output type
    const ext = opts.outputType === 'image/webp' ? '.webp' : '.jpg'
    const baseName = file.name.replace(/\.[^.]+$/, '')

    return new File([blob], `${baseName}${ext}`, {
      type: opts.outputType,
      lastModified: Date.now(),
    })
  } catch {
    // If anything goes wrong, return original file untouched
    console.warn('[compressImage] Compression failed, using original file')
    return file
  }
}
