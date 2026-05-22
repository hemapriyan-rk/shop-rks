import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/transactions/NewTransaction';
import TransactionsList from './pages/transactions/TransactionsList';
import ExpensesList from './pages/expenses/ExpensesList';
import NewExpense from './pages/expenses/NewExpense';
import BillingPage from './pages/BillingPage';
import ServicesPage from './pages/services/ServicesPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import UsersPage from './pages/users/UsersPage';
import LogsPage from './pages/logs/LogsPage';
import ProfilePage from './pages/Profile';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminExpenses from './pages/admin/AdminExpenses';
import BillLogsPage from './pages/logs/BillLogsPage';
import BanksPage from './pages/banks/BanksPage';
import BankConfig from './pages/admin/BankConfig';
import ServerManagement from './pages/admin/ServerManagement';
import ManageExpenseCategories from './pages/admin/ManageExpenseCategories';
import StorageManagement from './pages/admin/StorageManagement';
import DataExports from './pages/admin/DataExports';
import MaintenancePage from './pages/Maintenance';
import SalaryPage from './pages/admin/SalaryPage';
import IncomeManagementPage from './pages/admin/IncomeManagementPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/open" element={<LandingPage />} />
          <Route path="/" element={<Navigate to="/open" replace />} />

          {/* All authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions/new" element={<NewTransaction />} />
            <Route path="/transactions" element={<TransactionsList />} />
            <Route path="/expenses" element={<ExpensesList />} />
            <Route path="/expenses/new" element={<NewExpense />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin+ */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/banks" element={<BanksPage />} />
            <Route path="/admin/bank-config" element={<BankConfig />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/expenses" element={<AdminExpenses />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/admin/bill-logs" element={<BillLogsPage />} />
            <Route path="/admin/expense-categories" element={<ManageExpenseCategories />} />
            <Route path="/admin/salary" element={<SalaryPage />} />
            <Route path="/admin/exports" element={<DataExports />} />
          </Route>

          {/* Super Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/admin/system" element={<ServerManagement />} />
            <Route path="/admin/storage" element={<StorageManagement />} />
            <Route path="/admin/income-management" element={<IncomeManagementPage />} />
          </Route>

          <Route path="/maintenance" element={<MaintenancePage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
