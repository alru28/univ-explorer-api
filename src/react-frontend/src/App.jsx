import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Collection from './pages/Collection';
import Explore from './pages/Explore';
import ExploredPlanetDetail from './pages/ExploredPlanetDetail';
import CollectionPlanetDetail from './pages/CollectionPlanetDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/planet/:id" element={<ExploredPlanetDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/collection/planet/:name" element={<CollectionPlanetDetail />} />
      </Routes>
    </Router>
  );
}

export default App;