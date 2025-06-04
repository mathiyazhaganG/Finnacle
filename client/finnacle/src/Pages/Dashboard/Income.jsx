import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/ApiPaths';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import {
  ArrowUp,
  Plus,
  Trash2,
  Search,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const INCOME_SOURCES = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment' },
  { value: 'rental', label: 'Rental' },
  { value: 'gift', label: 'Gift' },
  { value: 'other', label: 'Other' },
];

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('salary'); // Default to 'salary'
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);
      setIncomes(response.data);
      setFilteredIncomes(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching incomes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  useEffect(() => {
    const filtered = incomes.filter(income =>
      income.source.toLowerCase().includes(searchTerm.toLowerCase())
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
      return 0;
    });


    setFilteredIncomes(sorted);
  }, [searchTerm, sortConfig, incomes]);

  const handleAddIncome = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!amount || !source || !date) {
      setError('Please fill all required fields');
      setTimeout(() => setError(''), 4000); // Set timeout for error message
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        amount: Number(amount),
        source,
        date,
      });
      setSuccess('Income added successfully');
      setTimeout(() => setSuccess(''), 4000); // Set timeout for success message
      setAmount('');
      setSource('salary');
      setDate('');
      setIsFormOpen(false);
      fetchIncomes();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding income');
      setTimeout(() => setError(''), 4000); // Set timeout for error message
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income?')) return;
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      setSuccess('Income deleted successfully');
      setTimeout(() => setSuccess(''), 4000); // Set timeout for success message
      fetchIncomes();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting income');
      setTimeout(() => setError(''), 4000); // Set timeout for error message
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
  const chartData = [...filteredIncomes]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((income) => ({
      date: new Date(income.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), // e.g., 28 Apr
      amount: income.amount,
    }));


  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="bg-slate-50 min-h-screen">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Income Tracker</h1>
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
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Add Income</h2>
              <form onSubmit={handleAddIncome}>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  >
                    {INCOME_SOURCES.map((src) => (
                      <option key={src.value} value={src.value}>
                        {src.label}
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
                    Add Income
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Total Income</h2>
              <p className="text-3xl font-bold text-indigo-600">₹ {formatCurrency(totalIncome)}</p>
              <p className="text-sm text-slate-500 mt-1">
                {filteredIncomes.length} transaction{filteredIncomes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Income</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by source..."
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
        {/* Income Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Income Over Time</h2>
          {chartData.length === 0 ? (
            <p className="text-slate-500 text-sm">No income data available to display.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>


        {/* Income List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading transactions...</p>
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-500 mb-4">
                <ArrowUp className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No income records found</h3>
              <p className="text-slate-500">
                {searchTerm ? 'Try a different search term' : 'Add your first income to get started'}
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
                        onClick={() => handleSort('source')}
                      >
                        Source
                        {sortConfig.key === 'source' && (
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredIncomes.map((income) => (
                    <tr key={income._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {income.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                        ₹ {formatCurrency(income.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(income.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDeleteIncome(income._id)}
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

export default Income;