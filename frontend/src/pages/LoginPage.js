import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"> {/* Removed bg-gray-100, will use body default */}
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"> {/* Enhanced shadow and rounding */}
        <h1 className="text-3xl font-bold text-center text-slate-700 mb-2">
          SIAP
        </h1>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Sistem Informasi Administrasi dan Pengarsipan
        </p>
        <h2 className="text-2xl font-semibold text-center text-slate-600 mb-8">Login Akun</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-rose-100 text-rose-700 p-3 rounded-md text-sm mb-4 text-center">{error}</p>}
          <div className="mb-5"> {/* Increased margin */}
            <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="email">
              Alamat Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" // Using the class from RegisterPage for consistency
              placeholder="contoh@email.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" // Using the class from RegisterPage for consistency
              placeholder="Masukkan password"
              required
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-colors"
            >
              Login
            </button>
          </div>
          <p className="text-center text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700 hover:underline">
              Daftar di sini
            </Link>
          </p>
        </form>
      </div>
      {/* .input-field styles are now global in index.css */}
    </div>
  );
};

export default LoginPage;
