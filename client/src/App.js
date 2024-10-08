import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PaymentForm from './components/PaymentForm';
import VerifyTransaction from './components/VerifyTransaction';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Private routes with role-based access */}
        <Route path="/dashboard" component={Dashboard} role="employee" />
        <Route path="/verify-transaction/:id" component={VerifyTransaction} role="employee" />
        <Route path="/payment-form" component={PaymentForm} role="customer" />
        
      </Routes>
    </Router>
  );
}

export default App;
