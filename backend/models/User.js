const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 6,
    select: false  // Password kabhi response mein mat bhejo
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  phone: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true  // createdAt aur updatedAt automatically add hoga
});

// --- Password Hash Karo (Save Se Pehle) ---
userSchema.pre('save', async function(next) {
  // Agar password change nahi hua toh skip karo
  if (!this.isModified('password')) {
    next();
  }

  // Password ko encrypt karo
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- Password Compare Karo (Login Ke Time) ---
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);