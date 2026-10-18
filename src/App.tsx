import React from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppProvider } from './store';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/Home';
import { ServicesCatalog, ServiceDetail } from './pages/Services';
import ApplicationWizard from './pages/ApplicationWizard';
import TrackerPage from './pages/Tracker';
import { LoginPage, RegisterPage } from './pages/Auth';
import { CustomerDashboard, AgencyDashboard } from './pages/Dashboard';
import { FAQPage, ContactPage, PrivacyPage, TermsPage, AgencyInfoPage, ComingSoonPage } from './pages/StaticPages';
import AdminDashboard from './pages/AdminDashboard';
import ResubmitApplication from './pages/ResubmitApplication';

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
            <Route path="/apply/:serviceId" element={<ProtectedRoute><ApplicationWizard /></ProtectedRoute>} />
            <Route path="/track" element={<TrackerPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/agency-info" element={<AgencyInfoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/applications/:id/resubmit" element={<ProtectedRoute><ResubmitApplication /></ProtectedRoute>} />
            <Route path="/agency" element={<AgencyDashboard />} />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/hotels" element={<ComingSoonPage type="hotels" />} />
            <Route path="/flights" element={<ComingSoonPage type="flights" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}
