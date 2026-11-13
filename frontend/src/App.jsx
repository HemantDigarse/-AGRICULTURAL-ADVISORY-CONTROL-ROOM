import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import GenerateAdvisory from './pages/GenerateAdvisory';
import AgentControlRoom from './pages/AgentControlRoom';
import WeatherIntelligence from './pages/WeatherIntelligence';
import MarketIntelligence from './pages/MarketIntelligence';
import GovernmentSchemes from './pages/GovernmentSchemes';
import RiskAlertCenter from './pages/RiskAlertCenter';
import AdvisoryReport from './pages/AdvisoryReport';

export default function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generate" element={<GenerateAdvisory />} />
        <Route path="/agents" element={<AgentControlRoom />} />
        <Route path="/weather" element={<WeatherIntelligence />} />
        <Route path="/market" element={<MarketIntelligence />} />
        <Route path="/schemes" element={<GovernmentSchemes />} />
        <Route path="/alerts" element={<RiskAlertCenter />} />
        <Route path="/report/:requestId" element={<AdvisoryReport />} />
        <Route path="/report" element={<AdvisoryReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
