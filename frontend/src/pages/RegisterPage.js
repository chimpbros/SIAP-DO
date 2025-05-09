import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';

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
    
    console.log('Register attempt with:', formData);
    // TODO: Implement actual API call to /api/auth/register
    // try {
    //   const response = await axios.post('/api/auth/register', {
    //     nama: formData.nama,
    //     pangkat: formData.pangkat,
    //     nrp: formData.nrp,
    //     email: formData.email,
    //     password: formData.password,
    //   });
    //   setSuccess(response.data.message || 'Pendaftaran berhasil! Akun Anda menunggu persetujuan admin.');
    //   setTimeout(() => navigate('/login'), 3000); // Redirect after a delay
    // } catch (err) {
    //   setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    // }
    alert('Register functionality to be implemented. Check console for data.');
    setSuccess('Pendaftaran berhasil (simulasi)! Akun Anda menunggu persetujuan admin. Anda akan dialihkan ke halaman Login.');
    setTimeout(() => navigate('/login'), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Sistem Informasi Administrasi dan Pengarsipan (SIAP)
        </h1>
        <h2 className="text-xl font-semibold text-center text-gray-600 mb-6">Registrasi Akun Baru</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nama">
                Nama Lengkap
              </label>
              <input type="text" id="nama" value={formData.nama} onChange={handleChange} className="input-field" placeholder="Nama Lengkap Anda" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pangkat">
                Pangkat
              </label>
              <input type="text" id="pangkat" value={formData.pangkat} onChange={handleChange} className="input-field" placeholder="Pangkat Anda" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nrp">
                NRP
              </label>
              <input type="text" id="nrp" value={formData.nrp} onChange={handleChange} className="input-field" placeholder="NRP Anda" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="Email Anda" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input type="password" id="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="Password" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Konfirmasi Password
              </label>
              <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="Konfirmasi Password" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 mb-6">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Daftar
            </button>
          </div>
          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-blue-500 hover:text-blue-700">
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
      <style jsx>{`
        .input-field {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          appearance: none;
          border-radius: 0.375rem;
          border-width: 1px;
          border-color: #D1D5DB; /* gray-300 */
          width: 100%;
          padding: 0.5rem 0.75rem;
          color: #374151; /* gray-700 */
          line-height: 1.5;
        }
        .input-field:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.5); /* blue-300 with opacity */
          border-color: #3B82F6; /* blue-500 */
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
