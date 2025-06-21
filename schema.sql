-- Create the services table
CREATE TABLE IF NOT EXISTS services (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    customer_name VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    car_type VARCHAR(100),
    area VARCHAR(255),
    full_address TEXT,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    service_id BIGINT REFERENCES services(id),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to send booking notifications (simplified version without external HTTP calls)
CREATE OR REPLACE FUNCTION send_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the booking creation (you can extend this to send notifications via your app)
  RAISE NOTICE 'New booking created: ID %, Customer: %, Service: %', NEW.id, NEW.customer_name, NEW.service_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS booking_notification_trigger ON bookings;
CREATE TRIGGER booking_notification_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION send_booking_notification();