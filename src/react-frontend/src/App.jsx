import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Collection from './pages/Collection';
import Explore from './pages/Explore';
import ExploredPlanetDetail from './pages/ExploredPlanetDetail';
import CollectionPlanetDetail from './pages/CollectionPlanetDetail';
import Profile from './pages/Profile';

function App() {
  // Hide NavBar in login and register
  const location = useLocation();
  const showNavbar = location.pathname !== '/' && location.pathname !== '/register';

  return (
    <>
      {showNavbar && <AppNavbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/planet/:id" element={<ExploredPlanetDetail />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/collection/planet/:name" element={<CollectionPlanetDetail />} />
      </Routes>
  </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}