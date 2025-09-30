import React from 'react';
import { Modal, Button } from 'antd';

const WelcomeBackModal = ({ open, onContinue, onRestart }) => {
  return (
    <Modal
      title="Welcome Back!"
      open={open}
      footer={[
        <Button key="restart" onClick={onRestart}>
          Start New Interview
        </Button>,
        <Button key="continue" type="primary" onClick={onContinue}>
          Continue Interview
        </Button>,
      ]}
    >
      <p>You have an unfinished interview session. Would you like to continue where you left off or start a new one?</p>
    </Modal>
  );
};

export default WelcomeBackModal;
