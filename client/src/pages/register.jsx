import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Link, Checkbox, FormControlLabel, Snackbar, Alert } from '@mui/material';
import quwwaLogo from '../assets/images/header.png';
import { useNavigate } from 'react-router';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { config } from '../config/config';
import { auth } from '../firebase';
import LinkPasswordModal from '../components/LinkPasswordModal';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { EmailAuthProvider, linkWithCredential } from 'firebase/auth';
// Google G icon SVG
const GoogleIcon = () => (
    <svg
        className="w-[40px] h-[40px] bg-amber-50 p-1"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Google sign-in" // Added for accessibility
        role="img"
    >
        {/* The main "G" shape is composed of four distinct paths, one for each color. */}

        {/* Blue Path */}
        <path
            fill="#4285F4"
            d="M45.12 24.52c0-1.6-.14-3.15-.4-4.62H24.4v8.69h11.62c-.5 2.82-2 5.22-4.27 6.88v5.62h7.22c4.22-3.88 6.68-9.69 6.68-16.57z"
        />
        {/* Green Path */}
        <path
            fill="#34A853"
            d="M24.4 48c6.5 0 11.96-2.14 15.94-5.81l-7.22-5.62c-2.16 1.45-4.94 2.3-8.72 2.3-6.7 0-12.37-4.49-14.4-10.48H2.46v5.81C6.44 42.62 14.63 48 24.4 48z"
        />
        {/* Yellow Path */}
        <path
            fill="#FBBC05"
            d="M9.98 28.5c-.48-1.45-.76-3-.76-4.59s.27-3.14.76-4.59V13.5H2.46C.92 16.46 0 20.28 0 24.41c0 4.13.92 7.95 2.46 10.91l7.52-5.82z"
        />
        {/* Red Path */}
        <path
            fill="#EA4335"
            d="M24.4 9.48c3.52 0 6.7.96 9.24 3.44l6.4-6.4C36.34 2.46 30.9 0 24.4 0 14.63 0 6.44 5.38 2.46 13.5l7.52 5.81c2.03-5.99 7.7-10.48 14.42-10.48z"
        />
    </svg>
);

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        schoolName: '',
        country: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [checked, setChecked] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();
    const googleProvider = new GoogleAuthProvider();
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [googleUserEmail, setGoogleUserEmail] = useState('');
    const { setLinkingPassword, linkingPassword, setUser, setIsAuthenticated } = useAuth();
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    console.log(formData);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.log(formData);
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            setLoading(false);
            return;
        }

        try {

            // Link email/password credential to this user (ensures future Google login is linked)
            console.log(formData);
            try {
                const response = await axios.post(`${config.API_BASE_URL}/auth/register`, {
                    email: formData.email,
                    password: formData.password,
                    schoolName: formData.schoolName,
                    country: formData.country,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    city: formData.district,
                    state: formData.state,
                    zipCode: formData.zipCode
                },
                    {
                        withCredentials: true
                    }
                );
                console.log(response.data);
                if (response.data.success) {

                    console.log(response.data);

                    setOpenSnackbar(true);
                    setSnackbarMessage('Registration successful');
                    setSnackbarSeverity('success');
                    setIsAuthenticated(true)
                    setUser(response.data.user);
                    setTimeout(() => navigate('/'), 1000);

                    // Redirect to login or dashboard after successful registration
                    // setTimeout(() => navigate('/'), 2000);
                }
            } catch (linkErr) {
                // It's safe to ignore 'provider-already-linked' error
                if (linkErr.code !== 'auth/provider-already-linked') {
                    console.error('Linking error:', linkErr);
                    setOpenSnackbar(true);
                    setSnackbarMessage(linkErr.response.data.message);
                    setSnackbarSeverity('error');
                }
            }
            setOpenSnackbar(true);
            // Redirect to login or dashboard after successful registration
            //setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            setError(error.message);
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            const user = result.user;

            // Try to sync with backend (e.g., /auth/session)
            try {
                const idToken = await user.getIdToken();
                console.log(idToken);
                const response = await axios.post(`${config.API_BASE_URL}/auth/session`, { idToken }, { withCredentials: true });
                // Success: navigate or let AuthContext handle
                console.log(response.data);
                if (response.data.user.password == "") {
                    setGoogleUserEmail(response.data.user.email);
                    setShowLinkModal(true);
                } else {
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                    setOpenSnackbar(true);
                    setSnackbarMessage('Registration successful');
                    setSnackbarSeverity('success');
                    setTimeout(() => navigate('/'), 1000);
                }
            } catch (backendErr) {
                console.log(backendErr);
                // Check for MySQL 'password' field error
                const msg = backendErr?.response?.data?.message || backendErr.message;
                if (msg && msg.includes("Field 'password' doesn't have a default value")) {
                    // Prompt for password linking
                    setGoogleUserEmail(user.email);
                    setShowLinkModal(true);
                    setSnackbarMessage('Please set a password to complete your account setup.');
                    setSnackbarSeverity('info');
                    setOpenSnackbar(true);
                    return;
                } else {
                    setError(msg);
                    setSnackbarMessage(msg || 'Google sign-in failed.');
                    setSnackbarSeverity('error');
                    setOpenSnackbar(true);
                    return;
                }
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            setError(error.message);
            setSnackbarMessage(error.message || 'Google sign-in failed.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };
    return (
        <div className="bg-white font-sans h-[100%]  ">
            {/* <div className='md:block sm:hidden xs:hidden'>
                <nav className="w-full flex justify-center py-3">
                    <QuwwaLogo />
                </nav>  
            </div> */}
            <main className="min-h-[calc(100vh-100px)] md:flex md:justify-center sm:flex sm:justify-start overflow-hidden">
                {/* Left Side: Branding Panel */}
                <div className="w-full hidden h-[100vh] md:block sm:block md:w-1/2 sm:w-1/2 bg-[#F2D184] flex-col md:items-start text-center md:text-left  ">
                    <div className="w-full bg-[#F2D184]">
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', mb: 1, width: '100%', pl: '0%', marginTop: '5%' }}>
                            <div className="flex items-center  mb-6 ml-10">
                                <img src={quwwaLogo} alt="Quwwa Health Logo" className="h-10 sm:h-12 md:h-16 lg:h-15 xl:h-20" />
                            </div>

                            <Typography component="h1" sx={{ ml: 5, fontSize: '2rem', fontWeight: 'bold', color: '#866118', mb: 4 }}>
                                Building healthier futures together!
                            </Typography>
                        </Box>
                        <img
                            src='/d7699b9ac2b8af917bb156b67220e266c8fb9dd6.png'
                            alt="Children running joyfully"
                            className="w-full rounded-lg h-[400px]  object-cover"
                        />
                        <Typography sx={{ color: '#6B7281', fontSize: '0.875rem', mt: 'auto', pt: 4, textAlign: 'center' }}>
                            Alpro 2026
                        </Typography>
                    </div>
                </div>

                {/* Right Side: Sign-up Form Panel */}
                <div className="w-full md:w-2/3 sm:w-1/2 h-[100%] flex justify-center p-6 bg-white md:p-2">
                    <div className="w-full max-w-md">
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'end', flexDirection: 'column', mb: 1, width: '100%', pl: '10%', marginTop: '0%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}><span>Already a member? </span> <span onClick={() => navigate("/auth/login")} className="text-blue-600 cursor-pointer">Sign in</span></Box>
                        </Box>
                        <Typography component="h2" sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', mb: 3 }}>
                            Sign up
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<GoogleIcon />}
                                onClick={handleGoogleSignUp}
                                disabled={loading}
                                sx={{
                                    py: 1.25, backgroundColor: '#4285F4', color: 'white',
                                    borderRadius: '8px', textTransform: 'none', fontSize: '1rem',
                                    boxShadow: 'none', '&:hover': { backgroundColor: '#3367D6' },
                                    '&:disabled': { backgroundColor: '#9CA3AF' }
                                }}
                            >
                                {loading ? 'Signing up...' : 'Sign up with Google'}
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                            <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                            <Typography sx={{ mx: 2, color: '#6B7281' }}>Or</Typography>
                            <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                        </Box>

                        {/* {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )} */}
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-1 gap-y-1">
                                <div>
                                    <Typography component="label" htmlFor="school-name" sx={{ fontWeight: 'bold', color: '#111827', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>School Name</Typography>
                                    <TextField
                                        size="small"
                                        id="school-name"
                                        name="schoolName"
                                        value={formData.schoolName}
                                        onChange={handleInputChange}
                                        variant="filled"
                                        fullWidth
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                borderRadius: '6px',
                                                backgroundColor: '#F3F4F6',
                                                '& .MuiInputBase-input': {
                                                    py: '8px',
                                                    px: '12px',
                                                    fontSize: '0.875rem'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <Typography component="label" htmlFor="email" sx={{ fontWeight: 'bold', color: '#111827', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>Email</Typography>
                                    <TextField
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        variant="filled"
                                        fullWidth
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                borderRadius: '6px',
                                                backgroundColor: '#F3F4F6',
                                                '& .MuiInputBase-input': {
                                                    py: '8px',
                                                    px: '12px',
                                                    fontSize: '0.875rem'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <Typography component="label" htmlFor="district" sx={{ fontWeight: 'bold', color: '#111827', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>District</Typography>
                                    <TextField
                                        size="small"
                                        id="district"
                                        variant="filled"
                                        fullWidth
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                borderRadius: '6px',
                                                backgroundColor: '#F3F4F6',
                                                '& .MuiInputBase-input': {
                                                    py: '8px',
                                                    px: '12px',
                                                    fontSize: '0.875rem'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <Typography component="label" htmlFor="state" sx={{ fontWeight: 'bold', color: '#111827', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>State</Typography>
                                    <TextField
                                        size="small"
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        variant="filled"
                                        fullWidth
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                borderRadius: '6px',
                                                backgroundColor: '#F3F4F6',
                                                '& .MuiInputBase-input': {
                                                    py: '8px',
                                                    px: '12px',
                                                    fontSize: '0.875rem'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Typography component="label" htmlFor="country" sx={{ fontWeight: 'bold', color: '#111827', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>Country</Typography>
                                    <TextField
                                        size="small"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        variant="filled"
                                        fullWidth
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                borderRadius: '6px',
                                                backgroundColor: '#F3F4F6',
                                                '& .MuiInputBase-input': {
                                                    py: '8px',
                                                    px: '12px',
                                                    fontSize: '0.875rem'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Typography component="label" htmlFor="password" sx={{ fontWeight: 'bold', color: '#111827', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>Password</Typography>
                                    <TextField
                                        size="small"
                                        id="password"
                                        type="password"
                                        helperText="6+ characters"
                                        variant="filled"
                                        fullWidth
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                borderRadius: '6px',
                                                backgroundColor: '#F3F4F6',
                                                '& .MuiInputBase-input': {
                                                    py: '8px',
                                                    px: '12px',
                                                    fontSize: '0.875rem'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <FormControlLabel
                                control={<Checkbox value="allowExtraEmails" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#EC4899' } }} />}
                                label={
                                    <Typography sx={{ fontSize: '0.875rem', color: '#4B5563' }}>
                                        Creating an account means you're okay with our{' '}
                                        <Link href="#" sx={{ color: '#EC4899' }}>Terms of Service</Link>,{' '}
                                        <Link href="#" sx={{ color: '#EC4899' }}>Privacy Policy</Link>, and our default{' '}
                                        <Link href="#" sx={{ color: '#EC4899' }}>Notification Settings</Link>.
                                    </Typography>
                                }
                                sx={{ mt: 2, alignItems: 'flex-start' }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3, mb: 2, py: 1.5, backgroundColor: '#EC4899',
                                    borderRadius: '8px', textTransform: 'none', fontSize: '1rem',
                                    boxShadow: 'none', '&:hover': { backgroundColor: '#DB2777' }
                                }}
                                onClick={handleSubmit}
                            >
                                Create Account
                            </Button>

                        </Box>
                    </div>
                </div>
            </main>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            {/* Link password modal for Google users */}
            <LinkPasswordModal
                open={showLinkModal}
                onClose={() => {
                    setShowLinkModal(false);
                    setLinkingPassword(false); // Reset linking state when modal is closed
                }}
                userEmail={googleUserEmail}
                onLinked={() => {
                    setShowLinkModal(false);
                    setLinkingPassword(false); // Reset linking state when done
                    setOpenSnackbar(true);
                }}
            />
        </div>
    );
}

export default Register;
