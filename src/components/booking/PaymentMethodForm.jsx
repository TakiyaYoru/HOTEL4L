import React from 'react';
import PropTypes from 'prop-types';
import { FaCreditCard, FaPaypal, FaUniversity, FaMoneyBillWave, FaQrcode } from 'react-icons/fa';
import CreditCardForm from './CreditCardForm';
import { PAYMENT_METHODS } from '../../services/constants';

function PaymentMethodForm({ formData, handleInputChange, hasPaymentCard, paymentCardInfo }) {
  // Xử lý sự kiện khi chọn phương thức thanh toán
  const handlePaymentMethodChange = (e) => {
    console.log('Payment method changed to:', e.target.value);
    handleInputChange(e);
  };
  return (
    <div className="form-section">
      <h2>Payment Method</h2>
      
      <div className="payment-methods">
        <div className="payment-method">
          <input
            type="radio"
            id="creditCard"
            name="paymentMethod"
            value={PAYMENT_METHODS.CREDIT_CARD}
            checked={formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD}
            onChange={handlePaymentMethodChange}
          />
          <label htmlFor="creditCard">
            <FaCreditCard />
            <span>Credit Card</span>
          </label>
        </div>
        
        <div className="payment-method">
          <input
            type="radio"
            id="paypal"
            name="paymentMethod"
            value={PAYMENT_METHODS.PAYPAL}
            checked={formData.paymentMethod === PAYMENT_METHODS.PAYPAL}
            onChange={handlePaymentMethodChange}
          />
          <label htmlFor="paypal">
            <FaPaypal />
            <span>PayPal</span>
          </label>
        </div>
        
        <div className="payment-method">
          <input
            type="radio"
            id="bankTransfer"
            name="paymentMethod"
            value={PAYMENT_METHODS.BANK_TRANSFER}
            checked={formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER}
            onChange={handlePaymentMethodChange}
          />
          <label htmlFor="bankTransfer">
            <FaUniversity />
            <span>Bank Transfer</span>
          </label>
        </div>
        
        <div className="payment-method">
          <input
            type="radio"
            id="cash"
            name="paymentMethod"
            value={PAYMENT_METHODS.CASH}
            checked={formData.paymentMethod === PAYMENT_METHODS.CASH}
            onChange={handlePaymentMethodChange}
          />
          <label htmlFor="cash">
            <FaMoneyBillWave />
            <span>Cash on Arrival</span>
          </label>
        </div>
      </div>
      
      {/* Thẻ tín dụng */}
      {formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD && (
        <>
          {hasPaymentCard && paymentCardInfo ? (
            <div className="saved-card-info">
              <h3>Your Saved Card</h3>
              <div className="card-details">
                <p><strong>Card Number:</strong> **** **** **** {paymentCardInfo.pan.slice(-4)}</p>
                <p><strong>Card Holder:</strong> {paymentCardInfo.cardHolder}</p>
                <p><strong>Expiry Date:</strong> {new Date(paymentCardInfo.expireDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}</p>
              </div>
              <div className="use-saved-card">
                <input
                  type="checkbox"
                  id="useSavedCard"
                  name="useSavedCard"
                  checked={formData.useSavedCard}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'useSavedCard',
                      value: e.target.checked
                    }
                  })}
                />
                <label htmlFor="useSavedCard">Use this card</label>
              </div>
            </div>
          ) : (
            <div className="no-saved-card">
              <p>You don't have any saved card. Please enter your card details below.</p>
            </div>
          )}
          
          {(!hasPaymentCard || !formData.useSavedCard) && (
            <CreditCardForm 
              formData={formData} 
              handleInputChange={handleInputChange} 
            />
          )}
        </>
      )}
      
      {/* PayPal */}
      {formData.paymentMethod === PAYMENT_METHODS.PAYPAL && (
        <div className="paypal-info">
          <p>You will be redirected to PayPal to complete your payment.</p>
          <div className="paypal-button">
            <button type="button" className="btn-paypal">
              <FaPaypal /> Pay with PayPal
            </button>
          </div>
        </div>
      )}
      
      {/* Chuyển khoản */}
      {formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
        <div className="bank-transfer-info">
          <h3>Bank Transfer Information</h3>
          <p>Please transfer the total amount to the following bank account:</p>
          <div className="bank-details">
            <p><strong>Bank:</strong> Example Bank</p>
            <p><strong>Account Name:</strong> Hotel 4L</p>
            <p><strong>Account Number:</strong> 1234567890</p>
            <p><strong>Reference:</strong> {formData.fullName || 'Your booking'}</p>
          </div>
          <div className="qr-code">
            <FaQrcode size={100} />
            <p>Scan QR code to transfer</p>
          </div>
          <div className="bank-transfer-confirmation">
            <input
              type="checkbox"
              id="transferConfirmed"
              name="transferConfirmed"
              checked={formData.transferConfirmed}
              onChange={(e) => handleInputChange({
                target: {
                  name: 'transferConfirmed',
                  value: e.target.checked
                }
              })}
            />
            <label htmlFor="transferConfirmed">I confirm that I have completed the bank transfer</label>
          </div>
        </div>
      )}
      
      {/* Tiền mặt */}
      {formData.paymentMethod === PAYMENT_METHODS.CASH && (
        <div className="cash-info">
          <p>You will pay the total amount at the hotel reception during check-in.</p>
          <div className="cash-note">
            <p><strong>Note:</strong> Please bring exact amount in cash. We accept VND, USD, and EUR.</p>
          </div>
        </div>
      )}
    </div>
  );
}

PaymentMethodForm.propTypes = {
  formData: PropTypes.shape({
    paymentMethod: PropTypes.string.isRequired,
    cardNumber: PropTypes.string,
    cardName: PropTypes.string,
    expiryDate: PropTypes.string,
    cvv: PropTypes.string,
    useSavedCard: PropTypes.bool,
    transferConfirmed: PropTypes.bool,
    fullName: PropTypes.string
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  hasPaymentCard: PropTypes.bool,
  paymentCardInfo: PropTypes.shape({
    pan: PropTypes.string,
    cardHolder: PropTypes.string,
    expireDate: PropTypes.string,
    bank: PropTypes.string
  })
};

PaymentMethodForm.defaultProps = {
  hasPaymentCard: false,
  paymentCardInfo: null
};

export default PaymentMethodForm;
