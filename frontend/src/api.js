import axios from 'axios';

const api = axios.create({
  baseURL: 'http://quickfix.kryptonbpo.com.br:8007/api/v1',
});

export default api;