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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Sistem Informasi Administrasi dan Pengarsipan (SIAP)
        </h1>
        <h2 className="text-xl font-semibold text-center text-gray-600 mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Masukkan email Anda"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Masukkan password Anda"
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Login
            </button>
          </div>
          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-blue-500 hover:text-blue-700">
              Daftar di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
