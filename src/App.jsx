import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs } from 'antd';
import IntervieweePage from './pages/IntervieweePage';
import InterviewerPage from './pages/InterviewerPage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabChange = (key) => {
    navigate(key);
  };

  const items = [
    {
      key: '/',
      label: 'Interviewee',
    },
    {
      key: '/interviewer',
      label: 'Interviewer',
    },
  ];

  return (
    <div className="main-container">
      <Tabs 
        activeKey={location.pathname} 
        items={items} 
        onChange={handleTabChange} 
        tabPosition={window.innerWidth < 768 ? 'top' : 'left'}
      />
      <div className="content-container">
        <Routes>
          <Route path="/" element={<IntervieweePage />} />
          <Route path="/interviewer" element={<InterviewerPage />} />
        </Routes>
      </div>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;


