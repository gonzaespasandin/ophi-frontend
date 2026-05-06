import api from '../config/axios';

export const processBarcode = (codigo) =>
  api.post('/api/scanner/process', { codigo }).then(r => r.data);
