import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import { config } from '../config/config';
import { useNavigate } from 'react-router';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export default function LinkPasswordModal({ open, onClose, userEmail, onLinked }) {
  const { setLinkingPassword, setUser, setIsAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  console.log(userEmail);
  const handleClose = () => {
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
    setLinkingPassword(false); // Signal that the linking process is over
    onClose();
  };

  const handleLink = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const addPassword = await axios.post(
        `${config.API_BASE_URL}/reset-password`,
        { email: userEmail, newPassword: password },
        { withCredentials: true }
      );
      console.log('Reset password response:', addPassword);

      if (addPassword.data.success === true) {
        setSuccess('Password linked successfully!');
        
        let authenticatedUser = null;
        // If Firebase user is available, ensure session is synced
        if (auth.currentUser) {
          try {
            const idToken = await auth.currentUser.getIdToken(true);
            const sessionRes = await axios.post(
              `${config.API_BASE_URL}/auth/session`,
              { idToken },
              { withCredentials: true }
            );
            if (sessionRes.data?.user) {
              authenticatedUser = sessionRes.data.user;
            }
          } catch (sessionErr) {
            console.error('Session sync error after password link:', sessionErr);
          }
        }
        
        // Ensure AuthContext is immediately updated
        if (checkAuth) {
          const checkedUser = await checkAuth();
          if (checkedUser) authenticatedUser = checkedUser;
        } else if (authenticatedUser) {
          setUser(authenticatedUser);
          setIsAuthenticated(true);
        }

        setPassword('');
        setConfirmPassword('');
        setLinkingPassword(false);
        if (onLinked) onLinked(authenticatedUser);

        setTimeout(() => {
          setSuccess('');
          navigate('/');
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error('Link password error:', err);
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="link-password-modal-title">
      <Box sx={style} component="form" onSubmit={handleLink}>
        <Typography id="link-password-modal-title" variant="h6" fontWeight={600} mb={1}>
          Set a Password for Email Login
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your account is signed in with Google. Set a password to also enable email/password login for <b>{userEmail}</b>.
        </Typography>
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={e => setPassword(e.target.value)}
          margin="normal"
          required
          disabled={loading}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          margin="normal"
          required
          disabled={loading}
        />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Link Password'}
        </Button>
      </Box>
    </Modal>
  );
}
