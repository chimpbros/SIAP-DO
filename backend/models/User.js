const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async create({ email, password, nama, pangkat, nrp }) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO users (email, password_hash, nama, pangkat, nrp, is_admin, is_approved)
      VALUES ($1, $2, $3, $4, $5, FALSE, FALSE)
      RETURNING user_id, email, nama, pangkat, nrp, is_admin, is_approved, registration_timestamp;
    `;
    const values = [email, password_hash, nama, pangkat, nrp];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1;';
    try {
      const { rows } = await db.query(query, [email]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  async findById(userId) {
    const query = 'SELECT user_id, email, nama, pangkat, nrp, is_admin, is_approved FROM users WHERE user_id = $1;';
    try {
      const { rows } = await db.query(query, [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },

  async comparePassword(candidatePassword, passwordHash) {
    return bcrypt.compare(candidatePassword, passwordHash);
  },

  // Admin functions
  async getAll() {
    // TODO: Add pagination
    const query = 'SELECT user_id, email, nama, pangkat, nrp, is_admin, is_approved, registration_timestamp FROM users ORDER BY registration_timestamp DESC;';
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  async approve(userId) {
    const query = 'UPDATE users SET is_approved = TRUE WHERE user_id = $1 RETURNING *;';
    try {
      const { rows } = await db.query(query, [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  },

  async revoke(userId) {
    const query = 'UPDATE users SET is_approved = FALSE WHERE user_id = $1 RETURNING *;';
    // Consider if revoking should also set is_admin to FALSE or other actions
    try {
      const { rows } = await db.query(query, [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error revoking user access:', error);
      throw error;
    }
  },

  async setAdminStatus(userId, isAdmin) {
    const query = 'UPDATE users SET is_admin = $1 WHERE user_id = $2 RETURNING *;';
    try {
      const { rows } = await db.query(query, [isAdmin, userId]);
      return rows[0];
    } catch (error) {
      console.error('Error setting admin status:', error);
      throw error;
    }
  },

  async deleteById(userId) {
    // This will permanently delete the user. 
    // Ensure this is the desired behavior for a "registration request deletion".
    // If the user is already approved, this would delete an active user.
    // For pending requests (is_approved = FALSE), this is effectively rejecting and deleting.
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING user_id;'; // RETURNING helps confirm deletion
    try {
      const { rows } = await db.query(query, [userId]);
      return rows[0]; // Returns { user_id: '...' } if successful, or undefined if not found
    } catch (error) {
      console.error('Error deleting user by ID:', error);
      throw error;
    }
  }
};

module.exports = User;
