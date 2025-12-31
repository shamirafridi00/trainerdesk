export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const timezones: TimezoneOption[] = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10' },

  // Europe
  { value: 'Europe/London', label: 'London (GMT)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1' },
  { value: 'Europe/Rome', label: 'Rome (CET)', offset: 'UTC+1' },
  { value: 'Europe/Athens', label: 'Athens (EET)', offset: 'UTC+2' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 'UTC+3' },

  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)', offset: 'UTC+5' },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)', offset: 'UTC+6' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: 'UTC+7' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 'UTC+9' },

  // Australia
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 'UTC+11' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)', offset: 'UTC+11' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', offset: 'UTC+10' },
  { value: 'Australia/Perth', label: 'Perth (AWST)', offset: 'UTC+8' },

  // Pacific
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)', offset: 'UTC+13' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)', offset: 'UTC+12' },
];

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York'; // Fallback
  }
}

export function getTimezoneLabel(value: string): string {
  const timezone = timezones.find((tz) => tz.value === value);
  return timezone ? `${timezone.label} (${timezone.offset})` : value;
}
