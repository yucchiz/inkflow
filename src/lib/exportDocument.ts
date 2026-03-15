export async function copyToClipboard(body: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(body);
    return true;
  } catch {
    return false;
  }
}

export function downloadAsTxt(title: string, body: string): void {
  const trimmedTitle = title.trim();
  const content = trimmedTitle ? `${trimmedTitle}\n\n${body}` : body;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;

  if (trimmedTitle) {
    anchor.download = `${trimmedTitle}.txt`;
  } else {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    anchor.download = `inkflow-${yyyy}-${mm}-${dd}.txt`;
  }

  anchor.click();
  URL.revokeObjectURL(url);
}
