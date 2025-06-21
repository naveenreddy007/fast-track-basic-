-- Fast Track Wash - Complete Seed Data
-- Run this AFTER running complete-schema.sql

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM public.bookings;
-- DELETE FROM public.services;
-- DELETE FROM public.profiles WHERE role = 'admin';

-- Reset sequences (optional)
-- ALTER SEQUENCE IF EXISTS public.services_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS public.bookings_id_seq RESTART WITH 1;

-- Create admin user in auth.users table
-- Note: This creates a user with encrypted password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@fasttrackwash.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Fast Track Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create admin profile
INSERT INTO public.profiles (id, email, full_name, role, phone)
SELECT 
  id, 
  email, 
  'Fast Track Admin', 
  'admin',
  '+965-ADMIN-001'
FROM auth.users 
WHERE email = 'admin@fasttrackwash.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin', 
  full_name = 'Fast Track Admin',
  phone = '+965-ADMIN-001';

-- Insert comprehensive services data
INSERT INTO public.services (name_en, name_ar, description_en, description_ar, price, is_active) VALUES
-- Basic Services
('Basic Wash', 'غسيل أساسي', 'Exterior wash with premium soap and water rinse. Perfect for regular maintenance.', 'غسيل خارجي بالصابون المميز وشطف بالماء. مثالي للصيانة المنتظمة.', 15.00, true),
('Express Clean', 'تنظيف سريع', 'Quick 15-minute exterior wash for busy schedules. Fast and efficient service.', 'غسيل خارجي سريع لمدة 15 دقيقة للجداول المزدحمة. خدمة سريعة وفعالة.', 10.00, true),
('Interior Clean', 'تنظيف داخلي', 'Complete interior cleaning including seats, carpets, and dashboard sanitization.', 'تنظيف داخلي كامل يشمل المقاعد والسجاد وتعقيم لوحة القيادة.', 20.00, true),

-- Premium Services
('Premium Wash', 'غسيل مميز', 'Complete exterior and interior cleaning with wax protection and tire shine.', 'تنظيف خارجي وداخلي كامل مع حماية الشمع ولمعان الإطارات.', 25.00, true),
('Deluxe Detail', 'تفصيل فاخر', 'Full detailing service with premium products, wax, and interior deep clean.', 'خدمة تفصيل كاملة بمنتجات مميزة وشمع وتنظيف داخلي عميق.', 45.00, true),
('VIP Treatment', 'معاملة كبار الشخصيات', 'Ultimate luxury car care with hand wash, premium detailing, and protective coating.', 'العناية الفاخرة القصوى بالسيارة مع الغسيل اليدوي والتفصيل المميز والطلاء الواقي.', 75.00, true),

-- Specialized Services
('Engine Bay Clean', 'تنظيف حجرة المحرك', 'Professional engine compartment cleaning and degreasing for optimal performance.', 'تنظيف حجرة المحرك المهني وإزالة الشحوم للأداء الأمثل.', 30.00, true),
('Headlight Restoration', 'ترميم المصابيح الأمامية', 'Professional headlight cleaning and UV protection to restore clarity.', 'تنظيف المصابيح الأمامية المهني والحماية من الأشعة فوق البنفسجية لاستعادة الوضوح.', 35.00, true),
('Ceramic Coating', 'طلاء سيراميك', 'Long-lasting ceramic protection for paint and glass with 6-month warranty.', 'حماية سيراميكية طويلة المدى للطلاء والزجاج مع ضمان 6 أشهر.', 150.00, true),
('Paint Protection', 'حماية الطلاء', 'Advanced paint protection film application for scratch and chip resistance.', 'تطبيق فيلم حماية الطلاء المتقدم لمقاومة الخدوش والرقائق.', 200.00, true),

-- Package Deals
('Weekly Package', 'باقة أسبوعية', 'Unlimited basic washes for one week (up to 3 visits) - Great value!', 'غسيل أساسي غير محدود لمدة أسبوع واحد (حتى 3 زيارات) - قيمة رائعة!', 35.00, true),
('Monthly Package', 'باقة شهرية', 'Unlimited basic washes for one month (up to 8 visits) - Best value!', 'غسيل أساسي غير محدود لمدة شهر واحد (حتى 8 زيارات) - أفضل قيمة!', 80.00, true),
('Premium Monthly', 'باقة شهرية مميزة', 'Monthly premium wash package with 4 premium services included.', 'باقة غسيل شهرية مميزة مع 4 خدمات مميزة مشمولة.', 120.00, true),

-- Seasonal Services
('Summer Special', 'عرض الصيف', 'Complete summer car care with AC vent cleaning and UV protection.', 'عناية صيفية كاملة بالسيارة مع تنظيف فتحات التكييف والحماية من الأشعة فوق البنفسجية.', 55.00, true),
('Winter Prep', 'تحضير الشتاء', 'Winter preparation service with undercarriage wash and protective coating.', 'خدمة التحضير للشتاء مع غسيل الهيكل السفلي والطلاء الواقي.', 40.00, true);

-- Insert sample bookings for testing
INSERT INTO public.bookings (
  customer_name, 
  whatsapp_number, 
  car_type, 
  area, 
  full_address, 
  preferred_date, 
  preferred_time, 
  status, 
  service_id, 
  latitude, 
  longitude,
  notes
) VALUES
-- Pending bookings
('Ahmed Al-Rashid', '+96599123456', 'Toyota Camry 2022', 'Salmiya', 'Block 2, Street 15, Building 25, Apartment 3, Salmiya', CURRENT_DATE + INTERVAL '1 day', '10:00 AM', 'pending', 1, 29.3375, 48.0758, 'Please call before arrival'),
('Fatima Al-Zahra', '+96598765432', 'BMW X5 2021', 'Hawalli', 'Block 4, Street 8, Building 12, Villa 5, Hawalli', CURRENT_DATE + INTERVAL '2 days', '2:00 PM', 'pending', 5, 29.3326, 48.0289, 'Car is in the garage'),
('Mohammed Al-Sabah', '+96597654321', 'Mercedes C-Class 2023', 'Kuwait City', 'Block 1, Street 5, Building 8, Floor 2, Kuwait City', CURRENT_DATE + INTERVAL '1 day', '4:00 PM', 'pending', 4, 29.3759, 47.9774, 'VIP customer - priority service'),

-- Confirmed bookings
('Sarah Al-Ahmad', '+96596543210', 'Nissan Patrol 2020', 'Jabriya', 'Block 6, Street 12, Building 20, Villa 8, Jabriya', CURRENT_DATE + INTERVAL '3 days', '11:00 AM', 'confirmed', 6, 29.3117, 48.0298, 'Regular customer'),
('Omar Al-Mutairi', '+96595432109', 'Lexus ES 2022', 'Farwaniya', 'Block 3, Street 7, Building 15, Apartment 12, Farwaniya', CURRENT_DATE + INTERVAL '1 day', '9:00 AM', 'confirmed', 2, 29.2775, 47.9589, 'Express service requested'),

-- In progress bookings
('Khalid Al-Dosari', '+96594321098', 'Audi Q7 2021', 'Ahmadi', 'Block 5, Street 10, Building 30, Villa 2, Ahmadi', CURRENT_DATE, '1:00 PM', 'in_progress', 9, 29.0769, 48.0837, 'Ceramic coating application'),

-- Completed bookings
('Nora Al-Kandari', '+96593210987', 'Range Rover 2023', 'Salwa', 'Block 7, Street 3, Building 18, Villa 1, Salwa', CURRENT_DATE - INTERVAL '1 day', '3:00 PM', 'completed', 6, 29.2994, 48.0789, 'Excellent service - 5 stars'),
('Yousef Al-Qattan', '+96592109876', 'Porsche Cayenne 2022', 'Mishref', 'Block 8, Street 6, Building 22, Villa 4, Mishref', CURRENT_DATE - INTERVAL '2 days', '10:30 AM', 'completed', 12, 29.2625, 48.0875, 'Monthly package customer'),

-- Future bookings
('Layla Al-Sabah', '+96591098765', 'Tesla Model S 2023', 'Bayan', 'Block 9, Street 1, Building 5, Villa 7, Bayan', CURRENT_DATE + INTERVAL '5 days', '12:00 PM', 'confirmed', 14, 29.3042, 47.9775, 'Electric vehicle - special care needed'),
('Hassan Al-Roumi', '+96590987654', 'Ford F-150 2021', 'Jahra', 'Block 10, Street 4, Building 8, House 3, Jahra', CURRENT_DATE + INTERVAL '7 days', '8:00 AM', 'pending', 15, 29.3375, 47.6581, 'Large vehicle - extra time needed');

-- Display summary of inserted data
SELECT 'SUMMARY' as info, 'Data insertion completed successfully' as message;

SELECT 'ADMIN USER' as category, 
       email as "Email", 
       'admin123' as "Password",
       role as "Role"
FROM public.profiles 
WHERE role = 'admin';

SELECT 'SERVICES' as category, 
       COUNT(*) as "Total Services",
       COUNT(*) FILTER (WHERE is_active = true) as "Active Services",
       MIN(price) || ' - ' || MAX(price) || ' KWD' as "Price Range"
FROM public.services;

SELECT 'BOOKINGS' as category,
       COUNT(*) as "Total Bookings",
       COUNT(*) FILTER (WHERE status = 'pending') as "Pending",
       COUNT(*) FILTER (WHERE status = 'confirmed') as "Confirmed",
       COUNT(*) FILTER (WHERE status = 'in_progress') as "In Progress",
       COUNT(*) FILTER (WHERE status = 'completed') as "Completed"
FROM public.bookings;

-- Show sample services
SELECT 
    id,
    name_en as "English Name",
    name_ar as "Arabic Name",
    price || ' KWD' as "Price",
    CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END as "Status"
FROM public.services 
WHERE is_active = true
ORDER BY price;

COMMIT;