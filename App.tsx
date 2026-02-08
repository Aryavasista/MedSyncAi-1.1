import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Medications } from './pages/Medications';
import { AddMedication } from './pages/AddMedication';
import { Schedule } from './pages/Schedule';
import { Chat } from './pages/Chat';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/medications" element={<Layout><Medications /></Layout>} />
          <Route path="/add-medication" element={<Layout><AddMedication /></Layout>} />
          <Route path="/schedule" element={<Layout><Schedule /></Layout>} />
          <Route path="/chat" element={<Layout><Chat /></Layout>} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;