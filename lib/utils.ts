// Haptic feedback utility
export const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // 50ms vibration
  }
};

// Geolocation utility
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

// Format currency for Kuwait
export const formatCurrency = (amount: number, locale: string = 'en') => {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-KW' : 'en-KW', {
    style: 'currency',
    currency: 'KWD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

// Format date for display
export const formatDate = (date: string, locale: string = 'en') => {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-KW' : 'en-KW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Generate Google Maps URL
export const generateMapsUrl = (latitude: number, longitude: number) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

// Validate WhatsApp number (Kuwait format)
export const validateWhatsAppNumber = (number: string) => {
  // Remove all non-digits
  const cleaned = number.replace(/\D/g, '');
  
  // Kuwait numbers start with 965 (country code) or local format
  const kuwaitPattern = /^(965)?[569]\d{7}$/;
  
  return kuwaitPattern.test(cleaned);
};

// Format WhatsApp number for display
export const formatWhatsAppNumber = (number: string) => {
  const cleaned = number.replace(/\D/g, '');
  
  if (cleaned.startsWith('965')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  } else {
    return `+965 ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
};

// Time slots for booking
export const timeSlots = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

// Car types
export const carTypes = {
  en: [
    'Sedan',
    'SUV',
    'Hatchback',
    'Coupe',
    'Pickup Truck',
    'Van',
    'Luxury Car',
    'Sports Car',
  ],
  ar: [
    'سيدان',
    'دفع رباعي',
    'هاتشباك',
    'كوبيه',
    'بيك أب',
    'فان',
    'سيارة فاخرة',
    'سيارة رياضية',
  ],
};

// Kuwait areas
export const kuwaitAreas = {
  en: [
    'Kuwait City',
    'Hawalli',
    'Farwaniya',
    'Mubarak Al-Kabeer',
    'Ahmadi',
    'Jahra',
    'Salmiya',
    'Mangaf',
    'Fahaheel',
    'Mahboula',
    'Fintas',
    'Sabah Al-Salem',
    'Rumaithiya',
    'Bayan',
    'Mishref',
    'Salwa',
  ],
  ar: [
    'مدينة الكويت',
    'حولي',
    'الفروانية',
    'مبارك الكبير',
    'الأحمدي',
    'الجهراء',
    'السالمية',
    'المنقف',
    'الفحيحيل',
    'المهبولة',
    'الفنطاس',
    'صباح السالم',
    'الرميثية',
    'بيان',
    'مشرف',
    'سلوى',
  ],
};

// Class name utility
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};