import React from 'react';
import { Redirect, Route } from 'react-router-dom';

function PrivateRoute({ component: Component, ...rest }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Redirect to="/login" />; // Redirect to login if no token
  }

  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  return (
    <Route
      {...rest}
      render={(props) =>
        userRole === rest.role ? (
          <Component {...props} /> // Render the component if the role matches
        ) : (
          <Redirect to="/login" /> // Redirect to login if roles don't match
        )
      }
    />
  );
}

export default PrivateRoute;
