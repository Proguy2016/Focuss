import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, Twitter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/common/Input';

interface AuthFormProps {
  onToggleView: () => void;
  isLogin: boolean;
  initialView?: 'login' | 'signup' | 'forgot-password';
}

const AuthForm: React.FC<AuthFormProps> = ({ onToggleView, isLogin, initialView }) => {
  const { login, register, loading, error, clearError, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(initialView === 'forgot-password');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<string | null>(null);

  // Clear form error when switching views or entering forgot password flow
  useEffect(() => {
    setFormError(null);
    clearError();
    setForgotPasswordSuccess(null);
    if (initialView === 'forgot-password') {
      setShowForgotPassword(true);
    } else {
      setShowForgotPassword(false);
    }
  }, [isLogin, clearError, initialView]);

  // Update form error when auth error changes
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
      if (!firstName) return "First name is required";
      if (!lastName) return "Last name is required";
      if (!email) return "Email is required";
      if (!password) return "Password is required";
      if (password.length < 6) return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    clearError();

    if (isLogin) {
      if (!email || !password) {
        setFormError("Please fill in all fields.");
        return;
      }
      try {
        await login({ email, password });
        navigate('/dashboard');
      } catch (err) {
        // Error handled by useAuth hook, state updated
      }
    } else {
      if (!firstName || !lastName || !email || !password) {
        setFormError("Please fill in all fields.");
        return;
      }
      try {
        await register({ firstName, lastName, email, password });
        navigate('/dashboard');
      } catch (err) {
        // Error handled by useAuth hook, state updated
      }
    }
  };

  const handleForgotPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      setFormError("Please enter your email address.");
      return;
    }
    setFormError(null);
    setForgotPasswordSuccess(null);
    try {
      await forgotPassword(email);
      setForgotPasswordSuccess("A password reset link has been sent to your email.");
      navigate('/email-sent'); // Navigate to confirmation page
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to send reset email.');
    }
  };

  const handleFormClick = () => {
    // This can be used for general form interactions if needed
  };

  const handleSignInButtonClick = () => {
    // This will be the main submit handler for login/signup
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  const handleSocialLogin = () => {
    // Implement social login logic here
    setFormError("Social login not yet implemented.");
  };

  return (
    <form onSubmit={showForgotPassword ? handleForgotPasswordSubmit : handleSubmit} onClick={handleFormClick} className="space-y-4">
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

      {forgotPasswordSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-500/20 border border-green-500/30 text-white text-xs p-2 rounded-md"
        >
          {forgotPasswordSuccess}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {showForgotPassword ? (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-white text-center">Forgot Password?</h3>
            <p className="text-white/70 text-sm text-center">Enter your email address to receive a password reset link.</p>
            <motion.div
              className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
              whileFocus={{ scale: 1.02 }}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="relative flex items-center overflow-hidden rounded-lg">
                <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "email" ? 'text-white' : 'text-white/40'}`} />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                />
                {focusedInput === "email" && (
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
              {loading ? 'Sending...' : 'Send Reset Email'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setFormError(null);
                setForgotPasswordSuccess(null);
              }}
              className="w-full text-white/70 bg-transparent hover:bg-white/10"
            >
              Back to Login
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {!isLogin && (
              <>
                <motion.div
                  className={`relative ${focusedInput === "firstName" ? 'z-10' : ''}`}
                >
                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "firstName" ? 'text-white' : 'text-white/40'}`} />
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setFocusedInput("firstName")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                    />
                    {focusedInput === "firstName" && (
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
                  className={`relative ${focusedInput === "lastName" ? 'z-10' : ''}`}
                >
                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "lastName" ? 'text-white' : 'text-white/40'}`} />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setFocusedInput("lastName")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                    />
                    {focusedInput === "lastName" && (
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
              </>
            )}

            <motion.div
              className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
            >
              <div className="relative flex items-center overflow-hidden rounded-lg">
                <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "email" ? 'text-white' : 'text-white/40'}`} />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                />
                {focusedInput === "email" && (
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
              className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
            >
              <div className="relative flex items-center overflow-hidden rounded-lg">
                <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "password" ? 'text-white' : 'text-white/40'}`} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput("password")}
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
                {focusedInput === "password" && (
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

            <div className="flex items-center justify-between text-white/70">
              <label htmlFor="remember-me" className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs hover:underline hover:text-white transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold py-2 rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/70">Or continue with</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSocialLogin}
                className="flex-1 flex items-center justify-center space-x-2 text-white/70 border-white/20 hover:bg-white/10"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSocialLogin}
                className="flex-1 flex items-center justify-center space-x-2 text-white/70 border-white/20 hover:bg-white/10"
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </Button>
            </div>

            <p className="mt-4 text-center text-sm text-white/70">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={onToggleView}
                className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors duration-200"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

interface AuthCardProps {
  isLogin: boolean;
  onToggleView: () => void;
  initialView?: 'login' | 'signup' | 'forgot-password';
}

const AuthCard: React.FC<AuthCardProps> = ({ isLogin, onToggleView, initialView }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-md relative z-10 pointer-events-auto"
      style={{ perspective: 1500 }}
    >
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ z: 10 }}
      >
        <div className="relative group">
          <motion.div
            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 10px 2px rgba(255,255,255,0.03)",
                "0 0 15px 5px rgba(255,255,255,0.05)",
                "0 0 10px 2px rgba(255,255,255,0.03)"
              ],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />

          <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{
                left: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
              }}
              transition={{
                left: {
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1
                },
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "mirror"
                },
                filter: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror"
                }
              }}
            />

            <motion.div
              className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{
                top: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
              }}
              transition={{
                top: {
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 0.6
                },
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 0.6
                },
                filter: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 0.6
                }
              }}
            />

            <motion.div
              className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{
                right: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
              }}
              transition={{
                right: {
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 1.2
                },
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.2
                },
                filter: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.2
                }
              }}
            />

            <motion.div
              className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{
                bottom: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
              }}
              transition={{
                bottom: {
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 1.8
                },
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.8
                },
                filter: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.8
                }
              }}
            />

            <motion.div
              className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]"
              animate={{
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror"
              }}
            />
            <motion.div
              className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]"
              animate={{
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                repeatType: "mirror",
                delay: 0.5
              }}
            />
            <motion.div
              className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]"
              animate={{
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatType: "mirror",
                delay: 1
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]"
              animate={{
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 2.3,
                repeat: Infinity,
                repeatType: "mirror",
                delay: 1.5
              }}
            />
          </div>

          <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />

          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                backgroundSize: '30px 30px'
              }}
            />

            <div className="text-center space-y-1 mb-5">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden pointer-events-none"
              >
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">F</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
              >
                {isLogin ? "Welcome Back" : "Create Account"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/60 text-xs"
              >
                {isLogin ? "Sign in to continue" : "Sign up to get started"}
              </motion.p>
            </div>

            <AuthForm onToggleView={onToggleView} isLogin={isLogin} initialView={initialView} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface AuthUIProps {
  initialView?: 'login' | 'signup' | 'forgot-password';
}

export const AuthUI: React.FC<AuthUIProps> = ({ initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot-password'>(initialView);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const toggleView = () => {
    setView(view === 'login' ? 'signup' : view === 'signup' ? 'forgot-password' : 'login');
  };

  return (
    <div className="min-h-screen w-screen bg-dark relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-darker to-black" />

      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-primary/10 blur-[80px]" />
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-secondary/10 blur-[60px]"
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-primary/10 blur-[60px]"
        animate={{
          opacity: [0.2, 0.3, 0.2],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "mirror",
          delay: 1
        }}
      />

      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <AnimatePresence mode="wait">
        <AuthCard
          key={view}
          isLogin={view === 'login'}
          onToggleView={toggleView}
          initialView={view}
        />
      </AnimatePresence>
    </div>
  );
};

export default function Auth({ initialView = 'login' }: AuthUIProps) {
  return <AuthUI initialView={initialView} />;
} 