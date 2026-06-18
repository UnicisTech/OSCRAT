import { saveAs } from 'file-saver';

export function downloadJson(data: unknown, filename: string): void {
  const content =
    typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  saveAs(blob, filename);
}
