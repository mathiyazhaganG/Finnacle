const User = require('../models/User');
const Income = require('../models/Income');
const XLSX = require('xlsx'); // Correct import for the xlsx library
const path = require('path'); // To handle file paths
const fs = require('fs'); // To check and create directories

exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, source, amount, date } = req.body;
        if (!source || !amount || !date) {
            return res.status(400).json({ message: "all fields are required" });
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date)
        });
        await newIncome.save();
        res.status(200).json(newIncome);
    } catch (error) {
        res.status(500).json({ message: "server Error" });
    }
};

exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await Income.find({ userId }).sort({ date: -1 });
        if (!income || income.length === 0) {
            return res.status(404).json({ message: "No income records found" });
        }
        res.status(200).json(income);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.downloadIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        // Fetch income records for the user
        const income = await Income.find({ userId }).sort({ date: -1 });

        if (!income || income.length === 0) {
            return res.status(404).json({ message: "No income records found to download" });
        }

        // Map income data to a format suitable for Excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        }));

        // Create a new workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Income");

        // Define the file path and name
        const downloadsDir = path.join(__dirname, '../downloads');
        const filePath = path.join(downloadsDir, 'income_details.xlsx');

        // Ensure the downloads directory exists
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        // Write the workbook to a file
        XLSX.writeFile(wb, filePath);

        // Send the file for download
        res.download(filePath, 'income_details.xlsx', (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).json({ message: "Error downloading file" });
            }
        });
    } catch (err) {
        console.error("Error in downloadIncome:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.deleteIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: "Income deleted successfully " });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};