const mongoose = require('mongoose');
const { Types } = mongoose; 
const Review = require("../models/Review");

const reviewsBySellerName = async (req, res) => {
    const { sellerName } = req.params;

    try {
        const reviews = await Review.find({ seller_name: sellerName });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const reviewsById = async (req, res) => {
    const reviewId = req.params.id;

    if (!Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: 'Invalid review ID' });
    }

    try {
        const updatedData = req.body;

        if (updatedData.Available !== undefined) {
            updatedData.Available = updatedData.Available === 'yes' ? 1 : 0;
        }

        if (updatedData["Suggested Price"] !== undefined) {
            updatedData["Suggested Price"] = parseFloat(updatedData["Suggested Price"]) || 0;
        }

        if (updatedData["Current Price"] !== undefined) {
            updatedData["Current Price"] = parseFloat(updatedData["Current Price"]) || 0;
        }

        // Handle additional_info field
        if (updatedData.additionalInfo !== undefined) {
            updatedData.additional_info = updatedData.additionalInfo || ''; // Ensure it's a string
            delete updatedData.additionalInfo; // Remove the old key
        }

        const updatedReview = await Review.findByIdAndUpdate(reviewId, updatedData, { new: true });

        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {
    reviewsBySellerName,
    reviewsById,
};