import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { useNavigate, Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/common/Tooltip";

// Input component
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm
        focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
        aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive
        ${className}`}
      {...props}
    />
  );
}

interface AuthFormProps {
  onToggleView: () => void;
  isLogin: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ onToggleView, isLogin }) => {
  const { login, register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
    clearError();
  }, [isLogin, clearError]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const validateForm = () => {
    if (isLogin) {
      if (!email) return "Email is required";
      if (!password) return "Password is required";
    } else {
      if (!fullName) return "Full name is required";
      if (!email) return "Email is required";
      if (!password) return "Password is required";
      if (password.length < 6) return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        const [firstName, ...lastName] = fullName.split(' ');
        await register({ firstName, lastName: lastName.join(' '), email, password });
      }
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
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

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {!isLogin && (
              <div className="relative flex items-center">
                <User className="absolute left-4 w-5 h-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border-white/10 focus:border-primary-500 text-white placeholder:text-white/40 h-12 transition-all duration-300 pl-12 pr-4 focus:bg-white/10 rounded-xl"
                />
              </div>
          )}

          <div className="relative flex items-center">
            <Mail className="absolute left-4 w-5 h-5 text-white/40" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border-white/10 focus:border-primary-500 text-white placeholder:text-white/40 h-12 transition-all duration-300 pl-12 pr-4 focus:bg-white/10 rounded-xl"
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-4 w-5 h-5 text-white/40" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border-white/10 focus:border-primary-500 text-white placeholder:text-white/40 h-12 transition-all duration-300 pl-12 pr-12 focus:bg-white/10 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between text-sm">
        <div />
        {isLogin && (
          <Link to="/reset-password" className="font-semibold text-primary-400 hover:text-primary-300">
            Forgot password?
          </Link>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        className="text-base"
      >
        <span>{isLogin ? 'Log In' : 'Create Account'}</span>
        <ArrowRight className="w-5 h-5" />
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-900 px-2 text-white/40">Or continue with</span>
        </div>
      </div>

      <div>
        <TooltipProvider>
          <div className="grid grid-cols-2 gap-3 group">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" fullWidth disabled>
                  <svg className="w-5 h-5 mr-2" role="img" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  GitHub
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming Soon!</p>
              </TooltipContent>
            </Tooltip>

             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" fullWidth disabled>
                  <svg className="h-5 w-5 mr-2" role="img" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.983c5.514 0 9.982 4.467 9.982 9.982s-4.467 9.982-9.982 9.982S2.018 17.479 2.018 11.965 6.486 1.983 12 1.983zm0 1.5a8.482 8.482 0 100 16.964A8.482 8.482 0 0012 3.483zm-1.804 5.337h1.277v6.33h-1.277v-6.33zm3.608 0h1.277v6.33h-1.277v-6.33zM12 8.7c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25.56-1.25 1.25-1.25z"/></svg>
                  Google
                </Button>
              </TooltipTrigger>
               <TooltipContent>
                <p>Coming Soon!</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </form>
  );
};

interface AuthCardProps {
  isLogin: boolean;
  onToggleView: () => void;
}

const AuthCard: React.FC<AuthCardProps> = ({ isLogin, onToggleView }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h1>
          <p className="text-white/60">
            {isLogin ? "Let's get focused and make today count." : 'Join the community to boost your productivity.'}
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="glass p-8 rounded-2xl shadow-2xl">
        <AuthForm isLogin={isLogin} onToggleView={onToggleView} />
        <div className="mt-6 text-center text-sm">
          <button onClick={onToggleView} className="text-white/60 hover:text-white transition-colors">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <span className="font-semibold text-primary-400 ml-1">
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const AuthUI: React.FC<{ initialView?: 'login' | 'signup' | 'reset' }> = ({ initialView = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  const [isReset, setIsReset] = useState(initialView === 'reset');
  
  const toggleView = () => {
    if (isReset) {
      setIsReset(false);
      setIsLogin(true);
    } else {
      setIsLogin(!isLogin);
    }
  };

  // If we're in reset password mode, show that UI instead
  if (isReset) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <motion.div
             animate={{
                x: ['-100%', '100%'],
                y: ['-100%', '100%'],
                rotate: [0, 180, 360],
             }}
             transition={{
               duration: 50,
               ease: "linear",
               repeat: Infinity,
               repeatType: "reverse",
             }}
             className="absolute top-0 left-0 h-96 w-96 bg-primary-500/10 rounded-full blur-3xl"
           />
           <motion.div
              animate={{
                x: ['100%', '-100%'],
                y: ['100%', '-100%'],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 60,
                ease: "linear",
                repeat: Infinity,
                repeatType: "reverse",
              }}
             className="absolute bottom-0 right-0 h-96 w-96 bg-secondary-500/10 rounded-full blur-3xl"
           />
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">Reset Password</h1>
            <p className="text-white/60">Enter your email to receive a password reset link.</p>
          </div>
          <div className="glass p-8 rounded-2xl shadow-2xl">
            <form className="space-y-6">
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-white/40" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-white/5 border-white/10 focus:border-primary-500 text-white placeholder:text-white/40 h-12 transition-all duration-300 pl-12 pr-4 focus:bg-white/10 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="text-base"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <button onClick={toggleView} className="text-white/60 hover:text-white transition-colors">
                Remember your password?
                <span className="font-semibold text-primary-400 ml-1">
                  Log In
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
           animate={{
              x: ['-100%', '100%'],
              y: ['-100%', '100%'],
              rotate: [0, 180, 360],
           }}
           transition={{
             duration: 50,
             ease: "linear",
             repeat: Infinity,
             repeatType: "reverse",
           }}
           className="absolute top-0 left-0 h-96 w-96 bg-primary-500/10 rounded-full blur-3xl"
         />
         <motion.div
            animate={{
              x: ['100%', '-100%'],
              y: ['100%', '-100%'],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 60,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse",
            }}
           className="absolute bottom-0 right-0 h-96 w-96 bg-secondary-500/10 rounded-full blur-3xl"
         />
      </div>

      <AuthCard isLogin={isLogin} onToggleView={toggleView} />
    </div>
  );
};

export default AuthUI; 