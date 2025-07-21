import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'date-fns';

export interface AuthState {
  user: { id: string; username: string};
  tenant: { id: string; name: string, slug: string };
}

export const initialState: AuthState = {
  user: { id: '', username: 'Guest' },
  tenant: { id: '', name: '', slug: '' },
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthState['user']>) {
      state.user = action.payload;
    },
    setTenant(state, action: PayloadAction<AuthState['tenant']>) {
      state.tenant = action.payload;
    }
  },
});

export const { setUser, setTenant } = authSlice.actions;
export default authSlice.reducer;