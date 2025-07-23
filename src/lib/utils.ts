import { clsx, type ClassValue } from 'clsx';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateInput: string | number | Date): string {
  try {
    let date: Date;
    if (typeof dateInput === 'string') {
      // If it's a string of digits, treat as timestamp
      date = /^\d+$/.test(dateInput)
        ? new Date(Number(dateInput))
        : parseISO(dateInput);
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }
    return format(date, 'MMMM d, yyyy');
  } catch {
    return String(dateInput);
  }
}

export function formatDateTime(dateInput: string | number | Date): string {
  try {
    let date: Date;
    if (typeof dateInput === 'string') {
      date = /^\d+$/.test(dateInput)
        ? new Date(Number(dateInput))
        : parseISO(dateInput);
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }
    return format(date, 'MMMM d, yyyy HH:mm:ss');
  } catch {
    return String(dateInput);
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
  significance: string;
  color: string;
} {
  const caseYear = new Date(decisionDate).getFullYear();

  if (caseYear >= 2010) {
    return {
      status: 'Digital Era',
      significance: 'Current precedent, highly relevant',
      color: 'text-green-600 bg-green-100',
    };
  } else if (caseYear >= 1990) {
    return {
      status: 'Information Age',
      significance: 'Modern precedent, very relevant',
      color: 'text-blue-600 bg-blue-100',
    };
  } else if (caseYear >= 1960) {
    return {
      status: 'Civil Rights Era',
      significance: 'Foundational modern precedent',
      color: 'text-purple-600 bg-purple-100',
    };
  } else if (caseYear >= 1900) {
    return {
      status: 'Industrial Era',
      significance: 'Historical precedent, context-dependent',
      color: 'text-yellow-600 bg-yellow-50',
    };
  } else {
    return {
      status: 'Classical Era',
      significance: 'Foundational principles, rarely cited',
      color: 'text-gray-600 bg-gray-100',
    };
  }
}
