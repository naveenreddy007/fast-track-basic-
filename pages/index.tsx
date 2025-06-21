import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, MapPin, Clock, Star, Phone, Globe } from 'lucide-react';
import { getServices, createBooking, Service } from '@/lib/supabase';
import { triggerHapticFeedback, getCurrentLocation, formatCurrency, validateWhatsAppNumber, timeSlots, carTypes, kuwaitAreas } from '@/lib/utils';
import { useForm } from 'react-hook-form';

interface BookingForm {
  customer_name: string;
  whatsapp_number: string;
  car_type: string;
  area: string;
  full_address: string;
  preferred_date: string;
  preferred_time: string;
  service_id: number;
}

interface HomeProps {
  services: Service[];
}

export default function Home({ services }: HomeProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<BookingForm>();

  const handleBookService = (service: Service) => {
    triggerHapticFeedback();
    setSelectedService(service);
    setValue('service_id', service.id);
    setShowBookingForm(true);
  };

  const handleGetLocation = async () => {
    triggerHapticFeedback();
    setLocationStatus('loading');
    
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      setLocationStatus('success');
    } catch (error) {
      console.error('Location error:', error);
      setLocationStatus('error');
    }
  };

  const onSubmit = async (data: BookingForm) => {
    triggerHapticFeedback();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const bookingData = {
        ...data,
        latitude: location?.latitude,
        longitude: location?.longitude,
        status: 'pending',
      };

      await createBooking(bookingData);
      setSubmitStatus('success');
      reset();
      setLocation(null);
      setLocationStatus('idle');
      
      setTimeout(() => {
        setShowBookingForm(false);
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Booking error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchLanguage = () => {
    triggerHapticFeedback();
    const newLocale = locale === 'en' ? 'ar' : 'en';
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  return (
    <>
      <Head>
        <title>{t('title')} - {t('subtitle')}</title>
        <meta name="description" content={t('description')} />
        <meta property="og:title" content={`${t('title')} - ${t('subtitle')}`} />
        <meta property="og:description" content={t('description')} />
      </Head>

      <div className="min-h-screen relative">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Car className="w-8 h-8 text-emerald-600" />
              <h1 className="text-xl font-bold text-gray-800">{t('title')}</h1>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={switchLanguage}
              className="glass-button haptic-feedback px-4 py-2 rounded-full flex items-center space-x-2 rtl:space-x-reverse text-gray-700 font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>{t('language.switch')}</span>
            </motion.button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass p-8 rounded-3xl mb-8"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 animate-float">
                {t('hero.title')}
                <br />
                <span className="text-sandy-600">{t('hero.subtitle')}</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                {t('hero.description')}
              </p>
              <p className="text-md md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('hero.additionalInfo')}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="glass-button haptic-feedback px-8 py-4 rounded-full text-lg font-semibold text-gray-700 inline-flex items-center space-x-2 rtl:space-x-reverse animate-glow"
              >
                <Star className="w-5 h-5" />
                <span>{t('hero.cta')}</span>
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {t('services.title')}
              </h3>
              <p className="text-lg text-gray-700">{t('services.subtitle')}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass p-6 rounded-2xl hover:scale-105 transition-all duration-300 animate-float"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                    {locale === 'ar' ? service.name_ar : service.name_en}
                  </h4>
                  <p className="text-gray-700 mb-4">
                    {locale === 'ar' ? service.description_ar : service.description_en}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-sandy-600">
                      {formatCurrency(service.price, locale)}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBookService(service)}
                    className="w-full glass-button haptic-feedback py-3 rounded-xl font-semibold text-gray-700"
                  >
                    {t('services.bookNow')}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 mt-16">
          <div className="max-w-4xl mx-auto text-center glass p-6 rounded-2xl">
            <p className="text-gray-700 mb-2">{t('footer.copyright')}</p>
            <p className="text-gray-600">{t('footer.madeIn')}</p>
          </div>
        </footer>

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowBookingForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-dark p-6 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {t('booking.title')}
                  </h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-600 hover:text-gray-800 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {submitStatus === 'success' ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="text-6xl mb-4">✅</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      {t('booking.success')}
                    </h4>
                    <p className="text-gray-700">{t('booking.successMessage')}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {selectedService && (
                      <div className="glass p-4 rounded-xl mb-4">
                        <h4 className="font-semibold text-gray-800">
                          {locale === 'ar' ? selectedService.name_ar : selectedService.name_en}
                        </h4>
                        <p className="text-sandy-600 font-bold">
                          {formatCurrency(selectedService.price, locale)}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-800 font-medium mb-2">
                        {t('booking.customerName')}
                      </label>
                      <input
                        {...register('customer_name', { required: t('booking.required') })}
                        className="w-full p-3 rounded-xl glass border-0 text-gray-800 placeholder-gray-600"
                        placeholder={t('booking.customerNamePlaceholder')}
                      />
                      {errors.customer_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-800 font-medium mb-2">
                        {t('booking.whatsappNumber')}
                      </label>
                      <input
                        {...register('whatsapp_number', {
                          required: t('booking.required'),
                          validate: (value) => validateWhatsAppNumber(value) || t('booking.invalidPhone')
                        })}
                        className="w-full p-3 rounded-xl glass border-0 text-gray-800 placeholder-gray-600"
                        placeholder={t('booking.whatsappNumberPlaceholder')}
                        type="tel"
                      />
                      {errors.whatsapp_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.whatsapp_number.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-800 font-medium mb-2">
                        {t('booking.carType')}
                      </label>
                      <select
                        {...register('car_type', { required: t('booking.required') })}
                        className="w-full p-3 rounded-xl glass border-0 text-gray-800"
                      >
                        <option value="">{t('booking.carTypePlaceholder')}</option>
                        {carTypes[locale as 'en' | 'ar'].map((type, index) => (
                          <option key={index} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.car_type && (
                        <p className="text-red-500 text-sm mt-1">{errors.car_type.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-800 font-medium mb-2">
                        {t('booking.area')}
                      </label>
                      <select
                        {...register('area', { required: t('booking.required') })}
                        className="w-full p-3 rounded-xl glass border-0 text-gray-800"
                      >
                        <option value="">{t('booking.areaPlaceholder')}</option>
                        {kuwaitAreas[locale as 'en' | 'ar'].map((area, index) => (
                          <option key={index} value={area}>{area}</option>
                        ))}
                      </select>
                      {errors.area && (
                        <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-800 font-medium mb-2">
                        {t('booking.fullAddress')}
                      </label>
                      <textarea
                        {...register('full_address', { required: t('booking.required') })}
                        className="w-full p-3 rounded-xl glass border-0 text-gray-800 placeholder-gray-600 h-20 resize-none"
                        placeholder={t('booking.fullAddressPlaceholder')}
                      />
                      {errors.full_address && (
                        <p className="text-red-500 text-sm mt-1">{errors.full_address.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-800 font-medium mb-2">
                          {t('booking.preferredDate')}
                        </label>
                        <input
                          {...register('preferred_date', { required: t('booking.required') })}
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3 rounded-xl glass border-0 text-gray-800"
                        />
                        {errors.preferred_date && (
                          <p className="text-red-500 text-sm mt-1">{errors.preferred_date.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-800 font-medium mb-2">
                          {t('booking.preferredTime')}
                        </label>
                        <select
                          {...register('preferred_time', { required: t('booking.required') })}
                          className="w-full p-3 rounded-xl glass border-0 text-gray-800"
                        >
                          <option value="">{t('booking.preferredTimePlaceholder')}</option>
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        {errors.preferred_time && (
                          <p className="text-red-500 text-sm mt-1">{errors.preferred_time.message}</p>
                        )}
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationStatus === 'loading'}
                      className={`w-full p-3 rounded-xl font-medium haptic-feedback transition-all ${
                        locationStatus === 'success'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : locationStatus === 'error'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'glass-button text-gray-700'
                      }`}
                    >
                      {locationStatus === 'loading' && '📍 Getting location...'}
                      {locationStatus === 'success' && t('booking.locationCaptured')}
                      {locationStatus === 'error' && t('booking.locationError')}
                      {locationStatus === 'idle' && t('booking.getCurrentLocation')}
                    </motion.button>

                    {submitStatus === 'error' && (
                      <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-xl">
                        {t('booking.errorMessage')}
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full glass-button haptic-feedback py-4 rounded-xl font-bold text-gray-700 disabled:opacity-50"
                    >
                      {isSubmitting ? t('booking.submitting') : t('booking.submit')}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const services = await getServices();
    
    return {
      props: {
        services,
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    console.error('Error fetching services:', error);
    
    return {
      props: {
        services: [],
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
      },
      revalidate: 60,
    };
  }
};