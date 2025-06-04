const User = require('../models/User');
const Expense = require('../models/Expense');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

  
// Add Expense
exports.addExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const { icon, category, amount, date } = req.body;

    // Validate required fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new expense entry
    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date,
    });

    await newExpense.save();
    res.status(200).json({ message: 'Expense added successfully', expense: newExpense });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get All Expenses
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: 'No expense records found' });
    }

    res.status(200).json({ message: 'Expense records fetched successfully', expenses });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Download Expenses as Excel
exports.downloadExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: 'No expense records found to download' });
    }

    const data = expenses.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: item.date.toISOString().split('T')[0],
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, 'Expense');

    const downloadsDir = path.join(__dirname, '../downloads');
    const filePath = path.join(downloadsDir, 'Expense_details.xlsx');

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    XLSX.writeFile(wb, filePath);

    res.download(filePath, 'Expense_details.xlsx', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (err) {
    console.error('Error in downloadExpense:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId });

    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {

    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
exports.userId=async (req,res) => {
  const uId=req.user.id;
  try {
    res.json(uId);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
 
  
}