import clipboardy from 'clipboardy';

export async function readClipboard(): Promise<string> {
  try {
    return await clipboardy.read();
  } catch (err) {
    throw new Error(`Failed to read from clipboard: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function writeClipboard(text: string): Promise<void> {
  try {
    await clipboardy.write(text);
  } catch (err) {
    throw new Error(`Failed to write to clipboard: ${err instanceof Error ? err.message : String(err)}`);
  }
}
