import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';
import axios from 'axios';
import { EnvVars } from '@/env';
import Toast from '@/components/Toast';

type SignInFormInputs = {
  email: string;
  password: string;
};

const SignIn = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInputs>();
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const onSubmit: SubmitHandler<SignInFormInputs> = async (data) => {
    try {
      const response = await axios.post(`${EnvVars.API}api/public/customer/login`, data);
      const { accessToken, refreshToken } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      window.dispatchEvent(new Event('storage')); // Trigger storage event
      
      showToast('Login successful!', 'success');
      
      // Redirect after toast is shown
      setTimeout(() => {
        router.push('/#services');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      showToast('Invalid credentials. Please try again.', 'error');
    }
  };

  return (
    <div className="sign-in-container">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={hideToast}
      />
      
      <div className="form-card">
        <h2>Welcome Back!</h2>
        <p className="subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
              className={`input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className={`input ${errors.password ? 'error' : ''}`}
            />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>
          <button type="submit" className="primary-button">
            Sign In
          </button>
        </form>
        <div className="links-container">
          <p className="forgot-password-link">
            <span onClick={() => router.push('/dashboard/forgot-password')} className="link">
              Forgot Password?
            </span>
          </p>
          <p className="sign-up-link">
            Don't have an account?{' '}
            <span onClick={() => router.push('/dashboard/sign-up')} className="link">
              Sign up now
            </span>
          </p>
        </div>
      </div>
      <style jsx>{`
        .sign-in-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        .form-card {
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        h2 {
          font-size: 24px;
          margin-bottom: 8px;
          color: #333;
        }
        .subtitle {
          font-size: 16px;
          color: #666;
          margin-bottom: 24px;
        }
        .input-group {
          margin-bottom: 16px;
        }
        .input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
        }
        .input.error {
          border-color: #d9534f;
        }
        .input:focus {
          outline: none;
          border-color: #0a121e;
          box-shadow: 0 0 4px rgba(10, 18, 30, 0.4);
        }
        .primary-button {
          width: 100%;
          padding: 10px 16px;
          background-color: #fed700;
          color: #0a121e;
          font-size: 16px;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .primary-button:hover {
          background-color: #ffea00;
        }
        .error-message {
          color: #d9534f;
          font-size: 14px;
          margin-top: 4px;
        }
        .links-container {
          margin-top: 16px;
        }
        .forgot-password-link {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        .sign-up-link {
          font-size: 14px;
          color: #666;
        }
        .link {
          color: #0a121e;
          cursor: pointer;
          font-weight: bold;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default SignIn;