const DeliveryUpdate = require("../models/deliveryUpdate");

const getUpdates = async (req, res) => {
    try {
        const sellerName = req.params.sellerName;

        // Fetch only the Date, Delivered, and Penalty fields
        const deliveryUpdates = await DeliveryUpdate.find({ 'Seller name': sellerName }, 'Date Delivered Penalty');

        res.json({ deliveryUpdates });
    } catch (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { getUpdates };