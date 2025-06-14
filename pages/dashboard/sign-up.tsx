import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';
import axios from 'axios';
import { EnvVars } from '@/env';
import AccountVerification from '@/components/AccountVerification';
import Toast from '@/components/Toast';

type SignUpFormInputs = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  organization: string;
  gstNumber: string;
  pan: string;
  currency: string;
};

const currencies = [
  "USD - United States Dollar",
  "EUR - Euro",
  "JPY - Japanese Yen",
  "GBP - British Pound Sterling",
  "AUD - Australian Dollar",
  "CAD - Canadian Dollar",
  "CHF - Swiss Franc",
  "CNY - Chinese Yuan Renminbi",
  "HKD - Hong Kong Dollar",
  "NZD - New Zealand Dollar",
  "SEK - Swedish Krona",
  "KRW - South Korean Won",
  "SGD - Singapore Dollar",
  "NOK - Norwegian Krone",
  "MXN - Mexican Peso",
  "INR - Indian Rupee",
  "RUB - Russian Ruble",
  "ZAR - South African Rand",
  "TRY - Turkish Lira",
  "BRL - Brazilian Real",
  "TWD - Taiwan New Dollar",
  "DKK - Danish Krone",
  "PLN - Polish Zloty",
  "THB - Thai Baht",
  "IDR - Indonesian Rupiah",
  "HUF - Hungarian Forint",
  "CZK - Czech Koruna",
  "ILS - Israeli New Shekel",
  "CLP - Chilean Peso",
  "PHP - Philippine Peso",
  "AED - United Arab Emirates Dirham",
  "SAR - Saudi Riyal",
  "MYR - Malaysian Ringgit",
  "RON - Romanian Leu",
  "VND - Vietnamese Dong",
  "BDT - Bangladeshi Taka",
  "PKR - Pakistani Rupee",
  "EGP - Egyptian Pound",
  "NGN - Nigerian Naira",
  "KWD - Kuwaiti Dinar",
  "QAR - Qatari Riyal",
  "KES - Kenyan Shilling",
  "LKR - Sri Lankan Rupee",
  "BHD - Bahraini Dinar",
  "OMR - Omani Rial",
  "ARS - Argentine Peso",
  "COP - Colombian Peso",
  "PEN - Peruvian Sol",
  "UYU - Uruguayan Peso",
  "GHS - Ghanaian Cedi",
  "TZS - Tanzanian Shilling",
  "UGX - Ugandan Shilling",
  "ETB - Ethiopian Birr",
  "MAD - Moroccan Dirham",
  "XAF - Central African CFA Franc",
  "XOF - West African CFA Franc",
  "CDF - Congolese Franc",
  "ZMW - Zambian Kwacha",
  "MUR - Mauritian Rupee",
  "BND - Brunei Dollar",
  "KHR - Cambodian Riel",
  "MMK - Myanmar Kyat",
  "LAK - Lao Kip",
  "MNT - Mongolian Tugrik",
  "PGK - Papua New Guinean Kina",
  "SBD - Solomon Islands Dollar",
  "TOP - Tongan Paanga",
  "FJD - Fijian Dollar",
  "XPF - CFP Franc",
];

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [showOtpComponent, setShowOtpComponent] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormInputs>();
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

  const onSubmit: SubmitHandler<SignUpFormInputs> = async (data) => {
    try {
      const response = await axios.post(`${EnvVars.API}api/public/customer/signup`, {
        ...data,
        isACompany: false,
        taxable: true,
        openingBalance: '1000',
        paymentTerms: 'Net30Days',
        placeOfSupply: 'New York',
      });
      
      console.log('API Response: ', response.data);

      if (response.data.verificationRequired) {
        showToast('Account created! Please verify your email.', 'success');
        setEmail(data.email);
        setShowOtpComponent(true);
      } else {
        showToast('Sign up successful! You can now sign in.', 'success');
        reset();
        
        // Redirect after toast is shown
        setTimeout(() => {
          router.push('/dashboard/sign-in');
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error signing up. Please try again.', 'error');
    }
  };

  return (
    <div className="sign-up-container">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={hideToast}
      />

      <div className="form-card">
        <h2>Create an Account</h2>
        <p className="subtitle">Sign up to get started</p>

        {!showOtpComponent ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                {...register('name', { required: 'Name is required' })}
                className={`input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
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
                  minLength: { value: 6, message: 'Password must be at least 6 characters long' },
                })}
                className={`input ${errors.password ? 'error' : ''}`}
              />
              {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Phone Number"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: { value: /^[0-9]+$/, message: 'Invalid phone number' },
                })}
                className={`input ${errors.phoneNumber ? 'error' : ''}`}
              />
              {errors.phoneNumber && <p className="error-message">{errors.phoneNumber.message}</p>}
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Address"
                {...register('address', { required: 'Address is required' })}
                className={`input ${errors.address ? 'error' : ''}`}
              />
              {errors.address && <p className="error-message">{errors.address.message}</p>}
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Organization"
                {...register('organization', { required: 'Organization is required' })}
                className={`input ${errors.organization ? 'error' : ''}`}
              />
              {errors.organization && <p className="error-message">{errors.organization.message}</p>}
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="GST Number"
                {...register('gstNumber', { required: 'GST number is required' })}
                className={`input ${errors.gstNumber ? 'error' : ''}`}
              />
              {errors.gstNumber && <p className="error-message">{errors.gstNumber.message}</p>}
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="PAN"
                {...register('pan', { required: 'PAN is required' })}
                className={`input ${errors.pan ? 'error' : ''}`}
              />
              {errors.pan && <p className="error-message">{errors.pan.message}</p>}
            </div>
            <div className="input-group">
              <select
                {...register('currency', { required: 'Currency is required' })}
                className={`input ${errors.currency ? 'error' : ''}`}
                defaultValue=""
              >
                <option value="" disabled>Select Currency</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              {errors.currency && <p className="error-message">{errors.currency.message}</p>}
            </div>
            <button type="submit" className="primary-button">
              Sign Up
            </button>
          </form>
        ) : (
          <AccountVerification email={email} />
        )}

        <p className="sign-in-link">
          Already have an account?{' '}
          <span onClick={() => router.push('/dashboard/sign-in')} className="link">
            Sign in now
          </span>
        </p>
      </div>
      <style jsx>{`
        .sign-up-container {
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
          max-width: 500px;
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
        .sign-in-link {
          margin-top: 16px;
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

export default SignUp;