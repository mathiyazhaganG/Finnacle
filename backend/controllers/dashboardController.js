const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { isValidObjectId, Types } = require('mongoose');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        // Calculate total income
        const totalIncome = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        // Calculate total expense
        const totalExpense = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        // Last 60 days income
        const last60DayIncome = await Income.find({
            userId,
            date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        const TotalLast60DayIncome = last60DayIncome.reduce(
            (sum, income) => sum + income.amount,
            0
        );

        // Last 30 days expense
        const last30DayExpense = await Expense.find({
            userId,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        const TotalLast30DayExpense = last30DayExpense.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );

        // Last 5 transactions
        const last5Transactions = [
            ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map((txn) => ({
                ...txn.toObject(),
                type: "income",
            })),
            ...(await Expense.find({ userId }).sort({ date: -1 }).limit(5)).map((txn) => ({
                ...txn.toObject(),
                type: "expense",
            })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Response
        res.json({
            totalBalance:
                (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpenses: totalExpense[0]?.total || 0,
            last30DaysExpenses: {
                total: TotalLast30DayExpense,
                transactions: last30DayExpense,
            },
            last60DaysIncome: {
                total: TotalLast60DayIncome,
                transactions: last60DayIncome,
            },
            recentTransactions: last5Transactions,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};