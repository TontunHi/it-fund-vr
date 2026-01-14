import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PaymentGrid from './pages/PaymentGrid';
import ExpenseLog from './pages/ExpenseLog';
import TransactionLog from './pages/TransactionLog';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/payments" element={<PaymentGrid />} />
      <Route path="/expenses" element={<ExpenseLog />} />
      <Route path="/transactions" element={<TransactionLog />} />
    </Routes>
  );
}

export default App;