import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    showUserInfo: false,
    showGroupInfo: false,
  },
  reducers: {
    toggleUserInfo: (state) => {
      state.showUserInfo = !state.showUserInfo;
    },
    toggleGroupInfo: (state) => {
      state.showGroupInfo = !state.showGroupInfo;
    },
    showUserInfo: (state) => {
      state.showUserInfo = true;
    },
    showGroupInfo: (state) => {
      state.showGroupInfo = true;
    },
    closeAllPopups: (state) => {
      state.showUserInfo = false;
      state.showGroupInfo = false;
    },
  },
});

export const {
  toggleUserInfo,
  toggleGroupInfo,
  showUserInfo,
  showGroupInfo,
  closeAllPopups,
} = uiSlice.actions;

export default uiSlice.reducer;
