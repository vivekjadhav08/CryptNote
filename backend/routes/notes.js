const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get all notes - pinned first
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ isPinned: -1, date: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Add note
router.post('/addnote', fetchuser, [
  body('title', 'Enter Valid Title').isLength({ min: 3 }),
  body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send({ error: errors.array() });
    const { title, description, tag, color, isPinned, reminder, image } = req.body;
    const note = new Note({
      title, description,
      tag: tag || 'General',
      color: color || '#ffffff',
      isPinned: isPinned || false,
      reminder: reminder || null,
      image: image || null,
      user: req.user.id
    });
    const savedNote = await note.save();
    res.json(savedNote);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 3: Update note
router.put('/updatenote/:id', fetchuser, [
  body('title', 'Enter Valid Title').isLength({ min: 3 }),
  body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send({ error: errors.array() });
    const { title, description, tag, color, reminder, image } = req.body;
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag !== undefined) newNote.tag = tag;
    if (color !== undefined) newNote.color = color;
    if (reminder !== undefined) newNote.reminder = reminder;
    if (image !== undefined) newNote.image = image;

    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send("Not Found");
    if (note.user.toString() !== req.user.id) return res.status(401).send("Not Allowed");
    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.json({ note });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4: Delete note
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send("Not Found");
    if (note.user.toString() !== req.user.id) return res.status(401).send("Not Allowed");
    await Note.findByIdAndDelete(req.params.id);
    res.json({ "Success": "Note has been Deleted" });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 5: Toggle pin
router.put('/togglepin/:id', fetchuser, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send("Not Found");
    if (note.user.toString() !== req.user.id) return res.status(401).send("Not Allowed");
    note = await Note.findByIdAndUpdate(req.params.id, { $set: { isPinned: !note.isPinned } }, { new: true });
    res.json({ note });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
