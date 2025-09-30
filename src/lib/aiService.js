import { generateQuestionsFromResume, judgeAnswer } from './geminiService';

export const generateQuestions = async (resumeText) => {
  const categories = await generateQuestionsFromResume(resumeText);
  
  // Safety check to ensure categories is valid
  if (!categories || !categories.easy || !categories.medium || !categories.hard) {
    console.error('❌ Invalid categories received from generateQuestionsFromResume:', categories);
    // Return fallback questions if categories is invalid
    return [
      { id: 'e0', text: 'Tell me about yourself and your background.', difficulty: 'Easy', time: 20 },
      { id: 'e1', text: 'What interests you about this full-stack developer position?', difficulty: 'Easy', time: 20 },
      { id: 'm0', text: 'Describe a challenging project you worked on and how you overcame obstacles.', difficulty: 'Medium', time: 60 },
      { id: 'm1', text: 'Explain the difference between React state and props.', difficulty: 'Medium', time: 60 },
      { id: 'h0', text: 'How would you optimize the performance of a React application?', difficulty: 'Hard', time: 120 },
      { id: 'h1', text: 'Design a scalable architecture for a high-traffic web application.', difficulty: 'Hard', time: 120 },
    ];
  }
  
  // Combine and structure the questions with IDs, difficulty, and time
  const questions = [
    ...categories.easy.map((q, i) => ({ id: `e${i}`, text: q, difficulty: 'Easy', time: 20 })),
    ...categories.medium.map((q, i) => ({ id: `m${i}`, text: q, difficulty: 'Medium', time: 60 })),
    ...categories.hard.map((q, i) => ({ id: `h${i}`, text: q, difficulty: 'Hard', time: 120 })),
  ];

  return questions;
};

export const evaluateAnswers = async (answers, questions) => {
  console.log('🔄 Starting AI evaluation of', questions.length, 'questions...');

  // Add a timeout to prevent hanging (30 seconds max)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Evaluation timeout')), 30000);
  });

  const evaluationPromise = new Promise(async (resolve) => {
    const judgedAnswers = {};
    let totalScore = 0;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = answers[question.id];
      
      if (answer) {
        console.log(`🤖 Judging question ${i + 1}/${questions.length}:`, question.text.substring(0, 50) + '...');
        
        try {
          const judgement = await judgeAnswer(question.text, answer);
          judgedAnswers[question.id] = { ...question, answer, ...judgement };
          totalScore += judgement.score;
          
          console.log(`✅ Question ${i + 1} scored: ${judgement.score}/10`);
          
          // Add a smaller delay between API calls to avoid rate limiting
          if (i < questions.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`❌ Failed to judge question ${i + 1}:`, error);
          // Provide a fallback score instead of failing completely
          judgedAnswers[question.id] = { 
            ...question, 
            answer, 
            score: 5, // Give a neutral score
            feedback: 'Unable to get AI feedback for this answer due to a technical issue.'
          };
          totalScore += 5;
        }
      } else {
        // Handle unanswered questions
        judgedAnswers[question.id] = { 
          ...question, 
          answer: '', 
          score: 0, 
          feedback: 'No answer provided.'
        };
      }
    }

    // Calculate final score as a percentage
    const finalScore = (totalScore / (questions.length * 10)) * 100;

    // Generate a simple summary without calling AI again to avoid more failures
    const answeredQuestions = questions.filter(q => answers[q.id]);
    const summary = `Candidate completed ${answeredQuestions.length} out of ${questions.length} questions with an overall score of ${Math.round(finalScore)}%. ${finalScore >= 70 ? 'Strong performance with good technical understanding.' : finalScore >= 50 ? 'Moderate performance with room for improvement.' : 'Needs significant improvement in technical skills.'}`;

    console.log('✅ Evaluation complete. Final score:', Math.round(finalScore) + '%');

    resolve({ score: Math.round(finalScore), summary, judgedAnswers });
  });

  try {
    return await Promise.race([evaluationPromise, timeoutPromise]);
  } catch (error) {
    console.error('❌ Evaluation failed or timed out:', error);
    // Return fallback evaluation
    const answeredQuestions = questions.filter(q => answers[q.id]);
    return {
      score: Math.round((answeredQuestions.length / questions.length) * 75),
      summary: `Interview completed with ${answeredQuestions.length} out of ${questions.length} questions answered. AI evaluation temporarily unavailable.`,
      judgedAnswers: {}
    };
  }
};

const generateSummary = async (prompt) => {
  // This is a simplified call to the Gemini API for summary generation
  // In a real app, you might use a different model or configuration
  const result = await judgeAnswer(prompt, ""); // Re-using judgeAnswer structure for simplicity
  return result.feedback; // Assuming the feedback field contains the summary
};
