import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  accountNumber: Yup.string().required('Account Number is required'),
  password: Yup.string().required('Password is required')
});

  export default function Login({ history }) {
    const handleSubmit = async (values) => {
      try {
        const response = await axios.post('/login', values);
        const token = response.data.accessToken; // Get the token
        localStorage.setItem('token', token); // Save token in local storage
  
        // Decode the token to extract user info (role in this case)
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;
  
        // Redirect user based on their role
        if (userRole === 'employee') {
          history.push('/dashboard'); // Redirect to dashboard if role is employee
        } else if (userRole === 'customer') {
          history.push('/payment-form'); // Redirect to payment form if role is customer
        } else {
          history.push('/login'); // Default route (for safety)
        }
      } catch (error) {
        console.error('Login error', error);
        alert('Login failed');
      }
    };

  return (
    <div>
      <h2>Login</h2>
      <Formik
        initialValues={{ username: '', accountNumber: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              placeholder="Username"
            />
            <input
            type="text"
            name="accountNumber"
            value={values.accountNumber}
            onChange={handleChange}
            placeholder="Account Number"
          />
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Password"
            />
            <button type="submit">Login</button>
          </form>
        )}
      </Formik>
    </div>
  );
}
