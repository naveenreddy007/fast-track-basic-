-- Seed data for Fast Track Wash services
-- Run this after creating the database schema

-- Clear existing data (optional)
DELETE FROM bookings;
DELETE FROM services;

-- Reset sequences
ALTER SEQUENCE services_id_seq RESTART WITH 1;
ALTER SEQUENCE bookings_id_seq RESTART WITH 1;

-- Insert sample services
INSERT INTO services (name_en, name_ar, description_en, description_ar, price, is_active) VALUES
('Basic Wash', 'غسيل أساسي', 'Exterior wash with premium soap and water rinse', 'غسيل خارجي بالصابون المميز وشطف بالماء', 15.00, true),
('Premium Wash', 'غسيل مميز', 'Complete exterior and interior cleaning with wax protection', 'تنظيف خارجي وداخلي كامل مع حماية الشمع', 25.00, true),
('Deluxe Detail', 'تفصيل فاخر', 'Full detailing service with premium products and tire shine', 'خدمة تفصيل كاملة بمنتجات مميزة ولمعان الإطارات', 45.00, true),
('Express Clean', 'تنظيف سريع', 'Quick 15-minute exterior wash for busy schedules', 'غسيل خارجي سريع لمدة 15 دقيقة للجداول المزدحمة', 10.00, true),
('VIP Treatment', 'معاملة كبار الشخصيات', 'Ultimate luxury car care with hand wash and premium detailing', 'العناية الفاخرة القصوى بالسيارة مع الغسيل اليدوي والتفصيل المميز', 75.00, true),
('Interior Deep Clean', 'تنظيف داخلي عميق', 'Thorough interior cleaning including seats, carpets, and dashboard', 'تنظيف داخلي شامل يشمل المقاعد والسجاد ولوحة القيادة', 35.00, true),
('Engine Bay Clean', 'تنظيف حجرة المحرك', 'Professional engine compartment cleaning and degreasing', 'تنظيف حجرة المحرك المهني وإزالة الشحوم', 20.00, true),
('Ceramic Coating', 'طلاء سيراميك', 'Long-lasting ceramic protection for paint and glass', 'حماية سيراميكية طويلة المدى للطلاء والزجاج', 150.00, true),
('Headlight Restoration', 'ترميم المصابيح الأمامية', 'Professional headlight cleaning and UV protection', 'تنظيف المصابيح الأمامية المهني والحماية من الأشعة فوق البنفسجية', 30.00, true),
('Monthly Package', 'باقة شهرية', 'Unlimited basic washes for one month (up to 8 visits)', 'غسيل أساسي غير محدود لمدة شهر واحد (حتى 8 زيارات)', 80.00, true);

-- Insert sample bookings for testing (optional)
INSERT INTO bookings (customer_name, whatsapp_number, car_type, area, full_address, preferred_date, preferred_time, status, service_id, latitude, longitude) VALUES
('Ahmed Al-Rashid', '+96599123456', 'Toyota Camry', 'Salmiya', 'Block 2, Street 15, Building 25, Salmiya', CURRENT_DATE + INTERVAL '1 day', '10:00 AM', 'pending', 1, 29.3375, 48.0758),
('Fatima Al-Zahra', '+96598765432', 'BMW X5', 'Hawalli', 'Block 4, Street 8, Building 12, Hawalli', CURRENT_DATE + INTERVAL '2 days', '2:00 PM', 'confirmed', 3, 29.3326, 48.0289),
('Mohammed Al-Sabah', '+96597654321', 'Mercedes C-Class', 'Kuwait City', 'Block 1, Street 5, Building 8, Kuwait City', CURRENT_DATE + INTERVAL '1 day', '4:00 PM', 'pending', 2, 29.3759, 47.9774),
('Sarah Al-Ahmad', '+96596543210', 'Nissan Patrol', 'Jabriya', 'Block 6, Street 12, Building 20, Jabriya', CURRENT_DATE + INTERVAL '3 days', '11:00 AM', 'pending', 5, 29.3117, 48.0298),
('Omar Al-Mutairi', '+96595432109', 'Lexus ES', 'Farwaniya', 'Block 3, Street 7, Building 15, Farwaniya', CURRENT_DATE + INTERVAL '1 day', '9:00 AM', 'confirmed', 4, 29.2775, 47.9589);

-- Display inserted data
SELECT 'Services inserted:' as info, COUNT(*) as count FROM services;
SELECT 'Bookings inserted:' as info, COUNT(*) as count FROM bookings;

-- Show all services
SELECT 
    id,
    name_en as "English Name",
    name_ar as "Arabic Name",
    price || ' KWD' as "Price",
    is_active as "Active"
FROM services 
ORDER BY id;

COMMIT;