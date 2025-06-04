const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Portfolio = require('../models/Portfolio');

const getMonthName = (month) =>
  new Date(2000, month - 1).toLocaleString('default', { month: 'long' });

async function getOneYearFinanceSummary(userId) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Expenses aggregation with totals
  const expenseData = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: oneYearAgo }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          year: { $year: "$date" },
          category: "$category"
        },
        total: { $sum: "$amount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const expenseSummary = {};
  expenseData.forEach(({ _id, total }) => {
    const month = getMonthName(_id.month);
    const category = _id.category;

    if (!expenseSummary[month]) {
      expenseSummary[month] = { total: 0 };
    }

    expenseSummary[month][category] = total;
    expenseSummary[month].total += total;
  });

  // Income aggregation with totals
  const incomeData = await Income.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: oneYearAgo }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          year: { $year: "$date" },
          source: "$source"
        },
        total: { $sum: "$amount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const incomeSummary = {};
  incomeData.forEach(({ _id, total }) => {
    const month = getMonthName(_id.month);
    const source = _id.source;

    if (!incomeSummary[month]) {
      incomeSummary[month] = { total: 0 };
    }

    incomeSummary[month][source] = total;
    incomeSummary[month].total += total;
  });

  // Portfolio / Investment details
  const portfolio = await Portfolio.find({ userId: new mongoose.Types.ObjectId(userId) });

  let totalInvested = 0;
  const stocks = [];

  portfolio.forEach(stock => {
    const invested = stock.buyPrice * stock.quantity;
    totalInvested += invested;
    stocks.push({
      stock: stock.stock,
      quantity: stock.quantity,
      buyPrice: stock.buyPrice,
      invested
    });
  });

  return {
    expenses: expenseSummary,
    income: incomeSummary,
    investment: {
      invested: totalInvested,
      stocks
    }
  };
}

module.exports = { getOneYearFinanceSummary };
