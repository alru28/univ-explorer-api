import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.GATEWAY_API_URL || 'http://localhost:8080',
});

// Auth Service
export const testAuth = () => API.get('/auth/test');
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const verifyToken = (token) =>
  API.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` },
  });

// Collection Service
export const getAllCollectionPlanets = (token) =>
  API.get('/collection/planets', {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getCollectionPlanetDetails = (planetName, token) =>
  API.get(`/collection/planets/${planetName}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getCollectionPlanetMoons = (planetName, token) =>
  API.get(`/collection/planets/${planetName}/moons`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Exploration Service
export const getAllExploredPlanets = (token) =>
  API.get('/exploration/planets/all', {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getExploredPlanetById = (planetId, token) =>
  API.get(`/exploration/planets/${planetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const updateExploredPlanet = (planetId, planetData, token) =>
  API.put(`/exploration/planets/${planetId}`, planetData, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getExploredPlanetsByUser = (username, token) =>
  API.get(`/exploration/planets/user/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const generateNewExploredPlanet = (username, token) =>
  API.post(
    '/exploration/explore',
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Username': username,
      },
    }
  );
export const getLatestExploredPlanets = (token) =>
  API.get('/exploration/latest', {
    headers: { Authorization: `Bearer ${token}` },
  });