const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Import bcryptjs

const generateToken = (userId, isAdmin) => {
  return jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

exports.register = async (req, res) => {
  const { email, password, nama, pangkat, nrp, confirmPassword } = req.body;

  if (!email || !password || !nama || !pangkat || !nrp) {
    return res.status(400).json({ message: 'Isian tidak lengkap.' });
  }

  // NRP validation (only numbers)
  if (!/^\d+$/.test(nrp)) {
    return res.status(400).json({ message: 'NRP hanya boleh berisi angka.' });
  }

  // Frontend handles password confirmation. confirmPassword is not sent to backend.
  // if (password !== confirmPassword) { 
  //   return res.status(400).json({ message: 'Password tidak cocok.' });
  // }

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const newUser = await User.create({ email, password, nama, pangkat, nrp });
    // Exclude password_hash from the response
    const { password_hash, ...userWithoutPassword } = newUser; 

    res.status(201).json({
      message: 'Pendaftaran berhasil! Akun Anda menunggu persetujuan admin.',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password harus diisi.' });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const isMatch = await User.comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    if (!user.is_approved) {
      return res.status(403).json({ message: 'Akun Anda belum disetujui admin atau telah dinonaktifkan.' });
    }

    const token = generateToken(user.user_id, user.is_admin);
    
    // Exclude password_hash from the user object sent in response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login berhasil.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.getCurrentUser = async (req, res) => {
  // This route will be protected, req.user will be populated by auth middleware
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Tidak terautentikasi.' });
  }
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }
    // Ensure password_hash is not sent, even though findById doesn't select it
    const { password_hash, ...userWithoutPassword } = user; 
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const userId = req.user.userId;

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Password baru dan konfirmasi password tidak cocok.' });
  }

  // Optional: Add password strength validation for newPassword here if desired

  try {
    const user = await User.findByIdWithPasswordHash(userId);
    if (!user) {
      // This case should ideally not happen if protect middleware works correctly
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    const isMatch = await User.comparePassword(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password lama salah.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update the password hash in the database
    await User.updatePasswordHash(userId, newPasswordHash);

    res.status(200).json({ message: 'Password berhasil diubah.' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengubah password.' });
  }
};
