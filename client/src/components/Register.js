import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Full Name is required'),
  idNum: Yup.string().required('ID Number is required'),
  accountNum: Yup.string().required('Account Number is required'),
  username: Yup.string().required('username is required'),
  Formik: Yup.string().required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

export default function Register() {
  const navigate = useNavigate(); // Initialize navigation

  const handleSubmit = async (values) => {
    try {
      await axios.post('/register', values);
      alert('Registration successful');
      navigate.push("/login");
    } catch (error) {
      console.error('Error registering', error);
      alert('Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <Formik
        initialValues={{ fullName: '', idNum: '', accountNum: '', username: '', email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              placeholder="Full Name"
            />
            <input
              type="text"
              name="idNum"
              value={values.idNum}
              onChange={handleChange}
              placeholder="ID Number"
            />
            <input
              type="text"
              name="accountNum"
              value={values.accountNum}
              onChange={handleChange}
              placeholder="Account Number"
            />
            <input
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              placeholder="Username"
            />
            <input
              type="text"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Password"
            />
            <button type="submit">Register</button>
          </form>
        )}
      </Formik>
    </div>
  );
}
