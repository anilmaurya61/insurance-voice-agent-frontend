import axios from 'axios';

const API_BASE = 'https://insurance-voice-agent.onrender.com/api';

export const checkUserSelection = (userId) =>
  axios.get(`${API_BASE}/selection/${userId}`);

export const getPlanDetails = (planType) =>
  axios.get(`${API_BASE}/plan/${planType}`);

export const getRecommendedRiders = (age) =>
  axios.get(`${API_BASE}/riders`, {
    params: { age }
  });

export const saveUserSelection = (data) =>
  axios.post(`${API_BASE}/selection`, data);
