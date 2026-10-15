import React from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppProvider } from './store';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/Home';
import { ServicesCatalog, ServiceDetail } from './pages/Services';
import ApplicationWizard from './pages/ApplicationWizard';
import TrackerPage from './pages/Tracker';
import { LoginPage, RegisterPage } from './pages/Auth';
import { CustomerDashboard, AgencyDashboard, AdminDashboard } from './pages/Dashboard';
import { FAQPage, ContactPage, PrivacyPage, TermsPage, AgencyInfoPage, ComingSoonPage } from './pages/StaticPages';

function ServiceDetailWrapper() {
  const { serviceId } = useParams<{ serviceId: string }>();
  return <ServiceDetail serviceId={serviceId || ''} />;
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/agency" element={<AgencyDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/hotels" element={<ComingSoonPage type="hotels" />} />
            <Route path="/flights" element={<ComingSoonPage type="flights" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}
