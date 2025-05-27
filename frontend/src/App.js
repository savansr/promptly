import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import AuthCheck from './components/AuthCheck';

function App() {
  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/"
            element={
              <AuthCheck>
                <Dashboard />
              </AuthCheck>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App; 