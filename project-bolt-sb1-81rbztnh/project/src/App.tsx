import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import Layout from './components/Layout';
import ChatBot from './components/ChatBot/ChatBot';
import Dashboard from './pages/Dashboard';
import TransactionJournal from './pages/TransactionJournal';
import ExpenseAnalysis from './pages/ExpenseAnalysis';
import MonthlySummary from './pages/MonthlySummary';
import RaceChallenges from './pages/RaceChallenges';
import DriverProfile from './pages/DriverProfile';
import './styles/globals.css';

function App() {
  return (
    <FinancialProvider>
      <Router>
        <div className="min-h-screen bg-gray-100" dir="rtl">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionJournal />} />
              <Route path="/analysis" element={<ExpenseAnalysis />} />
              <Route path="/summary" element={<MonthlySummary />} />
              <Route path="/challenges" element={<RaceChallenges />} />
              <Route path="/profile" element={<DriverProfile />} />
            </Routes>
          </Layout>
          <ChatBot />
        </div>
      </Router>
    </FinancialProvider>
  );
}

export default App;