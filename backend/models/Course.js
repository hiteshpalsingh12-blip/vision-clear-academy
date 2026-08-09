const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '00:00'
  },
  order: {
    type: Number,
    default: 0
  },
  isFree: {
    type: Boolean,
    default: false
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter course description']
  },
  price: {
    type: Number,
    required: [true, 'Please enter course price'],
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'masterclass'],
    default: 'beginner'
  },
  instructor: {
    type: String,
    default: 'Forex Academy'
  },
  lessons: [lessonSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: true   // Payment ke bina locked
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);