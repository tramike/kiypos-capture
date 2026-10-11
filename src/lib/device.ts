export function detectDeviceType(): 'phone' | 'tablet' {
  const ua = navigator.userAgent;
  const isTablet = /iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua);
  const isWideScreen = window.matchMedia('(min-width: 768px)').matches;
  return isTablet || (isWideScreen && !/iPhone|Android.*Mobile/i.test(ua)) ? 'tablet' : 'phone';
}
