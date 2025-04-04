import api from '../utils/api';
import { API_ENDPOINTS, STORAGE_KEYS, PAYMENT_METHODS } from '../constants';

// Lấy thông tin thanh toán
export const fetchPaymentById = async (paymentId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.PAYMENTS.BASE}/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment with id ${paymentId}:`, error);
    throw error;
  }
};

// Tạo thanh toán mới
export const createPayment = async (paymentData) => {
  try {
    const paymentPayload = {
      paymentID: paymentData.paymentID || 'PAY' + Date.now().toString().slice(-8),
      paymentTime: new Date().toISOString(),
      method: paymentData.paymentMethod, // Sửa từ paymentMethod thành method để phù hợp với API
      details: paymentData.details || 'Online payment',
      totalAmount: paymentData.totalAmount,
      bookingID: paymentData.bookingID,
      description: paymentData.description || `Payment for booking ${paymentData.bookingID}`
    };

    console.log('Creating payment with data:', JSON.stringify(paymentPayload, null, 2));
    const response = await api.post(API_ENDPOINTS.PAYMENTS.BASE, paymentPayload);
    console.log('Payment created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Lấy thông tin thẻ thanh toán theo PAN
export const fetchPaymentCardByPAN = async (pan) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.PAYMENTS.CARDS}/${pan}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment card with PAN ${pan}:`, error);
    throw error;
  }
};

// Kiểm tra thẻ thanh toán của khách hàng
export const checkCustomerPaymentCard = async (customerID) => {
  try {
    const customerData = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerID}`);
    return {
      hasPaymentCard: !!customerData.data.pan,
      pan: customerData.data.pan
    };
  } catch (error) {
    console.error(`Error checking payment card for customer ${customerID}:`, error);
    return { hasPaymentCard: false, pan: null };
  }
};

// Xác thực thanh toán (giả lập)
export const verifyPayment = async (paymentData) => {
  try {
    // Giả lập xác thực thanh toán
    console.log('Verifying payment:', paymentData);
    
    // Giả lập độ trễ xác thực
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionId: 'TXN' + Date.now().toString().slice(-8),
      message: 'Payment verified successfully'
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Lấy danh sách thẻ thanh toán của người dùng
export const fetchUserPaymentCards = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    if (!currentUser) {
      throw new Error('User not logged in');
    }

    const response = await api.get(`${API_ENDPOINTS.PAYMENTS.CARDS}?customerID=${currentUser.id || currentUser.username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment cards:', error);
    throw error;
  }
};

// Thêm thẻ thanh toán mới
export const addPaymentCard = async (cardData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    if (!currentUser) {
      throw new Error('User not logged in');
    }

    const cardPayload = {
      pan: cardData.cardNumber.replace(/\s/g, ''),
      cardHolder: cardData.cardHolder,
      bank: cardData.bank,
      expireDate: new Date(cardData.expiryYear, cardData.expiryMonth - 1).toISOString(),
      customerID: currentUser.id || currentUser.username
    };

    const response = await api.post(API_ENDPOINTS.PAYMENTS.CARDS, cardPayload);
    return response.data;
  } catch (error) {
    console.error('Error adding payment card:', error);
    throw error;
  }
};

// Xóa thẻ thanh toán
export const removePaymentCard = async (pan) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.PAYMENTS.CARDS}/${pan}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing payment card ${pan}:`, error);
    throw error;
  }
};

// Cập nhật thẻ thanh toán
export const updatePaymentCard = async (pan, cardData) => {
  try {
    const cardPayload = {
      cardHolder: cardData.cardHolder,
      bank: cardData.bank,
      expireDate: new Date(cardData.expiryYear, cardData.expiryMonth - 1).toISOString()
    };

    const response = await api.put(`${API_ENDPOINTS.PAYMENTS.CARDS}/${pan}`, cardPayload);
    return response.data;
  } catch (error) {
    console.error(`Error updating payment card ${pan}:`, error);
    throw error;
  }
};

// Xử lý thanh toán PayPal
export const processPaypalPayment = async (paymentData) => {
  try {
    const response = await api.post(`${API_ENDPOINTS.PAYMENTS.BASE}/paypal`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error processing PayPal payment:', error);
    throw error;
  }
};

// Xử lý chuyển khoản ngân hàng
export const processBankTransfer = async (transferData) => {
  try {
    const response = await api.post(`${API_ENDPOINTS.PAYMENTS.BASE}/bank-transfer`, transferData);
    return response.data;
  } catch (error) {
    console.error('Error processing bank transfer:', error);
    throw error;
  }
};

// Hoàn tiền
export const processRefund = async (paymentId, refundData) => {
  try {
    const response = await api.post(`${API_ENDPOINTS.PAYMENTS.BASE}/${paymentId}/refund`, refundData);
    return response.data;
  } catch (error) {
    console.error(`Error processing refund for payment ${paymentId}:`, error);
    throw error;
  }
};

// Lấy lịch sử thanh toán của người dùng
export const fetchPaymentHistory = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    if (!currentUser) {
      throw new Error('User not logged in');
    }

    const response = await api.get(`${API_ENDPOINTS.PAYMENTS.BASE}/history?customerID=${currentUser.id || currentUser.username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

// Xác thực thẻ thanh toán
export const validatePaymentCard = async (cardData) => {
  try {
    const response = await api.post(`${API_ENDPOINTS.PAYMENTS.CARDS}/validate`, {
      pan: cardData.cardNumber.replace(/\s/g, ''),
      cardHolder: cardData.cardHolder,
      expiryDate: new Date(cardData.expiryYear, cardData.expiryMonth - 1).toISOString(),
      cvv: cardData.cvv
    });
    return response.data;
  } catch (error) {
    console.error('Error validating payment card:', error);
    throw error;
  }
};
