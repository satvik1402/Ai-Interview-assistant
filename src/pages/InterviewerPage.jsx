import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Input, Button, Modal, Card, Typography, Row, Col, Statistic, Popconfirm } from 'antd';
import { clearAllInterviews } from '../store/interviewsSlice';

const { Search } = Input;
const { Title, Paragraph } = Typography;

const InterviewerPage = () => {
  const dispatch = useDispatch();
  const { completed: interviews } = useSelector((state) => state.interviews);
  const [searchText, setSearchText] = useState('');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Calculate statistics
  const totalInterviews = interviews.length;
  const averageScore = totalInterviews > 0 ? (interviews.reduce((acc, curr) => acc + curr.score, 0) / totalInterviews).toFixed(2) : 0;
  const highestScore = totalInterviews > 0 ? Math.max(...interviews.map(i => i.score)) : 0;

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedInterview(null);
  };

  const handleClearAllData = () => {
    dispatch(clearAllInterviews());
  };

  const filteredInterviews = interviews.filter((interview) =>
    interview.details.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Candidate Name',
      dataIndex: ['details', 'name'],
      key: 'name',
      sorter: (a, b) => a.details.name.localeCompare(b.details.name),
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => timestamp ? new Date(timestamp).toLocaleString() : 'N/A',
      sorter: (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => a.score - b.score,
      render: (score) => `${score ? score.toFixed(0) : 0}%`,
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      key: 'summary',
      responsive: ['md'],
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleViewDetails(record)}>View Details</Button>
      ),
    },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)',
      padding: '20px 0'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ 
            color: 'white', 
            fontSize: '3rem', 
            fontWeight: '700',
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            📊 Interviewer Dashboard
          </Title>
          <Paragraph style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.2rem',
            margin: 0
          }}>
            Monitor candidate performance and interview analytics
          </Paragraph>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
          <Col xs={24} sm={8}>
            <Card style={{
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👥</div>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>Total Interviews</span>}
                  value={totalInterviews} 
                  valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📈</div>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>Average Score</span>}
                  value={averageScore}
                  suffix="%"
                  valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</div>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>Highest Score</span>}
                  value={highestScore}
                  suffix="%"
                  valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Data Table */}
        <Card style={{
          borderRadius: '20px',
          border: 'none',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                📋 Interview Records
              </Title>
              <Paragraph style={{ margin: 0, color: '#6b7280' }}>
                Manage and review candidate interviews
              </Paragraph>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Search
                placeholder="🔍 Search candidates..."
                onSearch={handleSearch}
                style={{ width: 280 }}
                size="large"
              />
              <Popconfirm
                title="Clear All Data"
                description="Are you sure you want to delete all interview records? This action cannot be undone."
                onConfirm={handleClearAllData}
                okText="Yes, Clear All"
                cancelText="Cancel"
                okType="danger"
              >
                <Button 
                  danger 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  🗑️ Clear All
                </Button>
              </Popconfirm>
            </div>
          </div>
          
          <Table
            columns={columns}
            dataSource={filteredInterviews}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} interviews`,
              style: { marginTop: '24px' }
            }}
            scroll={{ x: 'max-content' }}
            style={{
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          />
        </Card>

        {/* Interview Details Modal */}
        {selectedInterview && (
        <Modal
          title={`Interview Details: ${selectedInterview.details.name}`}
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={[
            <Button key="close" onClick={handleCloseModal}>Close</Button>,
          ]}
          width={800}
        >
          <Card title="Candidate Profile">
            <Paragraph><strong>Name:</strong> {selectedInterview.details.name}</Paragraph>
            <Paragraph><strong>Email:</strong> {selectedInterview.details.email}</Paragraph>
            <Paragraph><strong>Phone:</strong> {selectedInterview.details.phone}</Paragraph>
          </Card>
          <Card title="Interview Transcript" style={{ marginTop: 20 }}>
            {selectedInterview && selectedInterview.judgedAnswers && Object.keys(selectedInterview.judgedAnswers).length > 0 ? (
              <div>
                {Object.values(selectedInterview.judgedAnswers).map((item, index) => (
                  <div key={item.id || index} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                    <Paragraph><strong>Question {index + 1} ({item.difficulty || 'Unknown'}):</strong> {item.text || 'Question text not available'}</Paragraph>
                    <Paragraph><em>Answer:</em> {item.answer || 'No answer provided'}</Paragraph>
                    <Paragraph><strong>Score:</strong> {item.score || 0}/10</Paragraph>
                    <Paragraph><strong>Feedback:</strong> {item.feedback || 'No feedback available'}</Paragraph>
                  </div>
                ))}
                <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f0f2f5', borderRadius: 8 }}>
                  <Title level={5}>Final Score: {selectedInterview.score ? selectedInterview.score.toFixed(0) : 0}%</Title>
                  <Paragraph><strong>Overall Summary:</strong> {selectedInterview.summary || 'No summary available'}</Paragraph>
                </div>
              </div>
            ) : selectedInterview && selectedInterview.answers ? (
              <div>
                <Paragraph style={{ color: '#faad14', marginBottom: 16 }}>
                  <strong>Note:</strong> This interview was completed before AI feedback was implemented. Only basic answers are available.
                </Paragraph>
                {Object.entries(selectedInterview.answers).map(([questionId, answer], index) => (
                  <div key={questionId} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                    <Paragraph><strong>Question {index + 1}:</strong> {questionId}</Paragraph>
                    <Paragraph><em>Answer:</em> {answer || 'No answer provided'}</Paragraph>
                  </div>
                ))}
                <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f0f2f5', borderRadius: 8 }}>
                  <Title level={5}>Final Score: {selectedInterview.score ? selectedInterview.score.toFixed(0) : 0}%</Title>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <Paragraph>No interview data available for this candidate.</Paragraph>
              </div>
            )}
          </Card>
        </Modal>
        )}
      </div>
    </div>
  );
};

export default InterviewerPage;




