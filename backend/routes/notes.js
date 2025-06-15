const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');


//ROUTE 1 :Get All the notes  Endpoint: Get "api/notes/fetchallnotes"  login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }

})

//ROUTE 2 :Add notes  Endpoint: Post "api/notes/addnote"  login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter Valid Title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 charector').isLength({ min: 5 }),

], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //If there are error return bad request
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).send({ error: error.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//ROUTE 3 :Update notes  Endpoint:Put "api/notes/updatenote"  login required
router.put('/updatenote/:id', fetchuser, [
    body('title', 'Enter Valid Title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 charector').isLength({ min: 5 }),], async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            //If there are error return bad request
            const error = validationResult(req);
            if (!error.isEmpty()) {
                return res.status(400).send({ error: error.array() });
            }
            const newNote = {}
            if (title) { newNote.title = title };
            if (description) { newNote.description = description };
            if (tag) { newNote.tag = tag };

            //find note to be updated an update it
            let note = await Note.findById(req.params.id);
            if (!note) {
                return res.status(404).send("Not Found")
            }
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("Not Allowed");
            }
            note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
            res.json({ note });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error")
        }
    })

//ROUTE 4 :Delete notes  Endpoint: Delete "api/notes/deletenote"  login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //find note to be deleted an delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found")
        }
        //Allow to delete onye there notes
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been Deleted", note: note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router
