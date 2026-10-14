import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppProvider } from './store';
import { Layout } from './components/Layout';
import HomePage from './pages/Home';
import { ServicesCatalog, ServiceDetail } from './pages/Services';
import ApplicationWizard from './pages/ApplicationWizard';
import TrackerPage from './pages/Tracker';
import { LoginPage, RegisterPage } from './pages/Auth';
import { CustomerDashboard, AgencyDashboard, AdminDashboard } from './pages/Dashboard';
import { FAQPage, ContactPage, PrivacyPage, TermsPage, AgencyInfoPage, ComingSoonPage } from './pages/StaticPages';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesCatalog />} />
            <Route path="/services/:serviceId" element={<ServiceDetailWrapper />} />
            <Route path="/apply/:serviceId" element={<ApplicationWizard />} />
            <Route path="/track" element={<TrackerPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/agency-info" element={<AgencyInfoPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/agency" element={<AgencyDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Future Services */}
            <Route path="/hotels" element={<ComingSoonPage type="hotels" />} />
            <Route path="/flights" element={<ComingSoonPage type="flights" />} />
            
            {/* Localized Routes */}
            <Route path="/ar" element={<HomePage />} />
            <Route path="/en" element={<HomePage />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

// Wrapper to extract serviceId from params
function ServiceDetailWrapper() {
  const { serviceId } = useParams<{ serviceId: string }>();
  return <ServiceDetail serviceId={serviceId || ''} />;
}

export default App;
