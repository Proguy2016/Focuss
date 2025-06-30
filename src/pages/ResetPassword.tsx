import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Input } from '../components/common/Input';

const ResetPassword: React.FC = () => {
    const { resetPassword, loading, error, clearError } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Get token from query parameter
    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    useEffect(() => {
        setFormError(null);
        setSuccessMessage(null);
        clearError();
        if (!token) {
            setFormError("Password reset token is missing from the URL.");
        }
        
        // Cleanup function to clear any navigation timeout when component unmounts
        return () => {
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
        };
    }, [clearError, token]);

    useEffect(() => {
        if (error) {
            setFormError(error);
        }
    }, [error]);

    const validateForm = () => {
        if (!password) return 'New password is required';
        if (password.length < 6) return 'New password must be at least 6 characters';
        if (password !== confirmPassword) return 'Passwords do not match';
        return null;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        if (!token) {
            setFormError("Password reset token is missing.");
            return;
        }

        try {
            await resetPassword({ token, newPassword: password });
            setSuccessMessage("Your password has been successfully reset. You can now log in.");
            setPassword('');
            setConfirmPassword('');
            setFormError(null);
            // Optionally navigate to login page after a delay
            navigationTimeoutRef.current = setTimeout(() => navigate('/auth'), 3000);
        } catch (err) {
            // Error is handled by the useAuth hook and reflected in 'error' state
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md"
                >
                    <Card className="p-8 space-y-6 bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl">
                        <h2 className="text-3xl font-bold text-center text-white">Reset Password</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {formError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-red-500/20 border border-red-500/30 text-white text-xs p-2 rounded-md"
                                >
                                    {formError}
                                </motion.div>
                            )}

                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-green-500/20 border border-green-500/30 text-white text-xs p-2 rounded-md"
                                >
                                    {successMessage}
                                </motion.div>
                            )}

                            <motion.div
                                className={`relative ${focusedInput === "newPassword" ? 'z-10' : ''}`}
                                whileFocus={{ scale: 1.02 }}
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <div className="relative flex items-center overflow-hidden rounded-lg">
                                    <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "newPassword" ? 'text-white' : 'text-white/40'}`} />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedInput("newPassword")}
                                        onBlur={() => setFocusedInput(null)}
                                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 text-white/40 hover:text-white transition-colors duration-200"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    {focusedInput === "newPassword" && (
                                        <motion.div
                                            layoutId="input-highlight"
                                            className="absolute inset-0 bg-white/5 -z-10"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                className={`relative ${focusedInput === "confirmPassword" ? 'z-10' : ''}`}
                                whileFocus={{ scale: 1.02 }}
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <div className="relative flex items-center overflow-hidden rounded-lg">
                                    <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "confirmPassword" ? 'text-white' : 'text-white/40'}`} />
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onFocus={() => setFocusedInput("confirmPassword")}
                                        onBlur={() => setFocusedInput(null)}
                                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 text-white/40 hover:text-white transition-colors duration-200"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    {focusedInput === "confirmPassword" && (
                                        <motion.div
                                            layoutId="input-highlight"
                                            className="absolute inset-0 bg-white/5 -z-10"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </div>
                            </motion.div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                                disabled={loading}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </form>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ResetPassword; 