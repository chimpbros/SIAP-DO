const User = require('../models/User');

// List all users (for admin)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.getAll(); // Assumes User.getAll() fetches all necessary fields
    // Exclude password_hash from the response for all users
    const usersWithoutPasswords = users.map(user => {
      const { password_hash, ...userClean } = user;
      return userClean;
    });
    res.status(200).json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil daftar pengguna.' });
  }
};

// Approve a user registration
exports.approveUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }
    if (user.is_approved) {
      return res.status(400).json({ message: 'Pengguna sudah disetujui.' });
    }
    const approvedUser = await User.approve(userId);
    const { password_hash, ...userClean } = approvedUser;
    res.status(200).json({ message: 'Pengguna berhasil disetujui.', user: userClean });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Revoke a user's access (set is_approved to false)
exports.revokeUserAccess = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }
    // Prevent admin from revoking their own access if they are the only admin? (Optional check)
    const revokedUser = await User.revoke(userId);
    const { password_hash, ...userClean } = revokedUser;
    res.status(200).json({ message: 'Akses pengguna berhasil dicabut.', user: userClean });
  } catch (error) {
    console.error('Error revoking user access:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Set or remove admin privileges for a user
exports.setUserAdminStatus = async (req, res) => {
  const { userId } = req.params;
  const { isAdmin } = req.body; // Expecting { isAdmin: true/false } in request body

  if (typeof isAdmin !== 'boolean') {
    return res.status(400).json({ message: 'Status admin tidak valid (harus true atau false).' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }
    
    // Optional: Prevent removing admin status from the last admin or self (complex logic, skip for now)

    const updatedUser = await User.setAdminStatus(userId, isAdmin);
    const { password_hash, ...userClean } = updatedUser;
    res.status(200).json({ 
      message: `Status admin pengguna berhasil diubah menjadi ${isAdmin ? 'Admin' : 'User'}.`, 
      user: userClean 
    });
  } catch (error) {
    console.error('Error setting user admin status:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Delete a user registration request (or any user, use with caution)
exports.deleteUserRegistration = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    // Optional: Add a check to prevent deleting an already approved admin,
    // or only allow deleting users where is_approved is false.
    // For now, this will delete any user by ID.
    // if (user.is_approved && user.is_admin) {
    //   return res.status(400).json({ message: 'Tidak dapat menghapus admin yang sudah disetujui.' });
    // }

    const deletedUser = await User.deleteById(userId);
    if (deletedUser) {
      res.status(200).json({ message: 'Registrasi pengguna berhasil dihapus.', userId: deletedUser.user_id });
    } else {
      // Should be caught by findById earlier, but as a fallback
      res.status(404).json({ message: 'Pengguna tidak ditemukan atau sudah dihapus.' });
    }
  } catch (error) {
    console.error('Error deleting user registration:', error);
    // Check for foreign key constraint errors if user has related documents
    if (error.constraint === 'documents_uploader_user_id_fkey') {
        return res.status(400).json({ message: 'Tidak dapat menghapus pengguna ini karena mereka memiliki dokumen terkait. Hapus atau alihkan dokumen terlebih dahulu.' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat menghapus registrasi pengguna.' });
  }
};
