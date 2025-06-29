import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import NegotiatePage from './components/NegotiatePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 👇 Make Register the default root route */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/negotiate" element={<NegotiatePage />} />
        {/* 👇 Protect the Home route with PrivateRoute */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
