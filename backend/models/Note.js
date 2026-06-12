const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tag: { type: String, default: 'General' },
  color: { type: String, default: '#ffffff' },
  isPinned: { type: Boolean, default: false },
  reminder: { type: Date, default: null },
  image: { type: String, default: null },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('note', NotesSchema);
