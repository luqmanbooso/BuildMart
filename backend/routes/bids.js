const express = require('express');
const Bid = require('../models/Bid');

const router = express.Router();

//  1. Submit a new bid
router.post('/submit', async (req, res) => {
  try {
    const { contractorName, price, timeline, qualifications } = req.body;
    const newBid = new Bid({ contractorName, price, timeline, qualifications });
    await newBid.save();
    res.status(201).json({ message: 'Bid submitted successfully', bid: newBid });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting bid' });
  }
});

//  2. Get all bids (for clients to compare)
router.get('/', async (req, res) => {
  try {
    const bids = await Bid.find();
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bids' });
  }
});

//  3. Accept or reject a bid
router.put('/:bidId/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const bid = await Bid.findByIdAndUpdate(req.params.bidId, { status }, { new: true });
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    res.json({ message: `Bid ${status} successfully`, bid });
  } catch (error) {
    res.status(500).json({ error: 'Error updating bid status' });
  }
});

module.exports = router;
