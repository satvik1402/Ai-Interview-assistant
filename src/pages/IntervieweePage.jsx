import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Upload, Button, message, Card, Typography, Row, Col, Steps } from 'antd';
import { UploadOutlined, UserOutlined, SolutionOutlined, SmileOutlined } from '@ant-design/icons';
import { parseResume } from '../lib/resumeParser';
import { evaluateAnswers } from '../lib/aiService';
import Chatbot from '../components/Chatbot';
import InterviewScreen from '../components/InterviewScreen';
import WelcomeBackModal from '../components/WelcomeBackModal';
import {
  setDetails,
  updateDetails,
  setAnswers,
  setInterviewStage,
  setEvaluation,
  resetCandidate,
} from '../store/candidateSlice';
import { completeInterview } from '../store/interviewsSlice';

const { Title, Paragraph } = Typography;
const { Step } = Steps;

const IntervieweePage = () => {
  const dispatch = useDispatch();
  const candidateState = useSelector((state) => state.candidate);
  const { questionsById } = useSelector((state) => state.questions);
  const { details: candidateDetails, interviewStage } = candidateState;
  const [fileList, setFileList] = useState([]);
  const [missingDetails, setMissingDetails] = useState([]);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    if (interviewStage !== 'upload' && interviewStage !== 'complete') {
      setShowWelcomeBack(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (candidateDetails) {
      const missing = [];
      if (!candidateDetails.name) missing.push('name');
      if (!candidateDetails.email) missing.push('email');
      if (!candidateDetails.phone) missing.push('phone');

      if (missing.length > 0) {
        setMissingDetails(missing);
        dispatch(setInterviewStage('collect_details'));
      } else if (interviewStage !== 'in_progress' && interviewStage !== 'complete') {
        dispatch(setInterviewStage('ready'));
      }
    }
  }, [candidateDetails, dispatch, interviewStage]);

  const handleFileChange = async (info) => {
    setFileList([info.file]);
    const file = info.file.originFileObj || info.file;

    if (file) {
      const key = 'parsing';
      message.loading({ content: 'Parsing resume...', key });
      try {
        const details = await parseResume(file);
        dispatch(setDetails(details));
        message.success({ content: 'Resume parsed successfully!', key });
      } catch (error) {
        message.error({ content: `Error: ${error.message}`, key });
      }
    }
  };

  const handleDetailsCollected = (collectedDetails) => {
    dispatch(updateDetails(collectedDetails));
  };

  const handleInterviewComplete = async (answers, evaluation) => {
    dispatch(setAnswers(answers));
    dispatch(setEvaluation(evaluation)); // Save evaluation to candidate slice for immediate feedback
    
    const payload = {
      candidateDetails,
      answers,
      evaluation,
    };
    
    dispatch(completeInterview(payload));
    dispatch(setInterviewStage('complete'));
    message.success({ content: 'Evaluation complete!' });

    setTimeout(() => {
      dispatch(resetCandidate());
    }, 5000);
  };

  const uploadProps = {
    name: 'file',
    accept: '.pdf,.docx',
    fileList,
    beforeUpload: () => false,
    onChange: handleFileChange,
    maxCount: 1,
  };

  const stageMap = {
    upload: 0,
    collect_details: 1,
    ready: 1,
    in_progress: 2,
    complete: 3,
  };

  const currentStep = stageMap[interviewStage] || 0;

  const renderContent = () => {
    switch (interviewStage) {
      case 'upload':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '32px' }}>
              <Title level={2} style={{ 
                color: '#1f2937', 
                marginBottom: '16px',
                fontSize: '2.5rem',
                fontWeight: '600'
              }}>
                Upload Your Resume
              </Title>
              <Paragraph style={{ 
                fontSize: '1.1rem', 
                color: '#6b7280',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                Upload your resume to get started with personalized interview questions. We support PDF and DOCX formats.
              </Paragraph>
            </div>
            
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '16px',
              padding: '60px 40px',
              background: '#f9fafb',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <Upload {...uploadProps}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<UploadOutlined />}
                  style={{
                    height: '60px',
                    fontSize: '1.1rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  Choose File to Upload
                </Button>
              </Upload>
              <div style={{ marginTop: '16px', color: '#9ca3af' }}>
                Drag and drop your file here, or click to browse
              </div>
            </div>
          </div>
        );
      case 'collect_details':
      case 'ready':
        return (
          <div>
            {/* Profile Information Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
              border: '1px solid #e0f2fe'
            }}>
              <Title level={3} style={{ 
                color: '#0f172a', 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                📋 Candidate Information
              </Title>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <UserOutlined style={{ fontSize: '24px', color: '#3b82f6', marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>Name</div>
                    <div style={{ color: candidateDetails.name ? '#059669' : '#dc2626', fontWeight: '500' }}>
                      {candidateDetails.name || 'Not found'}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📧</div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>Email</div>
                    <div style={{ color: candidateDetails.email ? '#059669' : '#dc2626', fontWeight: '500' }}>
                      {candidateDetails.email || 'Not found'}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>Phone</div>
                    <div style={{ color: candidateDetails.phone ? '#059669' : '#dc2626', fontWeight: '500' }}>
                      {candidateDetails.phone || 'Not found'}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {interviewStage === 'collect_details' && (
              <div style={{
                background: '#fef3c7',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #fbbf24',
                marginBottom: '24px'
              }}>
                <Paragraph style={{ margin: 0, color: '#92400e', fontWeight: '500' }}>
                  ⚠️ Some information is missing. Please provide the required details to continue.
                </Paragraph>
              </div>
            )}

            {interviewStage === 'collect_details' && (
              <Chatbot missingDetails={missingDetails} onDetailsCollected={handleDetailsCollected} />
            )}
            
            {interviewStage === 'ready' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                  borderRadius: '16px',
                  padding: '40px',
                  marginBottom: '32px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚀</div>
                  <Title level={2} style={{ color: '#065f46', marginBottom: '16px' }}>
                    Ready for Your Interview?
                  </Title>
                  <Paragraph style={{ 
                    fontSize: '1.1rem', 
                    color: '#047857',
                    maxWidth: '600px',
                    margin: '0 auto 32px'
                  }}>
                    You're all set! The interview consists of 6 carefully crafted questions:
                    <br />• 2 Easy questions (20 seconds each)
                    <br />• 2 Medium questions (60 seconds each) 
                    <br />• 2 Hard questions (120 seconds each)
                  </Paragraph>
                  
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => dispatch(setInterviewStage('in_progress'))}
                    style={{
                      height: '60px',
                      fontSize: '1.2rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                      padding: '0 40px'
                    }}
                  >
                    🎯 Start Interview
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      case 'in_progress':
        return <InterviewScreen onInterviewComplete={handleInterviewComplete} resumeText={candidateDetails.resumeText} />;
      case 'complete':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '20px',
              padding: '60px 40px',
              border: '1px solid #e0f2fe'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🎉</div>
              <Title level={1} style={{ 
                color: '#0f172a', 
                marginBottom: '16px',
                fontSize: '2.5rem'
              }}>
                Interview Complete!
              </Title>
              <Paragraph style={{ 
                fontSize: '1.2rem', 
                color: '#6b7280',
                maxWidth: '500px',
                margin: '0 auto 32px'
              }}>
                Congratulations! You've successfully completed your AI-powered interview. 
                Our system is now processing your responses and generating detailed feedback.
              </Paragraph>
              
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <Paragraph style={{ 
                  margin: 0, 
                  color: '#1e40af', 
                  fontWeight: '500',
                  fontSize: '1rem'
                }}>
                  📊 Your results have been saved to the interviewer dashboard
                  <br />
                  ⏰ This page will automatically reset in 5 seconds
                </Paragraph>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ color: '#059669', fontWeight: '600' }}>✓ Questions Answered</span>
                </div>
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ color: '#059669', fontWeight: '600' }}>✓ AI Analysis Complete</span>
                </div>
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ color: '#059669', fontWeight: '600' }}>✓ Results Saved</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <WelcomeBackModal
          open={showWelcomeBack}
          onContinue={() => setShowWelcomeBack(false)}
          onRestart={() => {
            dispatch(resetCandidate());
            setShowWelcomeBack(false);
          }}
        />
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ 
            color: 'white', 
            fontSize: '3rem', 
            fontWeight: '700',
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            AI Interview Assistant
          </Title>
          <Paragraph style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.2rem',
            margin: 0
          }}>
            Your intelligent companion for technical interviews
          </Paragraph>
        </div>

        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            {/* Progress Steps */}
            <Card 
              style={{ 
                marginBottom: '32px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Steps 
                current={currentStep}
                style={{ padding: '20px 0' }}
                size="small"
              >
                <Step 
                  title="Upload Resume" 
                  icon={<UploadOutlined />}
                  description="Upload your CV"
                />
                <Step 
                  title="Confirm Details" 
                  icon={<UserOutlined />}
                  description="Verify information"
                />
                <Step 
                  title="Interview" 
                  icon={<SolutionOutlined />}
                  description="Answer questions"
                />
                <Step 
                  title="Complete" 
                  icon={<SmileOutlined />}
                  description="View results"
                />
              </Steps>
            </Card>

            {/* Main Content */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {renderContent()}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default IntervieweePage;








