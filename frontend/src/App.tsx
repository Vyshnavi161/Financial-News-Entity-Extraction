import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Chatbot } from "./components/Chatbot";

// Import Pages
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Analyzer } from "./pages/Analyzer";
import { DocumentAnalyzer } from "./pages/DocumentAnalyzer";
import { Monitoring } from "./pages/Monitoring";
import { Scenarios } from "./pages/Scenarios";
import { Architecture } from "./pages/Architecture";
import { Profile } from "./pages/Profile";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
import { Analytics } from "./pages/Analytics";

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-darkBg text-cyan-400">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5 animate-ping"></span>
        Authenticating Secure Session...
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-darkBg text-cyan-400">
        Authenticating Secure Session...
      </div>
    );
  }
  
  return user && user.role === "admin" ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Layout Wrapper
const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Do not show sidebar on Home, Login, and Register pages
  const showSidebar = user && !["/", "/login", "/register"].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-900">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 relative overflow-hidden">
        {showSidebar && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analyzer" element={<ProtectedRoute><Analyzer /></ProtectedRoute>} />
            <Route path="/document-analyzer" element={<ProtectedRoute><DocumentAnalyzer /></ProtectedRoute>} />
            <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
            <Route path="/scenarios" element={<ProtectedRoute><Scenarios /></ProtectedRoute>} />
            <Route path="/architecture" element={<ProtectedRoute><Architecture /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            
            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      
      {/* Floating Chatbot Assistant */}
      <Chatbot />
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
