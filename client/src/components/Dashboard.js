import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingTransactions = async () => {
      try {
        const response = await axios.get('/pending', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPendingTransactions(response.data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('Failed to load pending transactions');
      }
    };

    fetchPendingTransactions();
  }, []);

  const handleTransactionClick = (id) => {
    // Redirect to the verify transaction page with the transaction ID
    navigate.push(`/verify-transaction/${id}`);
  };

  return (
    <div>
      <h2>Pending Transactions</h2>
      {pendingTransactions.length === 0 ? (
        <p>No pending transactions found.</p>
      ) : (
        <ul>
          {pendingTransactions.map((transaction) => (
            <li key={transaction._id}>
              <span>{transaction.amount} {transaction.currency}</span>
              <button onClick={() => handleTransactionClick(transaction._id)}>
                Verify
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}