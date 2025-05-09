import React, { useState, useEffect } from 'react'; // Added useEffect
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';
import logoPolriUtama from '../assets/images/logo_polri_utama.png';
import logoSdmPolri from '../assets/images/logo_sdm_polri.png';
import logoSahabatPolresta from '../assets/images/logo_sahabat_polresta.png';
import loginBg from '../assets/images/login_bg.jpg'; // Using the provided background

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Basic validation
    if (!email || !password) {
      setError('Email dan password harus diisi.');
      return;
    }
    console.log('Login attempt with:', { email, password });
    try {
      const data = await AuthService.login(email, password);
      // AuthService.login already sets localStorage
      console.log('Login successful:', data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
    }
  };

  // Preload images
  useEffect(() => {
    // Assuming loginBg is now correctly imported if you placed it in assets
    const imagesToPreload = [logoPolriUtama, logoSdmPolri, logoSahabatPolresta, loginBg];
    imagesToPreload.forEach((image) => {
      if (image) new Image().src = image;
    });
  }, []);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-slate-100" // Light gray background for the page
      style={loginBg ? { backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      <div className="bg-slate-700 p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md"> {/* Dark slate-blue card */}
        
        <div className="flex justify-center items-center space-x-2 mb-5"> {/* Logos smaller and closer */}
          <img src={logoPolriUtama} alt="Logo Polri Utama" className="h-10 md:h-12" />
          <img src={logoSdmPolri} alt="Logo SDM Polri" className="h-10 md:h-12" />
          <img src={logoSahabatPolresta} alt="Logo Sahabat Polresta" className="h-10 md:h-12" />
        </div>

        <h1 className="text-2xl font-semibold text-center text-sky-400 mb-1"> {/* Adjusted size and color */}
          SELAMAT DATANG
        </h1>
        <p className="text-center text-slate-300 mb-6 text-xs"> {/* Adjusted size and color */}
          Sistem Informasi Administrasi dan Pengarsipan 
        </p>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-rose-200 text-rose-700 p-3 rounded-md text-sm mb-4 text-center">{error}</p>}
          <div className="mb-4">
            <label className="block text-slate-300 text-xs font-medium mb-1" htmlFor="email"> {/* Adjusted size */}
              Email Pengguna
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input-field-v2" // New class for new style
              placeholder="contoh@email.com"
              required
            />
          </div>
          <div className="mb-5"> {/* Adjusted margin */}
            <label className="block text-slate-300 text-xs font-medium mb-1" htmlFor="password"> {/* Adjusted size */}
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input-field-v2" // New class for new style
              placeholder="Masukkan password"
              required
            />
          </div>
          <div className="mt-6 mb-4">
            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50 transition-colors text-sm" // Adjusted padding and text size
            >
              Login
            </button>
          </div>
          <div className="mb-4"> {/* Adjusted margin */}
             <Link
              to="/register"
              className="block w-full bg-slate-600 hover:bg-slate-500 text-slate-100 font-semibold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50 transition-colors text-center text-sm" // Adjusted padding and text size
            >
              Buat Akun Baru (Register)
            </Link>
          </div>
        </form>
      </div>
      <style>{`
        .login-input-field-v2 {
          background-color: #FFFFFF; /* White background for input */
          border: 1px solid #94a3b8; /* slate-400 border */
          color: #1e293b; /* slate-800 text */
          border-radius: 0.375rem; /* rounded-md */
          padding: 0.625rem 0.75rem; /* py-2.5 px-3 */
          width: 100%;
          font-size: 0.875rem; /* text-sm */
          line-height: 1.25rem;
        }
        .login-input-field-v2:focus {
          outline: none;
          border-color: #38bdf8; /* sky-500 */
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.4); 
        }
        .login-input-field-v2::placeholder {
          color: #94a3b8; /* slate-400 */
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
