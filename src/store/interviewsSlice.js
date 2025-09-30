import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  completed: [],
};

const interviewsSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    completeInterview: (state, action) => {
      const { candidateDetails, answers, evaluation } = action.payload;
      state.completed.unshift({
        id: `interview-${Date.now()}`,
        timestamp: new Date().toISOString(),
        details: candidateDetails,
        answers,
        score: evaluation.score,
        summary: evaluation.summary,
        judgedAnswers: evaluation.judgedAnswers,
      });
    },
    clearAllInterviews: (state) => {
      state.completed = [];
    },
    keepOnlySpecificInterview: (state, action) => {
      const { interviewId } = action.payload;
      state.completed = state.completed.filter(interview => interview.id === interviewId);
    },
  },
});

export const { completeInterview, clearAllInterviews, keepOnlySpecificInterview } = interviewsSlice.actions;

export default interviewsSlice.reducer;
