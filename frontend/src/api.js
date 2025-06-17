import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.22.48:8007/api/v1',
});

export default api;