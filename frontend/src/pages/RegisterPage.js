import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nama: '',
    pangkat: '',
    nrp: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }
    if (!formData.email || !formData.password || !formData.nama || !formData.pangkat || !formData.nrp) {
      setError('Semua field wajib diisi.');
      return;
    }
    // NRP validation (only numbers)
    if (!/^\d+$/.test(formData.nrp)) {
      setError('NRP hanya boleh berisi angka.');
      return;
    }
    
    console.log('Register attempt with:', formData);
    try {
      // AuthService.register expects userData to include: nama, pangkat, nrp, email, password
      // confirmPassword is only for frontend validation here
      const { confirmPassword, ...userData } = formData;
      const data = await AuthService.register(userData);
      setSuccess(data.message || 'Pendaftaran berhasil! Akun Anda menunggu persetujuan admin.');
      // Clear form or specific fields if needed
      setFormData({ nama: '', pangkat: '', nrp: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 3000); // Redirect after a delay
    } catch (err) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"> {/* Removed bg-gray-100 */}
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg"> {/* Enhanced shadow and rounding */}
        <h1 className="text-3xl font-bold text-center text-slate-700 mb-2">
          SIAP
        </h1>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Sistem Informasi Administrasi dan Pengarsipan
        </p>
        <h2 className="text-2xl font-semibold text-center text-slate-600 mb-8">Registrasi Akun Baru</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-rose-100 text-rose-700 p-3 rounded-md text-sm mb-4 text-center">{error}</p>}
          {success && <p className="bg-emerald-100 text-emerald-700 p-3 rounded-md text-sm mb-4 text-center">{success}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"> {/* Adjusted gap */}
            <div> {/* Removed mb-4, gap handles spacing */}
              <label className="block text-slate-700 text-sm font-semibold mb-1.5" htmlFor="nama">
                Nama Lengkap
              </label>
              <input type="text" id="nama" value={formData.nama} onChange={handleChange} className="input-field" placeholder="Nama Lengkap Anda" required />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5" htmlFor="pangkat">
                Pangkat
              </label>
              <input type="text" id="pangkat" value={formData.pangkat} onChange={handleChange} className="input-field" placeholder="Pangkat Anda" required />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5" htmlFor="nrp">
                NRP
              </label>
              <input 
                type="text" 
                id="nrp" 
                value={formData.nrp} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="NRP Anda (hanya angka)" 
                pattern="\d*" 
                title="NRP hanya boleh berisi angka."
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5" htmlFor="email">
                Alamat Email
              </label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="contoh@email.com" required />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5" htmlFor="password">
                Password
              </label>
              <input type="password" id="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="Minimal 6 karakter" required />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5" htmlFor="confirmPassword">
                Konfirmasi Password
              </label>
              <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="Ulangi password" required />
            </div>
          </div>
          
          <div className="mt-8 mb-6"> {/* Adjusted margin */}
            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-colors"
            >
              Daftar Akun
            </button>
          </div>
          <p className="text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
      {/* .input-field styles are now global in index.css */}
    </div>
  );
};

export default RegisterPage;
