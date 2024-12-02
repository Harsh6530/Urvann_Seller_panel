const Payable = require("../models/Payable");
const Refund = require("../models/Refund");
const Summary = require("../models/Summary");

const summary = async (req, res) => {
    try {
        const sellerName = req.params.sellerName;
        //console.log(`Fetching summary for seller: ${sellerName}`);

        const summary = await Summary.findOne({ Name: sellerName });

        if (!summary) {
            //console.log('Summary not found');
            return res.status(404).json({ message: 'Summary not found' });
        }

        res.json(summary);
    } catch (err) {
        console.error('Error fetching summary:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const refund = async (req, res) => {
    try {
        const sellerName = req.params.sellerName;
        const refunds = await Refund.find({ Seller: sellerName });

        res.json(refunds);
    } catch (err) {
        console.error('Error fetching refunds:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const payable = async (req, res) => {
    try {
        const sellerName = req.params.sellerName;
        const payables = await Payable.find({ seller_name: sellerName });

        res.json(payables);
    } catch (err) {
        console.error('Error fetching payables:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    summary,
    refund,
    payable
}