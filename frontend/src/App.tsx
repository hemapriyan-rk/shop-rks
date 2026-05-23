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
import TermsPage from './pages/TermsPage';
import DeveloperPage from './pages/DeveloperPage';
import ServicesPage from './pages/services/ServicesPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import UsersPage from './pages/users/UsersPage';
import LogsPage from './pages/logs/LogsPage';
import ProfilePage from './pages/Profile';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminExpenses from './pages/admin/AdminExpenses';
import AutomaticTransactionsPage from './pages/admin/AutomaticTransactionsPage';
import UserPerformancePage from './pages/admin/UserPerformancePage';
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
import RenderMaintenancePage from './pages/admin/RenderMaintenancePage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import SystemAlertsPage from './pages/admin/SystemAlertsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
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

          {/* Admin+ */ /* Custom roles can access these depending on permissions */}
          <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN', 'SUPER_ADMIN']} permissionKey="services" />}>
            <Route path="/services" element={<ServicesPage />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN', 'SUPER_ADMIN']} permissionKey="expenseCategories" />}>
            <Route path="/admin/expense-categories" element={<ManageExpenseCategories />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} permissionKey="banks" />}>
            <Route path="/banks" element={<BanksPage />} />
            <Route path="/admin/bank-config" element={<BankConfig />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} permissionKey="allRecords" />}>
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/expenses" element={<AdminExpenses />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} permissionKey="salaryLogs" />}>
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/admin/bill-logs" element={<BillLogsPage />} />
            <Route path="/admin/salary" element={<SalaryPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} permissionKey="analytics" />}>
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/exports" element={<DataExports />} />
          </Route>

          {/* Super Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/admin/roles" element={<RoleManagementPage />} />
            <Route path="/admin/system" element={<ServerManagement />} />
            <Route path="/admin/render" element={<RenderMaintenancePage />} />
            <Route path="/admin/storage" element={<StorageManagement />} />
            <Route path="/admin/auto-transactions" element={<AutomaticTransactionsPage />} />
            <Route path="/admin/user-performance" element={<UserPerformancePage />} />
            <Route path="/admin/income-management" element={<IncomeManagementPage />} />
            <Route path="/admin/alerts" element={<SystemAlertsPage />} />
          </Route>

          <Route path="/maintenance" element={<MaintenancePage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
