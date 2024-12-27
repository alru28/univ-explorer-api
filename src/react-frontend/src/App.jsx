import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Collection from './pages/Collection';
import Explore from './pages/Explore';
import ExploredPlanetDetail from './pages/ExploredPlanetDetail';
import CollectionPlanetDetail from './pages/CollectionPlanetDetail';
import Profile from './pages/Profile';
import { verifyToken } from './services/api';

export const AuthContext = React.createContext();

function App() {
  const location = useLocation();
  const { isAuthenticated, setIsAuthenticated } = React.useContext(AuthContext);
  const showNavbar = location.pathname !== '/login' && location.pathname !== '/' && location.pathname !== '/register';

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await verifyToken(token);
          setIsAuthenticated(true);
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [setIsAuthenticated]);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showNavbar && <AppNavbar />}
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/collection" /> : <Navigate to="/login" />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/collection" /> : <Register />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/collection" /> : <Login />}
        />
        <Route
          path="/collection"
          element={isAuthenticated ? <Collection /> : <Navigate to="/login" />}
        />
        <Route
          path="/explore"
          element={isAuthenticated ? <Explore /> : <Navigate to="/login" />}
        />
        <Route
          path="/explore/planet/:id"
          element={isAuthenticated ? <ExploredPlanetDetail /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/collection/planet/:name"
          element={isAuthenticated ? <CollectionPlanetDetail /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

export default function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Router>
        <App />
      </Router>
    </AuthContext.Provider>
  );
}
