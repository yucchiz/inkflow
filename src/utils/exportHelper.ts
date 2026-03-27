/**
 * Copy text to the system clipboard.
 */
export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

/**
 * Combine title and body into a single export string.
 * If title is empty, returns body only.
 */
export function exportText(title: string, body: string): string {
  if (!title) return body
  return `${title}\n\n${body}`
}

/**
 * Share text via the Web Share API, falling back to clipboard copy.
 * Returns true if sharing/copying succeeded, false if the user cancelled.
 */
export async function shareText(title: string, body: string): Promise<boolean> {
  const text = exportText(title, body)
  if (navigator.share) {
    try {
      await navigator.share({ title: title || 'InkFlow', text })
      return true
    } catch {
      // User cancelled or share failed
      return false
    }
  }
  // Fallback: copy to clipboard
  await copyToClipboard(text)
  return true
}
