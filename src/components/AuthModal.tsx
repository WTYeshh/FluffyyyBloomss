import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, Key } from 'lucide-react';
import { loginUser, registerUser, generatePasswordResetOTP, verifyPasswordResetOTP, resetUserPassword } from '../data/db';
import type { User as DbUser } from '../data/db';
import { sendPasswordResetEmail } from '../data/email';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: DbUser, isRegister?: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      loginUser(email, password).then(user => {
        if (user) {
          onSuccess(user, false);
          onClose();
          resetForm();
        } else {
          setError('Invalid email or password.');
        }
      });
    } else {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      registerUser(name, email, password).then(user => {
        if (user) {
          onSuccess(user, true);
          onClose();
          resetForm();
        } else {
          setError('An account with this email already exists.');
        }
      });
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setForgotStep('email');
    setIsForgotPassword(false);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (forgotStep === 'email') {
      setIsSending(true);
      generatePasswordResetOTP(email).then(code => {
        if (!code) {
          setError('No account registered with this email address.');
          setIsSending(false);
          return;
        }

        sendPasswordResetEmail(email.toLowerCase().trim(), code).then(sent => {
          setIsSending(false);
          if (sent) {
            setForgotStep('otp');
          } else {
            setError('Failed to send verification email. Please try again.');
          }
        });
      });
    } else if (forgotStep === 'otp') {
      const isValid = verifyPasswordResetOTP(email, otpCode);
      if (isValid) {
        setForgotStep('reset');
      } else {
        setError('Invalid or expired verification code.');
      }
    } else if (forgotStep === 'reset') {
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('Passwords do not match.');
        return;
      }

      resetUserPassword(email, newPassword).then(success => {
        if (success) {
          alert('Password successfully reset! You can now log in.');
          resetForm();
        } else {
          setError('Failed to reset password. Please try again.');
        }
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>
        <div className="modal-body">
          <h2 className="modal-title text-center">
            {!isForgotPassword && (isLogin ? 'Welcome Back' : 'Create Account')}
            {isForgotPassword && forgotStep === 'email' && 'Reset Password'}
            {isForgotPassword && forgotStep === 'otp' && 'Verify Code'}
            {isForgotPassword && forgotStep === 'reset' && 'Set New Password'}
          </h2>
          
          {!isForgotPassword ? (
            <div className="admin-nav-tabs mb-4" style={{ justifyContent: 'center' }}>
              <button
                className={`admin-tab ${isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(true); setError(''); }}
                style={{ width: '45%', textAlign: 'center' }}
              >
                Log In
              </button>
              <button
                className={`admin-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(false); setError(''); }}
                style={{ width: '45%', textAlign: 'center' }}
              >
                Register
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {forgotStep === 'email' && "Enter your email address and we'll send you a 6-digit code to reset your password."}
              {forgotStep === 'otp' && `We sent a verification code to ${email}. Enter it below.`}
              {forgotStep === 'reset' && "Choose a secure new password for your account."}
            </div>
          )}

          {error && (
            <div 
              style={{ 
                padding: '0.75rem', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                borderRadius: '8px', 
                fontSize: '0.85rem',
                marginBottom: '1rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}

          {!isForgotPassword ? (
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label" htmlFor="register-name">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      id="register-name"
                      type="text"
                      className="form-input"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="auth-email"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      padding: '0.2rem'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setForgotStep('email'); setError(''); }}
                    style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button type="submit" className="btn-primary mt-4">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit}>
              {forgotStep === 'email' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="forgot-email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      id="forgot-email"
                      type="email"
                      className="form-input"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>
              )}

              {forgotStep === 'otp' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="forgot-otp">Verification Code</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      id="forgot-otp"
                      type="text"
                      maxLength={6}
                      className="form-input"
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      style={{ paddingLeft: '2.5rem', letterSpacing: '2px', fontWeight: 'bold' }}
                      required
                    />
                  </div>
                </div>
              )}

              {forgotStep === 'reset' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="forgot-new-password">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        id="forgot-new-password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="forgot-confirm-password">Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        id="forgot-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? 'Hide Password' : 'Show Password'}
                    </button>
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary mt-4" disabled={isSending}>
                {forgotStep === 'email' && (isSending ? 'Sending...' : 'Send Reset Code')}
                {forgotStep === 'otp' && 'Verify Code'}
                {forgotStep === 'reset' && 'Reset Password'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(''); }}
                  style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Back to Log In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
