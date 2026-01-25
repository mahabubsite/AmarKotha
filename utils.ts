// Bangladesh Locale Configuration
const LOCALE = 'bn-BD'; 

export const formatToBanglaDate = (timestamp: number): string => {
  try {
    return new Date(timestamp).toLocaleDateString(LOCALE, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return new Date(timestamp).toLocaleDateString();
  }
};

export const formatToBanglaTime = (timestamp: number): string => {
  try {
    return new Date(timestamp).toLocaleTimeString(LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return new Date(timestamp).toLocaleTimeString();
  }
};

export const formatToBanglaDateTime = (timestamp: number): string => {
  try {
    return new Date(timestamp).toLocaleString(LOCALE, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return new Date(timestamp).toLocaleString();
  }
};