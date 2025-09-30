import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  questionsById: {},
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    addQuestions: (state, action) => {
      action.payload.forEach((question) => {
        state.questionsById[question.id] = question.text;
      });
    },
  },
});

export const { addQuestions } = questionsSlice.actions;

export default questionsSlice.reducer;
