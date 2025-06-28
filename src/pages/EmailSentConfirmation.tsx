import React from 'react';
import { motion } from 'framer-motion';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useNavigate } from 'react-router-dom';

const EmailSentConfirmation: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 space-y-6 bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl text-center">
                    <MailCheck className="w-16 h-16 mx-auto text-green-400" />
                    <h2 className="text-3xl font-bold text-white">Check Your Inbox</h2>
                    <p className="text-white/70">We've sent a password reset link to your email address. Please check your inbox (and spam folder) to continue.</p>
                    <Button
                        onClick={() => navigate('/auth')}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to Login
                    </Button>
                </Card>
            </motion.div>
        </div>
    );
};

export default EmailSentConfirmation; 