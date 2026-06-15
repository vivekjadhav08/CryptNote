const express = require('express');
const router = express.Router();
const EMI = require('../models/EMI');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// GET all EMIs
router.get('/all', fetchuser, async (req, res) => {
  try {
    const emis = await EMI.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(emis);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// ADD EMI
router.post('/add', fetchuser, [
  body('name').isLength({ min: 2 }),
  body('totalAmount').isNumeric(),
  body('emiAmount').isNumeric(),
  body('durationMonths').isNumeric(),
  body('startDate').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, totalAmount, emiAmount, durationMonths, startDate, interestRate, lender, category } = req.body;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + parseInt(durationMonths));
    const emi = new EMI({
      user: req.user.id, name, totalAmount, emiAmount, durationMonths,
      startDate: start, endDate: end,
      interestRate: interestRate || 0,
      lender: lender || '',
      category: category || 'Other',
      payments: []
    });
    const saved = await emi.save();
    res.json(saved);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// UPDATE EMI
router.put('/update/:id', fetchuser, async (req, res) => {
  try {
    let emi = await EMI.findById(req.params.id);
    if (!emi) return res.status(404).json({ error: 'Not found' });
    if (emi.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not allowed' });
    const { name, totalAmount, emiAmount, durationMonths, startDate, interestRate, lender, category, isActive } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (totalAmount) updates.totalAmount = totalAmount;
    if (emiAmount) updates.emiAmount = emiAmount;
    if (durationMonths) { updates.durationMonths = durationMonths; }
    if (startDate) {
      const start = new Date(startDate);
      updates.startDate = start;
      const end = new Date(start);
      end.setMonth(end.getMonth() + parseInt(durationMonths || emi.durationMonths));
      updates.endDate = end;
    }
    if (interestRate !== undefined) updates.interestRate = interestRate;
    if (lender !== undefined) updates.lender = lender;
    if (category !== undefined) updates.category = category;
    if (isActive !== undefined) updates.isActive = isActive;
    emi = await EMI.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    res.json(emi);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE EMI
router.delete('/delete/:id', fetchuser, async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id);
    if (!emi) return res.status(404).json({ error: 'Not found' });
    if (emi.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not allowed' });
    await EMI.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// ADD PAYMENT
router.post('/payment/:id', fetchuser, async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id);
    if (!emi) return res.status(404).json({ error: 'Not found' });
    if (emi.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not allowed' });
    const { paidDate, amount, note } = req.body;
    emi.payments.push({ paidDate: new Date(paidDate), amount: amount || emi.emiAmount, note: note || '' });
    await emi.save();
    res.json(emi);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE PAYMENT
router.delete('/payment/:emiId/:paymentId', fetchuser, async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.emiId);
    if (!emi) return res.status(404).json({ error: 'Not found' });
    if (emi.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not allowed' });
    emi.payments = emi.payments.filter(p => p._id.toString() !== req.params.paymentId);
    await emi.save();
    res.json(emi);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
