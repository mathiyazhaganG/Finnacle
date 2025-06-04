import React, { useState, useEffect } from 'react';
import axiosInstance from '../../Utils/axiosinstance';
import { IndianStocks } from '../../Utils/Stocks';
import { API_PATHS } from '../../Utils/ApiPaths';
import {
	Search,
	Plus,
	Trash2,
	TrendingUp,
	TrendingDown,
	BarChart2,
	RefreshCw,
	AlertCircle,
	PieChartIcon,
	ChevronDown,
	ChevronUp,
	Wallet,
	ArrowUpRight,
	DollarSign,
	Percent
} from 'lucide-react';
import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
	CartesianGrid,
	Area,
	AreaChart
} from 'recharts';

function Portfolio() {
	const [activeTab, setActiveTab] = useState('dashboard'); // Define activeTab state
	const [stocks, setStocks] = useState([]);
	const [symbol, setSymbol] = useState('');
	const [stockName, setStockName] = useState('');
	const [quantity, setQuantity] = useState('');
	const [buyPrice, setBuyPrice] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [exchange, setExchange] = useState('BSE');
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [portfolioHistory, setPortfolioHistory] = useState([]);


	const COLORS = [
		'#6366F1', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B',
		'#3B82F6', '#EF4444', '#14B8A6', '#F97316', '#8B5CF6'
	];

	const fetchPortfolio = async () => {
		try {
			setIsLoading(true);
			const { data } = await axiosInstance.get(API_PATHS.PORTFOLIO.PORTFOLIO);
			setStocks(data);
			setError('');
		} catch (error) {
			setError('Failed to load portfolio data. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const fetchPortfolioHistory = async () => {
		try {
			const { data } = await axiosInstance.get(API_PATHS.PORTFOLIO.HISTORY);
			setPortfolioHistory(data);
		} catch (error) {
			console.error('Error fetching portfolio history:', error);
		}
	};

	const recordPortfolioValue = async (totalValue) => {
		try {
			await axiosInstance.post(API_PATHS.PORTFOLIO.HISTORY, { totalValue });
		} catch (error) {
			console.error('Error recording portfolio value:', error);
		}
	};

	const refreshPrices = () => {
		window.location.reload(); // Reload the page
	};

	useEffect(() => {
		fetchPortfolio();
		fetchPortfolioHistory();
	}, []);

	useEffect(() => {
		if (stocks.length > 0) {
			const totalValue = stocks.reduce((sum, stock) => sum + (stock.currentValue || 0), 0);
			recordPortfolioValue(totalValue);
		}
	}, [stocks]);

	const handleAddStock = async (e) => {
		e.preventDefault();
		try {
			if (!symbol || !stockName) {
				setError('Stock name or symbol is not set');
				return;
			}

			const formattedSymbol = exchange === 'BSE' ? `${symbol}.BO` : `${symbol}.NS`;

			await axiosInstance.post(API_PATHS.PORTFOLIO.ADD_STOCKS, {
				stock: stockName,
				symbol: formattedSymbol,
				quantity,
				buyPrice
			});

			// Reset form fields
			setSymbol('');
			setStockName('');
			setQuantity('');
			setBuyPrice('');
			setSearchTerm('');
			setExchange('BSE');
			setError('');
			fetchPortfolio();
		} catch (error) {
			console.error('Error adding stock:', error);
			setError('Failed to add stock. Please try again.');
		}
	};

	const handleDeleteStock = async (id) => {
		try {
			await axiosInstance.delete(API_PATHS.PORTFOLIO.DELETE_STOCKS(id));
			fetchPortfolio();
		} catch (error) {
			console.error('Error deleting stock:', error);
			setError('Failed to delete stock. Please try again.');
		}
	};

	const handleSearch = (e) => {
		const term = e.target.value;
		setSearchTerm(term);

		if (term.length > 0) {
			const filteredStocks = Object.entries(IndianStocks)
				.filter(([name]) => name.toLowerCase().includes(term.toLowerCase()))
				.slice(0, 5);

			setSearchResults(filteredStocks);
			setShowDropdown(true);
		} else {
			setSearchResults([]);
			setShowDropdown(false);
		}
	};

	const selectStock = (name, stockSymbol) => {
		setSearchTerm(name);
		setStockName(name);
		setSymbol(stockSymbol);
		setShowDropdown(false);
	};

	// Calculate portfolio summary
	const calculatePortfolioSummary = () => {
		if (stocks.length === 0) return { totalValue: 0, totalInvestment: 0, totalProfitLoss: 0, percentageChange: 0 };

		const totalValue = stocks.reduce((sum, stock) => sum + (stock.currentValue || 0), 0);
		const totalInvestment = stocks.reduce((sum, stock) => sum + (stock.buyPrice * stock.quantity), 0);
		const totalProfitLoss = totalValue - totalInvestment;
		const percentageChange = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

		return { totalValue, totalInvestment, totalProfitLoss, percentageChange };
	};

	// Prepare data for visualization
	const preparePortfolioAllocationData = () => {
		if (stocks.length === 0) return [];

		return stocks.map(stock => ({
			name: stock.stock,
			value: stock.currentValue || 0
		}));
	};

	const prepareProfitLossData = () => {
		if (stocks.length === 0) return [];

		return stocks.map(stock => {
			const profitLoss = (stock.currentValue || 0) - (stock.buyPrice * stock.quantity);
			return {
				name: stock.stock,
				value: profitLoss,
				fill: profitLoss >= 0 ? '#10B981' : '#EF4444'
			};
		}).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 5);
	};

	// Generate data for area chart - simulate stock value trend
	const preparePortfolioHistoryData = () => {
		if (portfolioHistory.length === 0) return [];

		return portfolioHistory.map(record => {
			// More concise date format to prevent overlap
			const date = new Date(record.timestamp);
			// Format as "Jan 1" or "Jan 1 '24" if showing multiple years
			const formattedDate = new Intl.DateTimeFormat('en-US', {
				month: 'short',
				day: 'numeric',
				year: portfolioHistory.length > 30 ? '2-digit' : undefined
			}).format(date);

			return {
				date: formattedDate,
				value: record.totalValue
			};
		});
	};






	const summary = calculatePortfolioSummary();
	const portfolioAllocationData = preparePortfolioAllocationData();
	const profitLossData = prepareProfitLossData();
	const timeSeriesData = preparePortfolioHistoryData();

	// Custom tooltip for charts
	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
					<p className="font-medium text-gray-900">{label || payload[0].name}</p>
					<p className="text-sm text-gray-600">
						{payload[0].name}: ₹{Math.abs(payload[0].value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
					</p>
				</div>
			);
		}
		return null;
	};

	// Format for the Pie Chart labels
	const RADIAN = Math.PI / 180;
	const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
		const radius = outerRadius * 1.1;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return percent > 0.05 ? (
			<text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
				{`${name} ${(percent * 100).toFixed(0)}%`}
			</text>
		) : null;
	};

	return (
		<div className="min-h-screen bg-slate-50 p-6 mt-16">
			<div className="max-w-7xl mx-auto">
				{/* Header with Navigation */}
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
					<div>
						<h1 className="text-3xl font-bold text-slate-800 flex items-center">
							<Wallet className="mr-3 text-indigo-600" size={28} />
							Market Portfolio
						</h1>
						<p className="text-slate-500 mt-1">Track, analyze, and optimize your investments</p>
					</div>

					<div className="flex mt-4 lg:mt-0 gap-2">
						<button
							onClick={() => setActiveTab('dashboard')}
							className={`flex items-center px-4 py-2 rounded-lg font-medium ${activeTab === 'dashboard'
								? 'bg-indigo-100 text-indigo-700'
								: 'bg-white text-slate-700 hover:bg-slate-100'
								}`}
						>
							<BarChart2 size={18} className="mr-2" />
							Dashboard
						</button>

						<button
							onClick={() => setActiveTab('add')}
							className={`flex items-center px-4 py-2 rounded-lg font-medium ${activeTab === 'add'
								? 'bg-indigo-100 text-indigo-700'
								: 'bg-white text-slate-700 hover:bg-slate-100'
								}`}
						>
							<Plus size={18} className="mr-2" />
							Add Stock
						</button>

						<button
							onClick={refreshPrices}
							className={`flex items-center px-4 py-2 rounded-lg font-medium bg-white text-slate-700 hover:bg-slate-100 border border-slate-200`}
							disabled={isRefreshing}
						>
							<RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
							Refresh
						</button>
					</div>
				</div>

				{error && (
					<div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-xl shadow-sm flex items-start">
						<AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={18} />
						<p className="text-red-700">{error}</p>
					</div>
				)}

				{/* Portfolio Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					<div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-md text-white">
						<div className="flex justify-between items-center mb-2">
							<p className="text-indigo-100">Total Value</p>
							<DollarSign className="text-indigo-200" size={18} />
						</div>
						<h3 className="text-2xl font-bold">₹{summary.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
						<p className="text-xs text-indigo-200 mt-1">Current portfolio valuation</p>
					</div>

					<div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
						<div className="flex justify-between items-center mb-2">
							<p className="text-slate-500">Investment</p>
							<Wallet className="text-slate-400" size={18} />
						</div>
						<h3 className="text-2xl font-bold text-slate-800">₹{summary.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
						<p className="text-xs text-slate-400 mt-1">Total investment amount</p>
					</div>

					<div className={`p-6 rounded-2xl shadow-md ${summary.totalProfitLoss >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : 'bg-gradient-to-br from-red-500 to-red-600 text-white'}`}>
						<div className="flex justify-between items-center mb-2">
							<p className={summary.totalProfitLoss >= 0 ? 'text-emerald-100' : 'text-red-100'}>Profit/Loss</p>
							{summary.totalProfitLoss >= 0 ?
								<ArrowUpRight className="text-emerald-200" size={18} /> :
								<TrendingDown className="text-red-200" size={18} />
							}
						</div>
						<h3 className="text-2xl font-bold">
							{summary.totalProfitLoss >= 0 ? '+ ' : '- '}₹{Math.abs(summary.totalProfitLoss).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
						</h3>
						<p className={`text-xs mt-1 ${summary.totalProfitLoss >= 0 ? 'text-emerald-100' : 'text-red-100'}`}>
							Absolute profit/loss
						</p>
					</div>

					<div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
						<div className="flex justify-between items-center mb-2">
							<p className="text-slate-500">Return</p>
							<Percent className="text-slate-400" size={18} />
						</div>
						<div className="flex items-center">
							{summary.percentageChange >= 0 ?
								<TrendingUp size={22} className="text-emerald-500 mr-2" /> :
								<TrendingDown size={22} className="text-red-500 mr-2" />
							}
							<h3 className={`text-2xl font-bold ${summary.percentageChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
								{summary.percentageChange.toFixed(2)}%
							</h3>
						</div>
						<p className="text-xs text-slate-400 mt-1">Overall performance</p>
					</div>
				</div>

				{/* Main Content Area */}
				{activeTab === 'dashboard' ? (
					<>
						{/* Portfolio Visualizations */}
						<div className="mb-6">
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* Portfolio Value Trend */}
								<div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 lg:col-span-3">
									<h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
										<TrendingUp size={18} className="mr-2 text-indigo-500" />
										Portfolio Value Trend
									</h3>
									<div className="h-72">
										<ResponsiveContainer width="100%" height="100%">
											<AreaChart
												data={timeSeriesData}
												margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
											>
												<defs>
													<linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
														<stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
														<stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
													</linearGradient>
												</defs>
												<XAxis
													dataKey="date"
													stroke="#94A3B8"
													tickFormatter={(tick) => tick}
													interval="preserveStartEnd"
													tick={{ fontSize: 12 }}
													tickMargin={10}
													angle={-30}
													textAnchor="end"
													height={60}
												/>
												<YAxis stroke="#94A3B8" />
												<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
												<Tooltip content={<CustomTooltip />} />
												<Area type="monotone" dataKey="value" stroke="#6366F1" fillOpacity={1} fill="url(#colorValue)" />
											</AreaChart>
										</ResponsiveContainer>
									</div>
								</div>

								{/* Portfolio Allocation */}
								<div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
									<h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
										<PieChartIcon size={18} className="mr-2 text-indigo-500" />
										Portfolio Allocation
									</h3>
									<div className="h-80"> {/* Increased height from 64 to 80 */}
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={portfolioAllocationData}
													cx="50%"
													cy="50%"
													innerRadius={60}
													outerRadius={80}
													fill="#8884d8"
													paddingAngle={2}
													dataKey="value"
												>
													{portfolioAllocationData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
													))}
												</Pie>
												<Tooltip content={<CustomTooltip />} />
												<Legend
													layout="horizontal"
													verticalAlign="bottom"
													align="center"
													wrapperStyle={{ paddingTop: 20 }}
												/>
											</PieChart>
										</ResponsiveContainer>
									</div>
								</div>
								{/* Top Gainers/Losers */}
								<div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 lg:col-span-2">
									<h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
										<BarChart2 size={18} className="mr-2 text-indigo-500" />
										Top Performers
									</h3>
									<div className="h-64">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart
												data={profitLossData}
												layout="vertical"
												margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
											>
												<CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
												<XAxis
													type="number"
													stroke="#94A3B8"
													tickFormatter={(value) => `₹${value >= 0 ? '+' : ''}${value}`}
												/>
												<YAxis type="category" dataKey="name" stroke="#94A3B8" width={120} />
												<Tooltip content={<CustomTooltip />} />
												<Bar
													dataKey="value"
													radius={[0, 4, 4, 0]}
												>
													{profitLossData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.fill} />
													))}
												</Bar>
											</BarChart>
										</ResponsiveContainer>
									</div>
								</div>
							</div>
						</div>

						{/* Stock Table */}
						<div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
							<div className="p-5 border-b border-gray-100 flex justify-between items-center">
								<div className="flex items-center">
									<BarChart2 className="mr-2 text-indigo-500" size={20} />
									<h2 className="text-lg font-semibold text-slate-800">Your Holdings</h2>
								</div>
								<span className="text-slate-500 text-sm">{stocks.length} stocks</span>
							</div>

							{isLoading ? (
								<div className="flex justify-center items-center h-64">
									<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
								</div>
							) : stocks.length > 0 ? (
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-100">
										<thead className="bg-slate-50">
											<tr>
												<th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
												<th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Symbol</th>
												<th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
												<th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Buy Price</th>
												<th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Current Price</th>
												<th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Current Value</th>
												<th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Profit/Loss</th>
												<th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Change</th>
												<th scope="col" className="relative px-6 py-4">
													<span className="sr-only">Actions</span>
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-100">
											{stocks.map((stock) => {
												const profitLoss = stock.currentValue - (stock.buyPrice * stock.quantity);
												const profitLossPercentage = ((stock.currentPrice / stock.buyPrice) - 1) * 100;

												return (
													<tr key={stock._id} className="hover:bg-slate-50 transition-colors">
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="font-medium text-slate-800">{stock.stock || 'Unknown'}</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{stock.symbol}</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right">{stock.quantity}</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right">₹{stock.buyPrice}</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right">
															₹{stock.currentPrice?.toFixed(2)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right font-medium">
															₹{stock.currentValue?.toFixed(2)}
														</td>
														<td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${profitLoss >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
															{profitLoss >= 0 ? '+' : '-'}₹{Math.abs(profitLoss).toFixed(2)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-right">
															<div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${profitLossPercentage >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
																}`}>
																{profitLossPercentage >= 0 ?
																	<TrendingUp size={12} className="mr-1" /> :
																	<TrendingDown size={12} className="mr-1" />
																}
																{Math.abs(profitLossPercentage).toFixed(2)}%
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
															<button
																onClick={() => handleDeleteStock(stock._id)}
																className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-md hover:bg-red-50"
															>
																<Trash2 size={16} />
															</button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							) : (
								<div className="p-12 text-center">
									<div className="flex flex-col items-center justify-center">
										<div className="bg-slate-100 rounded-full p-4 mb-4">
											<Wallet size={32} className="text-slate-400" />
										</div>
										<p className="text-slate-500 mb-2">No stocks in your portfolio yet</p>
										<button
											onClick={() => setActiveTab('add')}
											className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
										>
											<Plus size={16} className="mr-1" /> Add your first stock
										</button>
									</div>
								</div>
							)}
						</div>
					</>
				) : (
					/* Add Stock Form */
					<div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mb-8">
						<h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
							<Plus size={20} className="mr-2 text-indigo-500" />
							Add New Stock to Portfolio
						</h2>

						<form onSubmit={handleAddStock} className="grid grid-cols-1 md:grid-cols-12 gap-6">
							<div className="relative md:col-span-5">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Search className="h-5 w-5 text-slate-400" />
								</div>
								<input
									type="text"
									placeholder="Search stock by name"
									value={searchTerm}
									onChange={handleSearch}
									className="pl-10 block w-full border border-slate-200 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
									onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
									onFocus={() => searchTerm && setShowDropdown(true)}
								/>
								{showDropdown && searchResults.length > 0 && (
									<div className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
										{searchResults.map(([name, stockSymbol]) => (
											<div
												key={stockSymbol}
												className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0"
												onClick={() => selectStock(name, stockSymbol)}
											>
												<div className="font-medium text-slate-800">{name}</div>
												<div className="text-sm text-slate-500">{stockSymbol}</div>
											</div>
										))}
									</div>
								)}
							</div>

							<div className="md:col-span-2">
								<select
									value={exchange}
									onChange={(e) => setExchange(e.target.value)}
									className="block w-full border border-slate-200 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
								>
									<option value="BSE">BSE</option>
									<option value="NSE">NSE</option>
								</select>
							</div>

							<div className="md:col-span-2">
								<input
									type="number"
									placeholder="Quantity"
									value={quantity}
									onChange={(e) => setQuantity(e.target.value)}
									required
									className="block w-full border border-slate-200 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
								/>
							</div>

							<div className="md:col-span-2">
								<input
									type="number"
									placeholder="Buy Price"
									value={buyPrice}
									onChange={(e) => setBuyPrice(e.target.value)}
									required
									className="block w-full border border-slate-200 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
								/>
							</div>

							<div className="md:col-span-1">
								<button
									type="submit"
									disabled={isLoading}
									className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-150 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm flex items-center justify-center"
								>
									<Plus size={18} className="mr-1" />
									Add
								</button>
							</div>
						</form>

						<div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
							<h3 className="text-lg font-medium text-slate-800 mb-2">How to add stocks to your portfolio</h3>
							<ol className="space-y-2 text-slate-600">
								<li className="flex items-start">
									<span className="flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 mr-2 mt-0.5 text-sm font-medium flex-shrink-0">1</span>
									<span>Search for a stock by its company name in the search box</span>
								</li>
								<li className="flex items-start">
									<span className="flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 mr-2 mt-0.5 text-sm font-medium flex-shrink-0">2</span>
									<span>Select the exchange (BSE or NSE) where you purchased the stock</span>
								</li>
								<li className="flex items-start">
									<span className="flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 mr-2 mt-0.5 text-sm font-medium flex-shrink-0">3</span>
									<span>Enter the quantity of shares purchased and your buy price</span>
								</li>
								<li className="flex items-start">
									<span className="flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 mr-2 mt-0.5 text-sm font-medium flex-shrink-0">4</span>
									<span>Click "Add" to include the stock in your portfolio</span>
								</li>
							</ol>
						</div>
					</div>
				)}

				{/* Footer */}
				<div className="mt-8 text-center text-sm text-slate-500">
					<p>Market data refreshed at {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
					<p className="mt-1">Stay informed with real-time insights and make smarter investment decisions</p>
				</div>
			</div>
		</div>
	);
}

export default Portfolio;