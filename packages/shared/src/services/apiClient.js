import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/env';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: API_TIMEOUT,
});

export default apiClient;
