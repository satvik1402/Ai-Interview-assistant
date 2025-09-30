import React, { useState, useEffect } from 'react';
import { Input, Button, List } from 'antd';

const Chatbot = ({ missingDetails, onDetailsCollected }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [collectedDetails, setCollectedDetails] = useState({});

  useEffect(() => {
    if (missingDetails.length > 0) {
      askNextQuestion();
    }
  }, [missingDetails]);

  const askNextQuestion = (index = 0) => {
    const detail = missingDetails[index];
    if (detail) {
      setMessages((prev) => [...prev, { sender: 'bot', text: `What is your ${detail}?` }]);
    }
  };

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);

    const currentDetail = missingDetails[currentQuestionIndex];
    const newCollectedDetails = { ...collectedDetails, [currentDetail]: userInput };
    setCollectedDetails(newCollectedDetails);

    setUserInput('');

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < missingDetails.length) {
      setCurrentQuestionIndex(nextIndex);
      askNextQuestion(nextIndex);
    } else {
      onDetailsCollected(newCollectedDetails);
    }
  };

  return (
    <div style={{ marginTop: 20, border: '1px solid #d9d9d9', padding: 16, borderRadius: 8 }}>
      <h3>Please provide the missing information:</h3>
      <List
        dataSource={messages}
        renderItem={(item) => (
          <List.Item style={{ textAlign: item.sender === 'bot' ? 'left' : 'right' }}>
            <div style={{
              background: item.sender === 'bot' ? '#f0f0f0' : '#1890ff',
              color: item.sender === 'bot' ? 'black' : 'white',
              padding: '8px 12px',
              borderRadius: '10px',
              display: 'inline-block',
            }}>
              {item.text}
            </div>
          </List.Item>
        )}
      />
      <div style={{ display: 'flex', marginTop: 10 }}>
        <Input
          value={userInput}
          onChange={handleUserInput}
          onPressEnter={handleSendMessage}
          placeholder="Type your answer..."
        />
        <Button type="primary" onClick={handleSendMessage} style={{ marginLeft: 8 }}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chatbot;

