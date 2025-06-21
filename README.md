# Fast Track Wash - Premium Car Wash Booking Service for Kuwait 🚗✨

A stunning, mobile-first car wash booking application built with Next.js, featuring glassmorphism UI, bilingual support (English/Arabic), and real-time notifications.

## 🌟 Features

- **Glassmorphism UI**: Beautiful, modern interface with floating glass elements
- **Bilingual Support**: Full English and Arabic support with RTL layout
- **Mobile-First Design**: Optimized for mobile devices with haptic feedback
- **Real-time Booking**: Live updates and notifications
- **Location Services**: GPS integration for precise service locations
- **Admin Dashboard**: Secure admin panel for managing services and bookings
- **WhatsApp Notifications**: Automated notifications via Twilio WhatsApp API
- **Google Maps Integration**: Direct navigation to customer locations

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Internationalization**: next-i18next
- **Styling**: Tailwind CSS with custom glassmorphism components
- **Fonts**: Poppins (English), Tajawal (Arabic)
- **Notifications**: Twilio WhatsApp API
- **Maps**: Google Maps API

## 🎨 Design System

### Color Palette
- **Primary**: Emerald Green (#10b981)
- **Secondary**: Cream (#fef3c7)
- **Accent**: Sandy Gold (#f59e0b)
- **Background**: Pure White (#ffffff)

### Typography
- **English**: Poppins (Google Fonts)
- **Arabic**: Tajawal (Google Fonts)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Twilio account (for WhatsApp notifications)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rohith-carwash
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Authentication
NEXT_PUBLIC_ADMIN_EMAIL=admin@fasttrackwash.com
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password

# Twilio WhatsApp (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_NUMBER=whatsapp:+965XXXXXXXX
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL commands from `schema.sql`:

```sql
-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    car_type VARCHAR(100) NOT NULL,
    area VARCHAR(255) NOT NULL,
    full_address TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    service_id INTEGER REFERENCES services(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample services
INSERT INTO services (name_en, name_ar, description_en, description_ar, price) VALUES
('Basic Wash', 'غسيل أساسي', 'Exterior wash with soap and water', 'غسيل خارجي بالصابون والماء', 15.00),
('Premium Wash', 'غسيل مميز', 'Complete wash with wax and interior cleaning', 'غسيل كامل مع الشمع وتنظيف داخلي', 25.00),
('Deluxe Detail', 'تفصيل فاخر', 'Full detailing service with premium products', 'خدمة تفصيل كاملة بمنتجات مميزة', 45.00);

-- Create function for booking notifications
CREATE OR REPLACE FUNCTION send_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be replaced by the actual Edge Function call
    PERFORM net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/send-booking-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || 'your-service-role-key'
        ),
        body := jsonb_build_object('record', row_to_json(NEW))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new bookings
CREATE OR REPLACE TRIGGER on_new_booking
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION send_booking_notification();
```

### 4. Deploy Edge Function

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Deploy the Edge Function:
```bash
supabase functions deploy send-booking-notification
```

5. Set environment variables in Supabase dashboard:
   - Go to Project Settings > Edge Functions
   - Add the Twilio environment variables

### 5. Authentication Setup

1. Go to Supabase Dashboard > Authentication > Users
2. Create an admin user with the email from your `.env.local`
3. Or use the signup form in the admin login page

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Usage

### Customer Interface

1. **Browse Services**: View available car wash services
2. **Book Service**: Fill out the booking form
3. **Location**: Use "Get My Current Location" for precise GPS coordinates
4. **Confirmation**: Receive booking confirmation

### Admin Dashboard

1. **Login**: Access `/admin/login` with admin credentials
2. **Manage Services**: Add, edit, or delete services
3. **View Bookings**: Monitor all bookings in real-time
4. **Navigation**: Click "Navigate" to open Google Maps for customer location

## 🌐 Internationalization

- **English**: Default language
- **Arabic**: Full RTL support with Arabic fonts
- **Language Switch**: Toggle between languages anywhere in the app
- **SEO**: Proper meta tags and Open Graph for both languages

## 📦 Project Structure

```
rohith-carwash/
├── pages/
│   ├── _app.tsx          # App wrapper with i18n
│   ├── _document.tsx     # Custom document with fonts
│   ├── index.tsx         # Main landing page
│   └── admin/
│       ├── index.tsx     # Admin dashboard
│       └── login.tsx     # Admin login
├── lib/
│   ├── supabase.ts       # Supabase client and utilities
│   └── utils.ts          # Helper functions
├── styles/
│   └── globals.css       # Global styles and glassmorphism
├── public/
│   └── locales/          # Translation files
│       ├── en/common.json
│       └── ar/common.json
├── supabase/
│   └── functions/
│       └── send-booking-notification/
│           └── index.ts  # Edge function for notifications
└── schema.sql            # Database schema
```

## 🔧 Configuration Files

- `next.config.js`: Next.js configuration with i18n
- `next-i18next.config.js`: Internationalization settings
- `tailwind.config.js`: Tailwind CSS with custom theme
- `tsconfig.json`: TypeScript configuration
- `postcss.config.js`: PostCSS configuration

## 🎯 Key Features Explained

### Glassmorphism UI
- Custom CSS classes for glass effects
- Backdrop blur and transparency
- Floating animations and parallax backgrounds

### Haptic Feedback
- Vibration on button presses (mobile devices)
- Enhanced user experience for touch interactions

### Real-time Updates
- Supabase real-time subscriptions
- Live booking updates in admin dashboard
- Instant service management

### Location Services
- Browser Geolocation API
- GPS coordinate capture
- Google Maps integration for navigation

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- **Netlify**: Configure build settings and environment variables
- **Railway**: Deploy with automatic builds
- **DigitalOcean App Platform**: Configure app spec

## 🔒 Security

- **Row Level Security**: Enabled on Supabase tables
- **Environment Variables**: Sensitive data stored securely
- **Admin Authentication**: Protected admin routes
- **API Keys**: Never exposed in client-side code

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection**: Check URL and API keys
2. **Translation Missing**: Verify translation files
3. **Fonts Not Loading**: Check Google Fonts configuration
4. **WhatsApp Not Working**: Verify Twilio credentials
5. **Location Not Working**: Enable location permissions

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@fasttrackwash.com

---

**Built with ❤️ for Kuwait's premium car wash services**