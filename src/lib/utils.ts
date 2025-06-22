import { clsx, type ClassValue } from 'clsx';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMMM d, yyyy HH:mm:ss');
  } catch {
    return dateString;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getCitationDisplay(
  citations: Array<{ type: string; cite: string }>
): string {
  if (!citations || citations.length === 0) return 'No citations available';

  const officialCitation = citations.find((c) => c.type === 'official');
  if (officialCitation) return officialCitation.cite;

  return citations[0]?.cite || 'No citations available';
}

export function getCaseStatus(decisionDate: string): {
  status: string;
  color: string;
} {
  const date = new Date(decisionDate);
  const now = new Date();
  const yearsDiff = now.getFullYear() - date.getFullYear();

  if (yearsDiff < 5) {
    return { status: 'Recent', color: 'text-green-600 bg-green-100' };
  } else if (yearsDiff < 20) {
    return { status: 'Modern', color: 'text-blue-600 bg-blue-100' };
  } else if (yearsDiff < 50) {
    return { status: 'Historical', color: 'text-yellow-600 bg-yellow-100' };
  } else {
    return { status: 'Classic', color: 'text-gray-600 bg-gray-100' };
  }
}
