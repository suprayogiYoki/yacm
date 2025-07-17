import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  user: null | { id: string; username: string };
}

export const initialState: AuthState = {
  user: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthState['user']>) {
      state.user = action.payload;
    },
    // setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
    //   state.user = action.payload.user;
    //   state.token = action.payload.token;
    // },
    // logout: (state) => {
    //   state.user = null;
    //   state.token = null;
    // },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;