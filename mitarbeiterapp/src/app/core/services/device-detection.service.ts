import { Injectable } from '@angular/core';

/**
 * Device Detection Service
 * Detects if the app is running on mobile or desktop
 */
@Injectable({
  providedIn: 'root',
})
export class DeviceDetectionService {
  /**
   * Check if the current device is mobile
   */
  isMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android',
      'webos',
      'iphone',
      'ipad',
      'ipod',
      'blackberry',
      'windows phone',
      'mobile',
    ];

    // Check user agent for mobile keywords
    const isMobileUserAgent = mobileKeywords.some((keyword) => userAgent.includes(keyword));

    // Check screen size (max width 768px is typically considered mobile/tablet)
    const isMobileScreenSize = window.innerWidth <= 768;

    // Check for touch support
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Device is considered mobile if it has a mobile user agent OR (small screen AND touch support)
    return isMobileUserAgent || (isMobileScreenSize && hasTouchSupport);
  }

  /**
   * Check if desktop warning has been dismissed
   */
  hasDesktopWarningBeenDismissed(): boolean {
    return localStorage.getItem('desktopWarningDismissed') === 'true';
  }

  /**
   * Mark desktop warning as dismissed
   */
  dismissDesktopWarning(): void {
    localStorage.setItem('desktopWarningDismissed', 'true');
  }

  /**
   * Should show desktop warning
   */
  shouldShowDesktopWarning(): boolean {
    return !this.isMobileDevice() && !this.hasDesktopWarningBeenDismissed();
  }
}
