import dayjs from 'dayjs';

export function formatDate(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function formatDateShort(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function getStatusClass(status: string): string {
  return `status-${status}`;
}

export function getResultClass(result: string): string {
  return `status-${result}`;
}

export function getSeverityClass(severity: string): string {
  return `severity-${severity}`;
}

export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}