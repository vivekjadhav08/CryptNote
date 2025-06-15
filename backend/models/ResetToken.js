const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: 900 } // 15 minutes TTL
  }
});

module.exports = mongoose.model('ResetToken', resetTokenSchema);
