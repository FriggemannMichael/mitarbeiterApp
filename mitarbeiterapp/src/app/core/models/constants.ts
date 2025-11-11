/**
 * Application constants
 * Migrated from React PWA (constants.ts)
 */

export const TIMEOUTS = {
  PAGE_RELOAD_DELAY: 500,
  AUTO_LOGOUT_THROTTLE: 30000, // 30 seconds
  PERFORMANCE_METRICS_DELAY: 100,
  ONLINE_NOTIFICATION_DURATION: 3000,
} as const;

export const BACKUP = {
  REMINDER_DAYS: 7,
  FIRST_USE_REMINDER_DAYS: 7,
} as const;

export const API_ENDPOINTS = {
  SEND_PDF: 'send-pdf.php',
  WHATSAPP_BASE: 'https://wa.me/',
} as const;

export const TIME_FIELDS = {
  FROM: 'from',
  TO: 'to',
  PAUSE1_FROM: 'pause1From',
  PAUSE1_TO: 'pause1To',
  PAUSE2_FROM: 'pause2From',
  PAUSE2_TO: 'pause2To',
} as const;

export const TIME_FIELD_NAMES = [
  'from',
  'to',
  'pause1From',
  'pause1To',
  'pause2From',
  'pause2To',
] as const;

export const SHIFT_DETECTION = {
  NIGHT_SHIFT_START_HOUR: 22, // 10 PM
  NIGHT_SHIFT_END_HOUR: 8, // 8 AM
} as const;

export const VALIDATION_PATTERNS = {
  TIME_FORMAT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  EMAIL_FORMAT: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export const LOCALE_MAP: Record<string, string> = {
  de: 'de-DE',
  en: 'en-US',
  fr: 'fr-FR',
  ro: 'ro-RO',
  pl: 'pl-PL',
  ru: 'ru-RU',
  ar: 'ar-SA',
  bg: 'bg-BG',
  uk: 'uk-UA',
  fa: 'fa-IR',
};

export const STORAGE_KEYS = {
  LANGUAGE: 'wpdl_language',
  EMPLOYEE_NAME: 'wpdl_employee_name',
  CONSENT: 'wpdl_consent',
  WEEK_PREFIX: 'wpdl_week_',
  LAST_BACKUP_DATE: 'wpdl_last_backup_date',
  BACKUP_REMINDER_DISMISSED: 'wpdl_backup_reminder_dismissed',
  FIRST_USE_DATE: 'wpdl_first_use_date',
  PWA_GUIDE_SHOWN: 'wpdl_pwa_guide_shown',
  PWA_MODAL_DISMISSED: 'wpdl_pwa_modal_dismissed',
  PWA_MODAL_NEVER: 'wpdl_pwa_modal_never',
} as const;

export const APP_VERSION = '1.0.0-angular';

export const SHIFT_MODELS = {
  day: {
    name: 'shift.day.name',
    description: 'shift.day.description',
    icon: '☀️',
    defaultTimes: {
      from: '08:00',
      to: '17:00',
      pause1From: '12:00',
      pause1To: '12:30',
      pause2From: '',
      pause2To: '',
    },
  },
  late: {
    name: 'shift.late.name',
    description: 'shift.late.description',
    icon: '🌆',
    defaultTimes: {
      from: '14:00',
      to: '23:00',
      pause1From: '18:00',
      pause1To: '18:30',
      pause2From: '',
      pause2To: '',
    },
  },
  night: {
    name: 'shift.night.name',
    description: 'shift.night.description',
    icon: '🌙',
    defaultTimes: {
      from: '22:00',
      to: '06:00',
      pause1From: '02:00',
      pause1To: '02:30',
      pause2From: '',
      pause2To: '',
    },
  },
  continuous: {
    name: 'shift.continuous.name',
    description: 'shift.continuous.description',
    icon: '🔄',
    defaultTimes: {
      from: '06:00',
      to: '14:00',
      pause1From: '09:00',
      pause1To: '09:30',
      pause2From: '',
      pause2To: '',
    },
  },
} as const;
