// services/utils/index.js (giả định nội dung hiện có)
import * as format from './format';
import * as validation from './validation';
import * as api from './api';

// Hàm tạo mã check-in
export const generateCheckInCode = () => {
  const timestamp = Date.now().toString().slice(-8);
  return `CHECKIN-${timestamp}`;
};

export default {
  format,
  validation,
  api,
  generateCheckInCode // Export hàm generateCheckInCode
};