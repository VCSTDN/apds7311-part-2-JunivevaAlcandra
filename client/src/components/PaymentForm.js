import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object().shape({
  amount: Yup.number().required('Amount is required'),
  currency: Yup.string().required('Currency is required'),
  destinationAccount: Yup.string().required('Destination Account is required'),
  swiftCode: Yup.string().required('SWIFT Code is required')
});

export default function PaymentForm() {
  const handleSubmit = async (values) => {
    values.preventDefault();

    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You need to log in first');
      return;
    }

    try {
      const response = await axios.post(
        '/create', // The API endpoint
        { amount, currency, destinationAccount, swiftCode }, // Payment data
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      // Handle success response
      setSuccessMessage(response.data.msg);
      setError(''); // Reset error if successful
    } catch (error) {
      // Handle error response
      setError(error.response?.data?.msg || 'Server error');
      setSuccessMessage(''); // Reset success message on error
    }
  };
  
  return (
    <div>
      <h2>Make a Payment</h2>
      <Formik
        initialValues={{ amount: '', currency: '', destinationAccount: '', swiftCode: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              name="amount"
              value={values.amount}
              onChange={handleChange}
              placeholder="Amount"
            />
            <input
              type="text"
              name="currency"
              value={values.currency}
              onChange={handleChange}
              placeholder="Currency"
            />
            <input
              type="text"
              name="destinationAccount"
              value={values.destinationAccount}
              onChange={handleChange}
              placeholder="Destination Account"
            />
            <input
              type="text"
              name="swiftCode"
              value={values.swiftCode}
              onChange={handleChange}
              placeholder="SWIFT Code"
            />
            <button type="submit">Submit Payment</button>
          </form>
        )}
      </Formik>
    </div>
  );
}
