import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Utils/axiosinstance';
import axios from 'axios';
import { API_PATHS } from '../../Utils/ApiPaths';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import {
  Plus,
  Trash2,
  Search,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  ArrowUp
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrResult, setOcrResult] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);



  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
      // Ensure we always have an array, even if the API returns null or undefined
      const expensesData = Array.isArray(response.data.expenses) ? response.data.expenses : [];
      setExpenses(expensesData);
      setFilteredExpenses(expensesData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching expenses');
      // Initialize with empty arrays on error
      setExpenses([]);
      setFilteredExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    // Make sure expenses is always an array before filtering
    if (!Array.isArray(expenses)) {
      setFilteredExpenses([]);
      return;
    }

    const filtered = expenses.filter(expense =>
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      if (sortConfig.key === 'category') {
        return sortConfig.direction === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      }
      return 0;
    });

    setFilteredExpenses(sorted);
  }, [searchTerm, sortConfig, expenses]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!amount || !category || !date) {
      setError('Please fill all required fields');
      setTimeout(() => setError(''), 4000);
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        amount: Number(amount),
        category,
        date,
      });
      setSuccess('Expense added successfully');
      setTimeout(() => setSuccess(''), 4000);
      setAmount('');
      setCategory('food');
      setDate('');
      setIsFormOpen(false);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding expense');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleOcrUpload = async () => {
    if (!ocrFile) return alert("Please select a file first");

    setOcrLoading(true);
    const formData = new FormData();
    formData.append('image', ocrFile);

    try {
      const uid = await axiosInstance.get(API_PATHS.EXPENSE.UID);
      formData.append('user_id', uid.data);

      const response = await axios.post(API_PATHS.EXPENSE.OCR_SCAN, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setOcrResult(response.data);
      const { date, total_amount } = response.data;

      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        amount: Number(total_amount),
        category: 'shopping',
        date,
      });

      setSuccess('Expense added successfully');
      setTimeout(() => setSuccess(''), 4000);
      setAmount('');
      setCategory('food');
      setDate('');
      setIsFormOpen(false);
      fetchExpenses();
    } catch (error) {
      setError(error.response?.data?.message || 'OCR upload failed');
      setOcrResult('Error processing image');
    } finally {
      setOcrLoading(false);
    }
  };



  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      setSuccess('Expense deleted successfully');
      setTimeout(() => setSuccess(''), 4000);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting expense');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  // Fix the totalExpense calculation - ensure filteredExpenses is an array before using reduce
  const totalExpense = Array.isArray(filteredExpenses)
    ? filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    : 0;

  const chartData = [...filteredExpenses]
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Reverse order: latest to oldest
    .map(expense => ({
      date: new Date(expense.date).toLocaleDateString('en-GB'), // Format date as DD/MM/YYYY
      amount: expense.amount
    }));


  return (
    <div className="bg-slate-50 min-h-screen">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Expense Tracker</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 m-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Add Expense</h2>
              <form onSubmit={handleAddExpense}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Total Expense</h2>
              <p className="text-3xl font-bold text-indigo-600">₹ {formatCurrency(totalExpense)}</p>
              <p className="text-sm text-slate-500 mt-1">
                {Array.isArray(filteredExpenses) ? filteredExpenses.length : 0} transaction{(Array.isArray(filteredExpenses) && filteredExpenses.length !== 1) ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Upload Image for OCR</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setOcrFile(e.target.files[0])}
              className="block w-full max-w-xs text-sm text-gray-700 border border-slate-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />

            <button
              onClick={handleOcrUpload}
              disabled={ocrLoading}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${ocrLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {ocrLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Upload Reciept</span>
              )}
            </button>



          </div>
          {ocrResult && (
            <div className="mt-4 p-4 bg-gray-100 border rounded text-sm text-slate-700">
              <strong>OCR Result:</strong>
              <h6>Date:</h6>{ocrResult.date}
              <h6>Total Amount:</h6>{ocrResult.total_amount}
            </div>
          )}
        </div>


        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by category..."
              className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-slate-500 hover:text-slate-700 transition-colors text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {/* Expense Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Expense Trend</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* Expense List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading transactions...</p>
            </div>
          ) : !Array.isArray(filteredExpenses) || filteredExpenses.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-500 mb-4">
                <ArrowUp className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No expense records found</h3>
              <p className="text-slate-500">
                {searchTerm ? 'Try a different search term' : 'Add your first expense to get started'}
              </p>
              {searchTerm && (
                <button
                  className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1"
                        onClick={() => handleSort('category')}
                      >
                        Category
                        {sortConfig.key === 'category' && (
                          <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1"
                        onClick={() => handleSort('amount')}
                      >
                        Amount
                        {sortConfig.key === 'amount' && (
                          <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1"
                        onClick={() => handleSort('date')}
                      >
                        Date
                        {sortConfig.key === 'date' && (
                          <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-rose-600">
                        ₹ {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(expense.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="text-rose-600 hover:text-rose-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expense;