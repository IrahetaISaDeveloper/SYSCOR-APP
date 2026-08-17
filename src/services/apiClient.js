import axios from 'axios';
const apiClient = axios.create({
  baseURL: 'https://syscor-mll9.onrender.com/api',
  withCredentials: true,
  timeout: 15000,
});
export default apiClient;