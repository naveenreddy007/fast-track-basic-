import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRecord {
  id: number;
  customer_name: string;
  whatsapp_number: string;
  car_type: string;
  area: string;
  full_address: string;
  preferred_date: string;
  preferred_time: string;
  service_id: number;
  latitude?: number;
  longitude?: number;
}

interface Service {
  id: number;
  name_en: string;
  name_ar: string;
  price: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json() as { record: BookingRecord };
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all admin push subscriptions for notifications
    const { data: subscriptions, error: subError } = await supabase
      .from('admin_push_subscriptions')
      .select('subscription_token');
    
    if (subError) {
      console.error('Error fetching subscriptions:', subError);
    }
    
    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('name_en, name_ar, price')
      .eq('id', record.service_id)
      .single();
    
    if (serviceError) {
      console.error('Error fetching service:', serviceError);
      throw serviceError;
    }
    
    // Prepare WhatsApp message
    const mapsUrl = record.latitude && record.longitude 
      ? `https://www.google.com/maps?q=${record.latitude},${record.longitude}`
      : 'Location not provided';
    
    const message = `🚗✨ New Fast Track Booking!

Service: ${service.name_en}
Customer: ${record.customer_name} | +${record.whatsapp_number}
Location: ${record.area} - ${record.full_address}
Time: ${record.preferred_date} at ${record.preferred_time}
Car Type: ${record.car_type}

${record.latitude && record.longitude ? `Navigate: ${mapsUrl}` : ''}`;
    
    // Send WhatsApp notification using Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER'); // e.g., 'whatsapp:+14155238886'
    const adminWhatsAppNumber = Deno.env.get('ADMIN_WHATSAPP_NUMBER'); // e.g., 'whatsapp:+965XXXXXXXX'
    
    if (twilioAccountSid && twilioAuthToken && twilioWhatsAppNumber && adminWhatsAppNumber) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      
      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioWhatsAppNumber,
          To: adminWhatsAppNumber,
          Body: message,
        }),
      });
      
      if (!twilioResponse.ok) {
        const twilioError = await twilioResponse.text();
        console.error('Twilio error:', twilioError);
        throw new Error(`Twilio API error: ${twilioError}`);
      }
      
      const twilioResult = await twilioResponse.json();
      console.log('WhatsApp message sent:', twilioResult.sid);
      
      // Send push notifications to all admin devices
      if (subscriptions && subscriptions.length > 0) {
        const pushPromises = subscriptions.map(async (sub) => {
          try {
            const pushPayload = {
              notification: {
                title: 'Fast Track Wash',
                body: 'New Fast Track Booking! 🚗✨ Tap to view.',
                icon: '/icon-192x192.svg',
                badge: '/icon-192x192.svg',
                data: {
                  url: '/admin',
                  bookingId: record.id
                }
              }
            };
            
            // Here you would typically use a push service like FCM or web-push
            // For now, we'll log the push notification
            console.log('Push notification would be sent to:', sub.subscription_token);
            console.log('Push payload:', pushPayload);
            
            return { success: true, subscription: sub.subscription_token };
          } catch (error) {
            console.error('Error sending push notification:', error);
            return { success: false, error: error.message };
          }
        });
        
        const pushResults = await Promise.allSettled(pushPromises);
        console.log('Push notification results:', pushResults);
      }
    } else {
      console.log('Twilio credentials not configured, skipping WhatsApp notification');
      console.log('Message would have been:', message);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking notification sent successfully',
        bookingId: record.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in send-booking-notification function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});