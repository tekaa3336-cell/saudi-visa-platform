# سفريات النخبة | Elite Visa Platform

A comprehensive Saudi travel and visa service provider platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Overview

This is a production-ready web application for an independent Saudi visa and travel service provider. It enables customers to understand, request, track, and manage travel and visa services to Saudi Arabia.

**Important:** This is an independent service platform. It does not impersonate any ministry, official portal, or government authority.

## 📋 Features

### Public Features
- **Arabic-first landing page** with RTL support and English toggle
- **Service catalog** with detailed pages for each visa/travel service
- **Application wizard** with multi-step flow and document upload
- **Public tracker** for checking application status by reference code
- **FAQ, Contact, Privacy, Terms** pages
- **B2B agency information** page with tier details

### Customer Dashboard (B2C)
- Application overview with status cards
- Application list with filters
- Application detail with timeline
- Notifications area
- Profile management

### Agency Dashboard (B2B)
- Agency status and tier information
- Wholesale pricing visibility
- Bulk CSV import for applications
- Application management table
- Export capabilities

### Admin Dashboard
- Full application management
- Status transitions with audit logging
- Service catalog editor
- Verification workflow
- Agency management
- System audit logs

## 🛠 Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 with custom theme
- **Routing:** React Router v6
- **Icons:** Lucide React
- **State Management:** React Context + useReducer
- **Database Schema:** PostgreSQL with Supabase (RLS enabled)
- **Authentication:** Supabase Auth (schema-ready)
- **Storage:** Supabase Storage (private bucket, signed URLs)

## 📁 Project Structure

```
src/
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
├── index.css            # Tailwind + custom styles
├── types.ts             # TypeScript type definitions
├── data.ts              # Mock data and service catalog
├── store.tsx            # App context and state management
├── components/
│   └── Layout.tsx       # Layout, navigation, shared UI components
└── pages/
    ├── Home.tsx         # Landing page
    ├── Services.tsx     # Service catalog and detail pages
    ├── ApplicationWizard.tsx  # Multi-step application flow
    ├── Tracker.tsx      # Public application tracker
    ├── Auth.tsx         # Login and registration
    ├── Dashboard.tsx    # Customer, Agency, Admin dashboards
    └── StaticPages.tsx  # FAQ, Contact, Privacy, Terms, Agency Info
```

## 🔐 Demo Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Customer | customer@demo.com | demo123 | B2C customer dashboard |
| Agency | agency@demo.com | demo123 | B2B agency dashboard |
| Admin | admin@demo.com | demo123 | Admin/operator dashboard |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd <project-dir>

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🌍 Customer Preferences

The platform includes a comprehensive customer preferences system:

### Features
- **First-Time Welcome Modal**: Elegant popup on first visit to select country, currency, and language
- **Persistent Top Bar Selectors**: Always-accessible dropdowns in the header for quick changes
- **Dynamic Currency Conversion**: All prices automatically convert based on selected currency
- **RTL/LTR Support**: Automatic layout direction switching based on language selection
- **Profile Sync**: Preferences saved to user profile on login/registration

### Supported Countries (15)
Saudi Arabia, UAE, Egypt, Kuwait, Qatar, Bahrain, Oman, Jordan, Pakistan, India, UK, USA, Malaysia, Indonesia, Turkey

### Supported Currencies (16)
SAR, AED, USD, EGP, KWD, QAR, BHD, OMR, JOD, GBP, EUR, PKR, INR, MYR, IDR, TRY

### How It Works
1. **First Visit**: Welcome modal appears automatically (tracked via localStorage)
2. **Selection**: User chooses country → auto-selects default currency and language
3. **Persistence**: Preferences saved to localStorage and synced with user profile on login
4. **Dynamic Updates**: All prices throughout the site update instantly
5. **Top Bar Access**: Users can change preferences anytime without page reload

### Technical Implementation
- `src/preferences.ts`: Country/currency data and conversion utilities
- `src/components/WelcomeModal.tsx`: First-visit modal component
- `src/store.tsx`: State management with preferences persistence
- `src/components/Layout.tsx`: Top bar selectors with dropdowns
- Currency conversion uses approximate rates (for demo purposes)

## 🌐 Routes

| Route | Description |
|-------|-------------|
| `/` | Home / Landing page |
| `/services` | Service catalog |
| `/services/:id` | Service detail page |
| `/apply/:id` | Application wizard |
| `/track` | Public application tracker |
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Customer dashboard |
| `/agency` | Agency dashboard |
| `/admin` | Admin dashboard |
| `/faq` | FAQ page |
| `/contact` | Contact page |
| `/privacy` | Privacy policy |
| `/terms` | Terms & conditions |
| `/agency-info` | B2B agency info |
| `/hotels` | Hotel booking (coming soon) |
| `/flights` | Flight booking (coming soon) |

## 🎨 Design System

### Colors
- **Navy:** #0F172A (primary dark)
- **Emerald:** #059669 (success/confirmation)
- **Gold:** #D97706 (accent/B2B)
- **Sand:** Neutral warm backgrounds

### Typography
- **Arabic:** Cairo (Google Fonts)
- **English:** Inter (Google Fonts)

### Features
- RTL/LTR automatic switching
- Light/Dark theme toggle
- Responsive design (mobile-first)
- Accessible (keyboard navigation, ARIA labels, focus states)
- Reduced motion support

## 🗄️ Database Schema

The `schema.sql` file contains the complete PostgreSQL schema with:
- User profiles and role assignments
- Agencies and memberships
- Services, requirements, and wholesale pricing
- Applications and applicant records
- Private document metadata
- Status events and verification records
- Payment records
- Notifications
- Audit logs
- Row Level Security (RLS) policies

## 🔒 Security Notes

- RLS policies ensure users can only access their own data
- Document storage uses private buckets with signed URLs
- Status transitions follow a defined state machine
- Verification requires explicit operator action with audit logging
- Payment is gated behind verification status
- Admin actions are logged in audit trail

## 📝 Service Types

1. **Tourist Visa** - Tourist visa assistance
2. **Family Visit** - Family visit visa assistance
3. **Personal Visit** - General visit visa assistance
4. **Business Visit** - Business visit visa assistance
5. **Work Guidance** - Work visa process guidance (not issuance)
6. **Umrah Assistance** - Umrah and Rawdah visit support
7. **Visa Facilitation** - Custom visa facilitation services

## ⚠️ Disclaimer

This platform is an independent service provider. It does not represent, affiliate with, or impersonate any government ministry or official authority of Saudi Arabia or any other country. Final decisions regarding visa issuance rest exclusively with the competent official authorities.

## 📄 License

Proprietary - All rights reserved.
