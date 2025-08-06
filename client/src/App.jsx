import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import Programs from './pages/Programs'
import ContactUs from './pages/ContactUs'
import Blogs from './pages/Blogs'
import BlogPost from './pages/BlogPost'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
//import EmailVerification from './components/EmailVerification'
import Terms from './pages/Terms'
 
import ResetPassword from './pages/ResetPassword'
// import { getProfile, finishInitialLoad } from './store/slices/authSlice'
import './App.css'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminBlogs from './pages/Admin/AdminBlogs'
import AdminContacts from './pages/Admin/AdminContacts'
import AdminTestimonials from './pages/Admin/AdminTestimonials'
import HolidayCamp from './pages/HolidayCamp'
import Branding from './pages/Branding'
import Internship from './pages/Internship'
import Login from './pages/login'
import Register from './pages/register'
import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext';
import AuthNavigator from './components/AuthNavigator';
import EmailVerification from './components/EmailVerification'
import ForgotPassword from './pages/ForgotPassword'
function App() {


  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <AuthProvider>
      <Router>
        <AuthNavigator />
        <Routes>
          <Route path="/" element={<Layout isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />}>
            <Route index element={<Home isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="programs" element={<Programs />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blog/:id" element={<BlogPost />} />
            <Route path="/holiday-camp" element={<HolidayCamp />} />
            <Route path="/branding" element={<Branding />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="auth" element={<Auth />}>
              <Route index path='login' element={<Login />} />
              <Route path='register' element={<Register />} />
            </Route>
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="terms" element={<Terms />} />
          </Route>

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminBlogs />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            {/* <Route path="contacts" element={<AdminContacts />} */}
          </Route>

          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
