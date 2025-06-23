// components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("user"); // adjust key if needed
  return isLoggedIn ? children : <Navigate to="/" />;
}

export default PrivateRoute;
