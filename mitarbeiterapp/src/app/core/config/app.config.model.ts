// App-Konfiguration für WPDL Timesheet
export interface AppConfig {
  company: {
    name: string;
    email: string;
  };
  allowedEmails: string[];
  export: {
    defaultEmail: string;
  };
}

export const APP_CONFIG: AppConfig = {
  company: {
    name: 'WPDL',
    email: 'info@wpdl.de',
  },
  allowedEmails: [
    'info@wpdl.de',
    'i.edeler@wpdl.de',
    'y.kessler@wpdl.de',
    'c.knipping@wpdl.de',
    'j.bruening@wpdl.de',
  ],
  export: {
    defaultEmail: 'info@wpdl.de',
  },
};

export class ConfigUtils {
  static generateFilename(employeeName: string, year: number, week: number): string {
    const cleanName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
    return `WPDL_Stundennachweis_${cleanName}_${year}_${week.toString().padStart(2, '0')}.pdf`;
  }
}
