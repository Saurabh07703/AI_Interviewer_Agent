import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinScreen from './pages/JoinScreen';
import WaitingRoom from './pages/WaitingRoom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinScreen />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview" element={<InterviewRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
