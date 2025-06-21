import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Car,
  LogOut,
  Save,
  X,
  Bell,
  BellRing,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { 
  supabase, 
  getServices, 
  getBookings, 
  createService, 
  updateService, 
  deleteService, 
  updateBookingStatus,
  Service, 
  Booking 
} from '@/lib/supabase';
import { triggerHapticFeedback, formatCurrency, formatDate, generateMapsUrl } from '@/lib/utils';
import { useForm } from 'react-hook-form';

interface ServiceForm {
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  is_active: boolean;
}

interface AdminProps {
  initialServices: Service[];
  initialBookings: Booking[];
}

export default function AdminDashboard({ initialServices, initialBookings }: AdminProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('bookings');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmTime, setConfirmTime] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ServiceForm>();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    refreshBookings();
    refreshServices();

    const bookingsChannel = supabase.channel('custom-bookings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('Booking change received!', payload);
        refreshBookings();
      })
      .subscribe();

    const servicesChannel = supabase.channel('custom-services-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload) => {
        console.log('Service change received!', payload);
        refreshServices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(servicesChannel);
    };
  }, [user]);

  const refreshServices = async () => {
    try {
      const newServices = await getServices();
      setServices(newServices);
    } catch (error) {
      console.error('Error refreshing services:', error);
    }
  };

  const refreshBookings = async () => {
    try {
      const newBookings = await getBookings();
      setBookings(newBookings);
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    }
  };

  const handleLogout = async () => {
    triggerHapticFeedback();
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddService = () => {
    triggerHapticFeedback();
    setEditingService(null);
    reset();
    setShowServiceForm(true);
  };

  const handleEditService = (service: Service) => {
    triggerHapticFeedback();
    setEditingService(service);
    setValue('name_en', service.name_en);
    setValue('name_ar', service.name_ar);
    setValue('description_en', service.description_en);
    setValue('description_ar', service.description_ar);
    setValue('price', service.price);
    setValue('is_active', service.is_active);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm(t('admin.services.confirmDelete'))) return;
    
    triggerHapticFeedback();
    try {
      await deleteService(id);
      await refreshServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const onSubmitService = async (data: ServiceForm) => {
    triggerHapticFeedback();
    setIsSubmitting(true);

    try {
      if (editingService) {
        await updateService(editingService.id, data);
      } else {
        await createService(data);
      }
      
      await refreshServices();
      setShowServiceForm(false);
      reset();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Push notification functions
  const requestNotificationPermission = async () => {
    triggerHapticFeedback();
    
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }
    
    if (!('serviceWorker' in navigator)) {
      alert('This browser does not support service workers');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa40HI0DLLat3eAALOhJGQwFNDtdAoU5RgQoY4S3x2RVBnb6KjjKstpfMcTVw')
        });
        
        // Save subscription to database
        const { error } = await supabase
          .from('admin_push_subscriptions')
          .upsert({
            user_id: user.id,
            subscription_token: subscription.toJSON()
          });
        
        if (error) throw error;
        
        setNotificationsEnabled(true);
        console.log('Push notifications enabled');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };
  
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  
  const handleConfirmBooking = (booking: Booking) => {
    triggerHapticFeedback();
    setSelectedBooking(booking);
    setConfirmTime(booking.preferred_time);
    setShowConfirmModal(true);
  };
  
  const generateWhatsAppConfirmation = async () => {
    if (!selectedBooking || !confirmTime) return;
    
    triggerHapticFeedback();
    
    try {
      // Update booking status and confirmed time
      await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          confirmed_time: confirmTime
        })
        .eq('id', selectedBooking.id);
      
      // Generate Arabic WhatsApp message
      const message = `مرحباً ${selectedBooking.customer_name}! 🚗✨

تم تأكيد حجز خدمة غسيل السيارة:
📅 التاريخ: ${selectedBooking.preferred_date}
⏰ الوقت المؤكد: ${confirmTime}
📍 العنوان: ${selectedBooking.full_address}
🚙 نوع السيارة: ${selectedBooking.car_type}

سيصل فريقنا في الوقت المحدد. شكراً لاختياركم Fast Track Wash! 🙏`;
      
      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${selectedBooking.whatsapp_number}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Refresh bookings
      await refreshBookings();
      setShowConfirmModal(false);
      setSelectedBooking(null);
      setConfirmTime('');
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    triggerHapticFeedback();
    try {
      await updateBookingStatus(id, status);
      await refreshBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-emerald-700 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('admin.title')} - {t('title')}</title>
      </Head>

      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="glass p-6 rounded-2xl flex justify-between items-center">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Shield className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-emerald-800">{t('admin.title')}</h1>
                <p className="text-emerald-600">Welcome, {user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {/* Bell Icon for Notifications */}
              <button
                onClick={requestNotificationPermission}
                className={`glass-button haptic-feedback p-3 rounded-xl transition-all ${
                  notificationsEnabled 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
                title="Enable Push Notifications"
              >
                {notificationsEnabled ? (
                  <BellRing className="w-6 h-6" />
                ) : (
                  <Bell className="w-6 h-6" />
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="glass-button haptic-feedback px-4 py-2 rounded-xl flex items-center space-x-2 rtl:space-x-reverse text-emerald-700"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('admin.logout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="glass p-2 rounded-2xl flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => { triggerHapticFeedback(); setActiveTab('bookings'); }}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                activeTab === 'bookings'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {t('admin.bookings.title')}
            </button>
            <button
              onClick={() => { triggerHapticFeedback(); setActiveTab('services'); }}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                activeTab === 'services'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {t('admin.services.title')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'bookings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {bookings.length === 0 ? (
                <div className="glass p-8 rounded-2xl text-center">
                  <p className="text-emerald-700">{t('admin.bookings.noBookings')}</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-6 rounded-2xl"
                  >
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <User className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">{booking.customer_name}</p>
                          <p className="text-sm text-emerald-600">{booking.whatsapp_number}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Car className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">
                            {booking.service ? (locale === 'ar' ? booking.service.name_ar : booking.service.name_en) : 'N/A'}
                          </p>
                          <p className="text-sm text-emerald-600">{booking.car_type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">{formatDate(booking.preferred_date, locale)}</p>
                          <p className="text-sm text-emerald-600">{booking.preferred_time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">{booking.area}</p>
                          <p className="text-sm text-emerald-600 truncate">{booking.full_address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <select
                          value={booking.status}
                          onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                          className="glass border-0 rounded-lg px-3 py-1 text-sm text-emerald-800"
                        >
                          <option value="pending">{t('admin.bookings.pending')}</option>
                          <option value="confirmed">{t('admin.bookings.confirmed')}</option>
                          <option value="completed">{t('admin.bookings.completed')}</option>
                          <option value="cancelled">{t('admin.bookings.cancelled')}</option>
                        </select>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t(`admin.bookings.${booking.status}`)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {/* Confirm & Notify Button for pending bookings */}
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleConfirmBooking(booking)}
                            className="glass-button haptic-feedback px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse text-emerald-700 text-sm bg-emerald-50 hover:bg-emerald-100"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirm & Notify</span>
                          </button>
                        )}
                        
                        {booking.latitude && booking.longitude && (
                          <a
                            href={generateMapsUrl(booking.latitude, booking.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => triggerHapticFeedback()}
                            className="glass-button haptic-feedback px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse text-emerald-700 text-sm"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>{t('admin.bookings.navigate')}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <button
                  onClick={handleAddService}
                  className="glass-button haptic-feedback px-6 py-3 rounded-xl flex items-center space-x-2 rtl:space-x-reverse text-emerald-700 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t('admin.services.add')}</span>
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-6 rounded-2xl"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-emerald-800 mb-2">
                        {locale === 'ar' ? service.name_ar : service.name_en}
                      </h3>
                      <p className="text-emerald-700 text-sm mb-3">
                        {locale === 'ar' ? service.description_ar : service.description_en}
                      </p>
                      <p className="text-xl font-bold text-sandy-600">
                        {formatCurrency(service.price, locale)}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.is_active ? t('admin.services.isActive') : 'Inactive'}
                      </span>
                      
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleEditService(service)}
                          className="p-2 rounded-lg glass-button haptic-feedback text-emerald-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 rounded-lg glass-button haptic-feedback text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Service Form Modal */}
        <AnimatePresence>
          {showServiceForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowServiceForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-dark p-6 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-emerald-800">
                    {editingService ? t('admin.services.edit') : t('admin.services.add')}
                  </h3>
                  <button
                    onClick={() => setShowServiceForm(false)}
                    className="text-emerald-600 hover:text-emerald-800 text-2xl"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmitService)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-emerald-800 font-medium mb-2">
                        {t('admin.services.nameEn')}
                      </label>
                      <input
                        {...register('name_en', { required: t('booking.required') })}
                        className="w-full p-3 rounded-xl glass border-0 text-emerald-800"
                      />
                      {errors.name_en && (
                        <p className="text-red-500 text-sm mt-1">{errors.name_en.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-emerald-800 font-medium mb-2">
                        {t('admin.services.nameAr')}
                      </label>
                      <input
                        {...register('name_ar', { required: t('booking.required') })}
                        className="w-full p-3 rounded-xl glass border-0 text-emerald-800"
                        dir="rtl"
                      />
                      {errors.name_ar && (
                        <p className="text-red-500 text-sm mt-1">{errors.name_ar.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-emerald-800 font-medium mb-2">
                        {t('admin.services.descriptionEn')}
                      </label>
                      <textarea
                        {...register('description_en', { required: t('booking.required') })}
                        className="w-full p-3 rounded-xl glass border-0 text-emerald-800 h-20 resize-none"
                      />
                      {errors.description_en && (
                        <p className="text-red-500 text-sm mt-1">{errors.description_en.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-emerald-800 font-medium mb-2">
                        {t('admin.services.descriptionAr')}
                      </label>
                      <textarea
                        {...register('description_ar', { required: t('booking.required') })}
                        className="w-full p-3 rounded-xl glass border-0 text-emerald-800 h-20 resize-none"
                        dir="rtl"
                      />
                      {errors.description_ar && (
                        <p className="text-red-500 text-sm mt-1">{errors.description_ar.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-emerald-800 font-medium mb-2">
                        {t('admin.services.price')}
                      </label>
                      <input
                        {...register('price', { required: t('booking.required'), min: 0 })}
                        type="number"
                        step="0.001"
                        className="w-full p-3 rounded-xl glass border-0 text-emerald-800"
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-emerald-800 font-medium mb-2">
                        {t('admin.services.isActive')}
                      </label>
                      <div className="flex items-center h-12">
                        <input
                          {...register('is_active')}
                          type="checkbox"
                          className="w-5 h-5 text-emerald-600 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 rtl:space-x-reverse pt-4">
                    <button
                      type="button"
                      onClick={() => setShowServiceForm(false)}
                      className="flex-1 glass-button haptic-feedback py-3 rounded-xl font-medium text-emerald-700"
                    >
                      {t('admin.services.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium haptic-feedback disabled:opacity-50 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? t('common.loading') : t('admin.services.save')}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass p-8 rounded-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-emerald-800">Confirm Booking</h3>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">
                      Customer
                    </label>
                    <p className="text-emerald-800">{selectedBooking.customer_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">
                      Service
                    </label>
                    <p className="text-emerald-800">
                      {selectedBooking.service ? (locale === 'ar' ? selectedBooking.service.name_ar : selectedBooking.service.name_en) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">
                      Preferred Date & Time
                    </label>
                    <p className="text-emerald-800">
                      {formatDate(selectedBooking.preferred_date, locale)} at {selectedBooking.preferred_time}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">
                      Address
                    </label>
                    <p className="text-emerald-800">{selectedBooking.full_address}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-2">
                      Confirm Wash Time *
                    </label>
                    <input
                      type="time"
                      value={confirmTime}
                      onChange={(e) => setConfirmTime(e.target.value)}
                      className="w-full glass border-0 rounded-lg px-4 py-3 text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 glass-button haptic-feedback py-3 rounded-xl font-medium text-emerald-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateWhatsAppConfirmation}
                    disabled={!confirmTime}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium haptic-feedback disabled:opacity-50 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Generate WhatsApp Confirmation</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  try {
    const [services, bookings] = await Promise.all([
      getServices(),
      getBookings()
    ]);
    
    return {
      props: {
        initialServices: services,
        initialBookings: bookings,
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
      },
    };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    
    return {
      props: {
        initialServices: [],
        initialBookings: [],
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
      },
    };
  }
};