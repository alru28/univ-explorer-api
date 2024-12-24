import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:8080',
});

// Auth Service
export const testAuth = () => API.get('/auth/test');
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const verifyToken = (token) =>
  API.get('/auth/verify', {
    headers: { Authorization: `${token}` },
  });

// Collection Service
export const getAllCollectionPlanets = (token) =>
  API.get('/collection/planets', {
    headers: { Authorization: `${token}` },
  });
export const getCollectionPlanetDetails = (planetName, token) =>
  API.get(`/collection/planets/${planetName}`, {
    headers: { Authorization: `${token}` },
  });
export const getCollectionPlanetMoons = (planetName, token) =>
  API.get(`/collection/planets/${planetName}/moons`, {
    headers: { Authorization: `${token}` },
  });

// Exploration Service
export const getAllExploredPlanets = (token) =>
  API.get('/exploration/planets/all', {
    headers: { Authorization: `${token}` },
  });
export const getExploredPlanetById = (planetId, token) =>
  API.get(`/exploration/planets/${planetId}`, {
    headers: { Authorization: `${token}` },
  });
export const updateExploredPlanet = (planetId, planetData, token) =>
  API.put(`/exploration/planets/${planetId}`, planetData, {
    headers: { Authorization: `${token}` },
  });
export const getExploredPlanetsByUser = (username, token) =>
  API.get(`/exploration/planets/user/${username}`, {
    headers: { Authorization: `${token}` },
  });
export const generateNewExploredPlanet = (username, token) =>
  API.post(
    '/exploration/explore',
    {},
    {
      headers: {
        Authorization: `${token}`,
        'X-Username': username,
      },
    }
  );
export const getLatestExploredPlanets = (token) =>
  API.get('/exploration/latest', {
    headers: { Authorization: `${token}` },
  });