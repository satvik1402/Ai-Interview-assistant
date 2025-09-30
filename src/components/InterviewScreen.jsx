import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Card, Button, Input, Spin, Progress, Typography } from 'antd';
import { evaluateAnswers, generateQuestions } from '../lib/aiService';
import { addQuestions } from '../store/questionsSlice';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const InterviewScreen = ({ onInterviewComplete, resumeText }) => {
  const dispatch = useDispatch();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      if (resumeText) {
        setLoading(true);
        const fetchedQuestions = await generateQuestions(resumeText);
        dispatch(addQuestions(fetchedQuestions));
        setQuestions(fetchedQuestions);
        if (fetchedQuestions.length > 0) {
          setTimeLeft(fetchedQuestions[0].time);
        }
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [dispatch, resumeText]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, questions]);

  const handleNextQuestion = async () => {
    const updatedAnswers = { ...answers, [questions[currentQuestionIndex].id]: currentAnswer };
    setAnswers(updatedAnswers);
    setCurrentAnswer('');

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(questions[nextIndex].time);
    } else {
      setLoading(true); // Show loading state
      try {
        console.log('🔄 Starting interview evaluation...');
        const evaluation = await evaluateAnswers(updatedAnswers, questions);
        console.log('✅ Evaluation complete:', evaluation);
        onInterviewComplete(updatedAnswers, evaluation);
      } catch (error) {
        console.error('❌ Evaluation failed:', error);
        // Provide fallback evaluation if AI fails
        const fallbackEvaluation = {
          score: 75,
          summary: 'Interview completed successfully. AI evaluation temporarily unavailable.',
          judgedAnswers: {}
        };
        onInterviewComplete(updatedAnswers, fallbackEvaluation);
      }
    }
  };

  if (loading) {
    const loadingMessage = questions.length > 0 ? 'Evaluating your answers...' : 'Preparing questions...';
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' }}>
        <Spin size="large">
          <div style={{ padding: 20 }}>{loadingMessage}</div>
        </Spin>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return <Card>No questions available. Please try starting a new interview.</Card>;
  }
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (timeLeft / currentQuestion.time) * 100;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      {/* Question Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <Title level={3} style={{ 
            margin: 0, 
            color: '#1f2937',
            fontSize: '1.5rem'
          }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Title>
          <div style={{
            background: currentQuestion.difficulty === 'Easy' ? '#dcfce7' : 
                       currentQuestion.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2',
            color: currentQuestion.difficulty === 'Easy' ? '#065f46' : 
                   currentQuestion.difficulty === 'Medium' ? '#92400e' : '#991b1b',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {currentQuestion.difficulty}
          </div>
        </div>

        {/* Timer Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Time Remaining</span>
            <span style={{ 
              color: timeLeft <= 10 ? '#dc2626' : '#059669',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <Progress 
            percent={progress} 
            showInfo={false}
            strokeColor={timeLeft <= 10 ? '#dc2626' : '#059669'}
            trailColor="#f3f4f6"
            strokeWidth={8}
            style={{ marginBottom: '8px' }}
          />
        </div>

        {/* Question Text */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          <Paragraph style={{ 
            fontSize: '1.1rem',
            lineHeight: '1.6',
            margin: 0,
            color: '#1f2937',
            fontWeight: '500'
          }}>
            {currentQuestion.text}
          </Paragraph>
        </div>
      </div>

      {/* Answer Input */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{ 
          display: 'block',
          marginBottom: '12px',
          color: '#374151',
          fontWeight: '600',
          fontSize: '1rem'
        }}>
          Your Answer:
        </label>
        <TextArea
          rows={6}
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Type your detailed answer here..."
          style={{
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            fontSize: '1rem',
            lineHeight: '1.5',
            padding: '16px',
            resize: 'none'
          }}
        />
        <div style={{ 
          marginTop: '8px', 
          color: '#6b7280', 
          fontSize: '0.9rem',
          textAlign: 'right'
        }}>
          {currentAnswer.length} characters
        </div>
      </div>

      {/* Action Button */}
      <div style={{ textAlign: 'center' }}>
        <Button 
          type="primary" 
          size="large"
          onClick={handleNextQuestion}
          style={{
            height: '56px',
            fontSize: '1.1rem',
            borderRadius: '12px',
            background: currentQuestionIndex === questions.length - 1 
              ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            padding: '0 32px',
            fontWeight: '600'
          }}
        >
          {currentQuestionIndex === questions.length - 1 ? '🏁 Finish Interview' : '➡️ Next Question'}
        </Button>
      </div>
    </div>
  );
};

export default InterviewScreen;


