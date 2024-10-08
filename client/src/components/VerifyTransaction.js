import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function VerifyTransaction() {
  const { id } = useParams(); // Get the transaction ID from the URL
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(`/transaction/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTransaction(response.data);
      } catch (error) {
        console.error('Error fetching transaction:', error);
        alert('Failed to load transaction');
      }
    };

    fetchTransaction();
  }, [id]);

  const handleVerify = async () => {
    try {
      await axios.post(`/verify/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Transaction verified successfully');
      navigate.push('/dashboard'); // Redirect back to the dashboard after verification
    } catch (error) {
      console.error('Error verifying transaction:', error);
      alert('Failed to verify transaction');
    }
  };

  if (!transaction) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Verify Transaction</h2>
      <p>Amount: {transaction.amount}</p>
      <p>Currency: {transaction.currency}</p>
      <p>Status: {transaction.status}</p>
      <button onClick={handleVerify}>Verify Transaction</button>
    </div>
  );
}