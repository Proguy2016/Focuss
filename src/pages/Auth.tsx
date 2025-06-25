import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, Twitter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Clear form error when switching views
  useEffect(() => {
    setFormError(null);
    clearError();
  }, [isLogin, clearError]);

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

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ firstName, lastName, email, password });
      }
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  const handleFormClick = () => {
    console.log('Form clicked');
  };

  const handleSignInButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const handleSocialLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormError("Social login is not implemented yet");
  };

  return (
    <form onSubmit={handleSubmit} onClick={handleFormClick} className="space-y-4">
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

      <motion.div className="space-y-3">
        {!isLogin && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`relative ${focusedInput === "firstName" ? 'z-10' : ''}`}
            >
              <div className="relative flex items-center overflow-hidden rounded-lg">
                <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "firstName" ? 'text-white' : 'text-white/40'
                  }`} />

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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`relative ${focusedInput === "lastName" ? 'z-10' : ''}`}
            >
              <div className="relative flex items-center overflow-hidden rounded-lg">
                <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "lastName" ? 'text-white' : 'text-white/40'
                  }`} />

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
          whileFocus={{ scale: 1.02 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="relative flex items-center overflow-hidden rounded-lg">
            <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "email" ? 'text-white' : 'text-white/40'
              }`} />

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
          whileFocus={{ scale: 1.02 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="relative flex items-center overflow-hidden rounded-lg">
            <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "password" ? 'text-white' : 'text-white/40'
              }`} />

            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
            />

            <button
              type="button"
              className="absolute right-3 text-white/40 hover:text-white transition-colors duration-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
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
      </motion.div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 select-none cursor-pointer text-xs text-white/60">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="rounded bg-white/10 border-transparent checked:bg-primary checked:border-primary focus-visible:ring-offset-0 focus-visible:ring-transparent"
          />
          <span>Remember me</span>
        </label>

        {isLogin && (
          <button
            type="button"
            className="relative group/forgot text-xs text-white/60"
          >
            <span className="relative z-10 group-hover/forgot:text-white/70 transition-colors duration-300">Forgot password?</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white/60 group-hover/forgot:w-full transition-all duration-300" />
          </button>
        )}
      </div>

      <Button
        type="button"
        variant="primary"
        fullWidth
        className="mt-5 h-10 cursor-pointer"
        icon={loading ? undefined : ArrowRight}
        loading={loading}
        onClick={handleSignInButtonClick}
      >
        {isLogin ? "Sign In" : "Sign Up"}
      </Button>

      <div className="relative mt-2 mb-5 flex items-center">
        <div className="flex-grow border-t border-white/5"></div>
        <motion.span
          className="mx-3 text-xs text-white/40"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 0.9, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          or
        </motion.span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleSocialLogin}
          className="relative group/social"
        >
          <div className="absolute inset-0 bg-white/5 rounded-full blur opacity-0 group-hover/social:opacity-70 transition-opacity duration-300" />
          <div className="relative overflow-hidden bg-white/5 text-white h-10 w-10 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center">
            <Github className="w-5 h-5 text-white/80 group-hover/social:text-white transition-colors duration-300" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleSocialLogin}
          className="relative group/social"
        >
          <div className="absolute inset-0 bg-white/5 rounded-full blur opacity-0 group-hover/social:opacity-70 transition-opacity duration-300" />
          <div className="relative overflow-hidden bg-white/5 text-white h-10 w-10 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center">
            <Twitter className="w-5 h-5 text-white/80 group-hover/social:text-white transition-colors duration-300" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleSocialLogin}
          className="relative group/social"
        >
          <div className="absolute inset-0 bg-white/5 rounded-full blur opacity-0 group-hover/social:opacity-70 transition-opacity duration-300" />
          <div className="relative overflow-hidden bg-white/5 text-white h-10 w-10 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center">
            <div className="w-5 h-5 flex items-center justify-center text-white/80 group-hover/social:text-white transition-colors duration-300">G</div>
          </div>
        </motion.button>
      </div>

      <motion.p
        className="text-center text-xs text-white/60 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <button
          type="button"
          onClick={onToggleView}
          className="relative inline-block group/signup"
        >
          <span className="relative z-10 text-white group-hover/signup:text-white/70 transition-colors duration-300 font-medium">
            {isLogin ? "Sign up" : "Sign in"}
          </span>
          <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/signup:w-full transition-all duration-300" />
        </button>
      </motion.p>
    </form>
  );
};

interface AuthCardProps {
  isLogin: boolean;
  onToggleView: () => void;
}

const AuthCard: React.FC<AuthCardProps> = ({ isLogin, onToggleView }) => {
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
        <Card className="p-8 bg-black/60 backdrop-blur-lg overflow-hidden border-white/10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-medium text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {isLogin ? "Sign in to continue to Focuss" : "Sign up to get started with Focuss"}
            </p>
          </div>
          <AuthForm isLogin={isLogin} onToggleView={onToggleView} />
        </Card>
      </motion.div>
    </motion.div>
  );
};

const Auth: React.FC = () => {
  const [view, setView] = useState<'login' | 'register'>('login');

  const toggleView = () => {
    setView(view === 'login' ? 'register' : 'login');
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
        />
      </AnimatePresence>
    </div>
  );
};

export default Auth; 