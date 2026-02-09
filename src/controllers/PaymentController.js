const Payment = require('../models/PaymentSchema');
const response = require('../../responses');

const PaymentController = {
  getAllPayment: async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    if (search) {
      filter = {
        $or: [
          { transactionId: { $regex: search, $options: "i" } },
          { paymentStatus: { $regex: search, $options: "i" } },
        ],
      };
    }

    const allPayments = await Payment.find(filter)
      .populate("planId")
      .populate("userId")
      .sort({ createdAt: -1 });

    return response.ok(res, {
      message: "All payment details fetched successfully",
      data: allPayments,
    });
  } catch (error) {
    console.error("Get Payment error:", error);
    return response.error(
      res,
      error.message || "Failed to fetch payment details"
    );
  }
},
};

module.exports = PaymentController;
