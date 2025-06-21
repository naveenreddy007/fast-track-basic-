import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Service {
  id: number;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: number;
  customer_name: string;
  whatsapp_number: string;
  car_type: string;
  area: string;
  full_address: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  service_id: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
  service?: Service;
}

// Database operations
export const getServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('id');
  
  if (error) throw error;
  return data as Service[];
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at' | 'service'>) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single();
  
  if (error) throw error;
  return data as Booking;
};

export const getBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Booking[];
};

export const updateBookingStatus = async (id: number, status: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Booking;
};

export const createService = async (service: Omit<Service, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();
  
  if (error) throw error;
  return data as Service;
};

export const updateService = async (id: number, service: Partial<Service>) => {
  const { data, error } = await supabase
    .from('services')
    .update(service)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Service;
};

export const deleteService = async (id: number) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};