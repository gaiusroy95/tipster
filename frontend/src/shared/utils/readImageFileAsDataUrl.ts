const DEFAULT_MAX_BYTES = 5 * 1024 * 1024

export async function readImageFileAsDataUrl(
  file: File,
  maxBytes = DEFAULT_MAX_BYTES,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file')
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024))
    throw new Error(`Image must be ${mb} MB or smaller`)
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('Failed to read image file'))
    }
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}
