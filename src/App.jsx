import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Silenciar advertencias de llaves duplicadas de framer motion
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Each child in a list should have a unique "key" prop')) return;
      originalError(...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  // Escuchar cambios de autenticación con Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthChecking) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route 
          path="/login" 
          element={!isLoggedIn ? <LoginPage /> : <Navigate to="/dashboard" />} 
        />
        
        <Route 
          path="/register" 
          element={!isLoggedIn ? <RegisterPage /> : <Navigate to="/dashboard" />} 
        />

        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;