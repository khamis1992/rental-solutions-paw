import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Payment } from '@/types/database/payment.types';

interface PaymentState {
  payments: Payment[];
  selectedPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  selectedPayment: null,
  isLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
    },
    setSelectedPayment: (state, action: PayloadAction<Payment | null>) => {
      state.selectedPayment = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPayments, setSelectedPayment, setLoading, setError } = paymentSlice.actions;
export default paymentSlice.reducer;