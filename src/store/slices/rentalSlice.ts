import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Agreement } from '@/types/agreement';

interface RentalState {
  agreements: Agreement[];
  selectedAgreement: Agreement | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RentalState = {
  agreements: [],
  selectedAgreement: null,
  isLoading: false,
  error: null,
};

const rentalSlice = createSlice({
  name: 'rentals',
  initialState,
  reducers: {
    setAgreements: (state, action: PayloadAction<Agreement[]>) => {
      state.agreements = action.payload;
    },
    setSelectedAgreement: (state, action: PayloadAction<Agreement | null>) => {
      state.selectedAgreement = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setAgreements, setSelectedAgreement, setLoading, setError } = rentalSlice.actions;
export default rentalSlice.reducer;