/**
 * Core data models for the timesheet application
 * Migrated from React PWA (storage.ts)
 */

export type ShiftModel = 'day' | 'late' | 'night' | 'continuous';

export interface DayData {
  date: string; // ISO format YYYY-MM-DD
  from: string; // HH:MM format
  to: string; // HH:MM format
  pause1From: string;
  pause1To: string;
  pause2From: string;
  pause2To: string;
  hours: string; // HH:MM format (calculated)
  decimal: string; // Industrial minutes format (e.g., "8.50")
  isNightShift?: boolean;
  nightShiftEndDate?: string; // For shifts spanning midnight
}

export interface WeekData {
  employeeName: string;
  customer: string;
  customerEmail?: string;
  week: number; // ISO week number
  year: number;
  startDate: string; // ISO format
  days: DayData[];
  employeeSignature?: string; // Base64 PNG data URL
  supervisorSignature?: string; // Base64 PNG data URL
  supervisorName?: string;
  locked: boolean;
  shiftModel?: ShiftModel;
}

export interface ShiftConfig {
  from: string;
  to: string;
  pause1From: string;
  pause1To: string;
  pause2From: string;
  pause2To: string;
  days: boolean[]; // 7-day array (Mon-Sun for day shifts, Sun-Sat for night shifts)
}

export interface TotalHours {
  hours: string; // HH:MM format
  decimal: string; // Decimal format
}

export interface QRCodeData {
  type: 'WPDL_TIMESHEET';
  version: string;
  employee: {
    name: string;
  };
  supervisor: {
    name?: string;
  };
  period: {
    week: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  customer: string;
  days: Array<{
    date: string;
    hours: string;
    decimal: string;
  }>;
}

export interface AppConfig {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  allowedEmails: string[];
  allowedWhatsAppNumbers: string[];
  export: {
    defaultEmail: string;
    defaultWhatsApp: string;
    filenamePattern: string;
    pdf: {
      includeCompanyLogo: boolean;
      includeSignatures: boolean;
      watermark?: string;
    };
  };
  app: {
    maxWorkHoursPerDay: number;
    autoSave: boolean;
    offlineMode: boolean;
    defaultBreakMinutes: number;
    version: string;
  };
  security: {
    encryptLocalData: boolean;
    autoLogoutMinutes: number;
    backupReminderDays: number;
    companyCode: string;
  };
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
];
