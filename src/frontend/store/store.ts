import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from './slices/auth_slice';

export interface RootState {
  auth: AuthState;
}

export const makeStore = (initialState?:RootState) => configureStore<RootState>({
  reducer: {
    auth: authReducer,
  },
  preloadedState: initialState,
})