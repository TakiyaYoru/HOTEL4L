import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 50px 0;
`;

const DashboardHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const DashboardTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
`;

const DashboardContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

function EmployeeDashboard() {
  const { currentUser, isEmployee } = useAuth();

  // Nếu người dùng không phải là employee, chuyển hướng về trang chủ
  if (!isEmployee) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container">
      <DashboardContainer>
        <DashboardHeader>
          <DashboardTitle>Employee Dashboard</DashboardTitle>
          <p>Welcome, {currentUser?.name || 'Employee'}!</p>
        </DashboardHeader>

        <DashboardContent>
          <h2>Employee Dashboard</h2>
          <p>This is the employee dashboard page. Here you can manage your daily tasks.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Employee Features</h3>
            <ul>
              <li>View and manage bookings</li>
              <li>Check-in and check-out guests</li>
              <li>Manage room service requests</li>
              <li>View daily schedule</li>
              <li>Customer support</li>
            </ul>
          </div>
        </DashboardContent>
      </DashboardContainer>
    </div>
  );
}

export default EmployeeDashboard;
