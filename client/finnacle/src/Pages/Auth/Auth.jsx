import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/ApiPaths';
import { Mail, Lock, User, DollarSign, ArrowRight, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import validator from 'validator';
import { UserContext } from '../../Context/userContext'; 

function FinnacleAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { updatedUser } = useContext(UserContext); 

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!validator.isEmail(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!validator.isLength(password, { min: 5 })) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (!isLogin && !validator.isLength(fullName, { min: 1 })) {
      setError('Full Name is required.');
      setIsLoading(false);
      return;
    }

    try {
      let response;

      if (isLogin) {
        response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
      } else {
        response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, { fullName, email, password });
      }

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        updatedUser(user); 
        
        setSuccess(isLogin ? 'Login successful!' : 'Account created successfully!');
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-700 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* Logo and Branding */}
        <div className="relative z-10 mb-12">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-white to-green-200 bg-opacity-30 p-4 rounded-full mr-4 flex items-center justify-center shadow-lg">
              <DollarSign size={36} className="text-green-600" />
            </div>
            <h1 className="text-4xl font-bold leading-tight">Finnacle</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4 leading-snug">Financial Freedom Starts Here</h2>
          <p className="text-lg text-green-50 max-w-md leading-relaxed">
            Manage your income, expenses, and savings effortlessly. Finnacle helps you achieve your financial goals with ease.
          </p>
        </div>

        {/* Features Section */}
        <div className="space-y-6 relative z-10">
          <div className="flex items-start backdrop-blur-sm bg-white bg-opacity-10 p-6 rounded-lg">
            <div className="bg-white p-3 rounded-full mr-4 text-green-600 flex items-center justify-center">
              <Check size={20} />
            </div>
            <div>
              <p className="font-medium  text-black text-lg leading-snug">Track your expenses in real-time</p>
              <p className="text-sm text-black mt-1 leading-relaxed">
                Visualize where your money goes with intuitive dashboards.
              </p>
            </div>
          </div>
          <div className="flex items-start backdrop-blur-sm bg-white bg-opacity-10 p-6 rounded-lg">
            <div className="bg-white p-3 rounded-full mr-4 text-green-600 flex items-center justify-center">
              <Check size={20} />
            </div>
            <div>
              <p className="font-medium text-lg text-black leading-snug">Set and achieve savings goals</p>
              <p className="text-sm text-black mt-1 leading-relaxed">
                Create personalized goals and track your progress.
              </p>
            </div>
          </div>
          <div className="flex items-start backdrop-blur-sm bg-white bg-opacity-10 p-6 rounded-lg">
            <div className="bg-white p-3 rounded-full mr-4 text-green-600 flex items-center justify-center">
              <Check size={20} />
            </div>
            <div>
              <p className="font-medium text-lg  text-black leading-snug">Get personalized financial insights</p>
              <p className="text-sm text-black mt-1 leading-relaxed">
                AI-powered recommendations to improve your financial health.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6">
        <div className="w-full max-w-md px-6 py-8">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-green-600 p-2 rounded-lg mr-3">
              <DollarSign size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Finnacle</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-gray-600 mb-8">
            {isLogin ? 'Sign in to continue your financial journey' : 'Join Finnacle and take control of your finances'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center shadow-sm">
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center shadow-sm">
              <Check className="mr-2 flex-shrink-0" size={20} />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 block w-full rounded-xl border border-gray-300 py-3 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition duration-200"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full rounded-xl border border-gray-300 py-3 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {isLogin && (
                  <button 
                    type="button" 
                    className="text-xs font-medium text-green-600 hover:text-green-800"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 block w-full rounded-xl border border-gray-300 py-3 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition duration-200"
                  placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 px-4 text-white font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md transition duration-200 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 font-medium text-green-600 hover:text-green-700 underline-offset-2 hover:underline transition"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
          
          {isLogin && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.934.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinnacleAuth;