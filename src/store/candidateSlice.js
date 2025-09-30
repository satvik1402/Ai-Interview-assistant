import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  details: null,
  answers: {},
  score: null,
  summary: null,
  interviewStage: 'upload',
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    setDetails: (state, action) => {
      state.details = action.payload;
    },
    updateDetails: (state, action) => {
      state.details = { ...state.details, ...action.payload };
    },
    setAnswers: (state, action) => {
      state.answers = action.payload;
    },
    setInterviewStage: (state, action) => {
      state.interviewStage = action.payload;
    },
    setEvaluation: (state, action) => {
      state.score = action.payload.score;
      state.summary = action.payload.summary;
    },
    resetCandidate: () => initialState,
  },
});

export const {
  setDetails,
  updateDetails,
  setAnswers,
  setInterviewStage,
  setEvaluation,
  resetCandidate,
} = candidateSlice.actions;

export default candidateSlice.reducer;
