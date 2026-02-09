import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
<<<<<<< HEAD
import ForgotPassword from './pages/ForgotPassword';
=======
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
import ChatPage from './pages/ChatPage';
import LibraryPage from './pages/LibraryPage';
import TasksPage from './pages/TasksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DocSpacePage from './pages/DocSpacePage';
import ProfilePage from './pages/ProfilePage';
<<<<<<< HEAD
import ProtectedRoute from './components/ProtectedRoute';
=======
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
<<<<<<< HEAD
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
=======

        <Route path="/" element={<DashboardLayout />}>
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="docs" element={<DocSpacePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
