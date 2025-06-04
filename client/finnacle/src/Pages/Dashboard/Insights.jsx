import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar , Sector} from 'recharts';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/ApiPaths';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Settings, Target, Sliders } from 'lucide-react';

function Insights() {
	const [forecastMonths, setForecastMonths] = useState(3);
	const [smoothing, setSmoothing] = useState(0.3);
	const [financialData, setFinancialData] = useState([]);
	const [forecastData, setForecastData] = useState([]);
	const [financialSummary, setFinancialSummary] = useState({
		totalBalance: 0,
		totalIncome: 0,
		totalExpenses: 0
	});
	const [adviceList, setAdviceList] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [financialAnalysis, setFinancialAnalysis] = useState({
		savingsRate: 0,
		expenseBreakdown: {},
		incomeBreakdown: {},
		highestExpenseCategory: '',
		liquidityRatio: 0,
		diversificationScore: 0,
		monthlyBudget: 0
	});
	const [rawData, setRawData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState('forecast');

	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axiosInstance.get(API_PATHS.DASHBOARD);
				setRawData(response.data);
			} catch (err) {
				setError(err.response?.data?.message || "Error fetching dashboard data");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Parse the financial data
	const parseFinancialData = (data) => {
		if (!data) return [];

		// Group income transactions by date
		const incomeByDate = {};
		if (data.last60DaysIncome && data.last60DaysIncome.transactions) {
			data.last60DaysIncome.transactions.forEach(trans => {
				const date = new Date(trans.date);
				const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

				if (!incomeByDate[monthYear]) {
					incomeByDate[monthYear] = 0;
				}
				incomeByDate[monthYear] += trans.amount;
			});
		}

		// Group expense transactions by date
		const expensesByDate = {};
		if (data.last30DaysExpenses && data.last30DaysExpenses.transactions) {
			data.last30DaysExpenses.transactions.forEach(trans => {
				const date = new Date(trans.date);
				const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

				if (!expensesByDate[monthYear]) {
					expensesByDate[monthYear] = 0;
				}
				expensesByDate[monthYear] += trans.amount;
			});
		}

		// Combine into a single timeline
		const allMonths = new Set([...Object.keys(incomeByDate), ...Object.keys(expensesByDate)]);
		const sortedMonths = Array.from(allMonths).sort();

		const chartData = sortedMonths.map(month => ({
			month,
			income: incomeByDate[month] || 0,
			expenses: expensesByDate[month] || 0,
			balance: (incomeByDate[month] || 0) - (expensesByDate[month] || 0)
		}));

		return chartData;
	};

	const generateForecast = (data, months) => {
		if (!data || data.length === 0) return [];

		const historicalData = [...data];
		const result = [...historicalData];

		// Get the last available month
		const lastMonth = historicalData[historicalData.length - 1].month;
		const [lastYear, lastMonthNum] = lastMonth.split('-').map(n => parseInt(n, 10));

		// Simple exponential smoothing for forecasting
		const forecastIncome = (historicalData) => {
			// Use available income data for forecasting
			const incomeValues = historicalData.map(item => item.income).filter(val => val > 0);
			if (incomeValues.length === 0) return 0;

			// Calculate weighted average with exponential smoothing
			let forecast = incomeValues[incomeValues.length - 1];
			for (let i = incomeValues.length - 2; i >= 0; i--) {
				const weight = Math.pow(1 - smoothing, incomeValues.length - 1 - i);
				forecast = forecast * (1 - weight) + incomeValues[i] * weight;
			}
			return Math.round(forecast);
		};

		const forecastExpenses = (historicalData) => {
			// Use available expense data for forecasting
			const expenseValues = historicalData.map(item => item.expenses).filter(val => val > 0);
			if (expenseValues.length === 0) return 0;

			// Calculate weighted average with exponential smoothing
			let forecast = expenseValues[expenseValues.length - 1];
			for (let i = expenseValues.length - 2; i >= 0; i--) {
				const weight = Math.pow(1 - smoothing, expenseValues.length - 1 - i);
				forecast = forecast * (1 - weight) + expenseValues[i] * weight;
			}
			return Math.round(forecast);
		};

		// Generate forecast data for future months
		for (let i = 1; i <= months; i++) {
			let nextMonthNum = (lastMonthNum + i) % 12;
			if (nextMonthNum === 0) nextMonthNum = 12;
			const nextYear = lastYear + Math.floor((lastMonthNum + i - 1) / 12);
			const nextMonth = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}`;

			const forecastedIncome = forecastIncome(historicalData);
			const forecastedExpenses = forecastExpenses(historicalData);

			const newDataPoint = {
				month: nextMonth,
				income: forecastedIncome,
				expenses: forecastedExpenses,
				balance: forecastedIncome - forecastedExpenses,
				isForecast: true
			};

			result.push(newDataPoint);
			historicalData.push(newDataPoint); // Add to historical for next forecast calculation
		}

		return result;
	};

	// Format month for display
	const formatMonth = (month) => {
		if (!month) return '';
		const [year, monthNum] = month.split('-');
		const date = new Date(parseInt(year), parseInt(monthNum) - 1);
		return date.toLocaleString('default', { month: 'short', year: 'numeric' });
	};

	// Format currency for tooltip
	const formatCurrency = (value) => {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	};

	useEffect(() => {
		if (!rawData) return;

		// Load the financial data and set up the summary
		setFinancialSummary({
			totalBalance: rawData.totalBalance || 0,
			totalIncome: rawData.totalIncome || 0,
			totalExpenses: rawData.totalExpenses || 0
		});

		const data = parseFinancialData(rawData);
		setFinancialData(data);
		setForecastData(generateForecast(data, forecastMonths));

		// Analyze financial data after setting up the data
		const analysis = analyzeFinancialData();
		setFinancialAnalysis(analysis);
		setAdviceList(generateAdvice(analysis));
	}, [rawData, forecastMonths, smoothing]);

	// Custom tooltip component
	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
					<p className="font-bold">{formatMonth(label)}{data.isForecast ? " (Forecast)" : ""}</p>
					<p className="text-emerald-600 flex items-center">
						<TrendingUp className="mr-1 h-4 w-4" /> Income: {formatCurrency(data.income)}
					</p>
					<p className="text-rose-600 flex items-center">
						<TrendingDown className="mr-1 h-4 w-4" /> Expenses: {formatCurrency(data.expenses)}
					</p>
					<p className={`font-bold flex items-center ${data.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
						<DollarSign className="mr-1 h-4 w-4" /> Balance: {formatCurrency(data.balance)}
					</p>
				</div>
			);
		}
		return null;
	};

	// Analyze financial data and generate advice
	const analyzeFinancialData = () => {
		if (!rawData) return {
			savingsRate: 0,
			expenseBreakdown: {},
			incomeBreakdown: {},
			highestExpenseCategory: '',
			liquidityRatio: 0,
			diversificationScore: 0,
			monthlyBudget: 0
		};

		const totalIncome = rawData.totalIncome || 0;
		const totalExpenses = rawData.totalExpenses || 0;

		const analysis = {
			savingsRate: totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0,
			expenseBreakdown: {},
			incomeBreakdown: {},
			highestExpenseCategory: '',
			liquidityRatio: totalExpenses > 0 ? (rawData.totalBalance || 0) / totalExpenses : 0,
			diversificationScore: 0,
			monthlyBudget: totalIncome / 2, // Simplified monthly budget
		};

		// Calculate expense breakdown by category
		if (rawData.last30DaysExpenses && rawData.last30DaysExpenses.transactions) {
			rawData.last30DaysExpenses.transactions.forEach(transaction => {
				const category = transaction.category.toLowerCase();
				if (!analysis.expenseBreakdown[category]) {
					analysis.expenseBreakdown[category] = 0;
				}
				analysis.expenseBreakdown[category] += transaction.amount;
			});
		}

		// Find highest expense category
		let maxExpense = 0;
		Object.entries(analysis.expenseBreakdown).forEach(([category, amount]) => {
			if (amount > maxExpense) {
				maxExpense = amount;
				analysis.highestExpenseCategory = category;
			}
		});

		// Calculate income breakdown by source
		if (rawData.last60DaysIncome && rawData.last60DaysIncome.transactions) {
			rawData.last60DaysIncome.transactions.forEach(transaction => {
				const source = transaction.source.toLowerCase();
				if (!analysis.incomeBreakdown[source]) {
					analysis.incomeBreakdown[source] = 0;
				}
				analysis.incomeBreakdown[source] += transaction.amount;
			});
		}

		// Calculate diversification score (higher is better)
		const incomeSources = Object.keys(analysis.incomeBreakdown).length;
		analysis.diversificationScore = Math.min(incomeSources / 3, 1);

		return analysis;
	};

	// Generate advice based on analysis
	const generateAdvice = (analysis) => {
		if (!rawData || !analysis) return [];

		const advice = [];

		// Savings rate advice
		if (analysis.savingsRate >= 0.5) {
			advice.push({
				category: 'savings',
				title: 'Excellent Savings Rate',
				description: `You're saving ${Math.round(analysis.savingsRate * 100)}% of your income. Consider investing some of your savings for long-term growth.`,
				impact: 'high',
				action: 'Allocate up to 30% of your savings to diversified investments like index funds.'
			});
		} else if (analysis.savingsRate >= 0.2) {
			advice.push({
				category: 'savings',
				title: 'Good Savings Rate',
				description: `You're saving ${Math.round(analysis.savingsRate * 100)}% of your income, which is healthy. Try to maintain or increase this rate.`,
				impact: 'medium',
				action: 'Consider automating your savings to maintain consistency.'
			});
		} else if (analysis.savingsRate >= 0) {
			advice.push({
				category: 'savings',
				title: 'Low Savings Rate',
				description: `Your savings rate is only ${Math.round(analysis.savingsRate * 100)}%. Look for opportunities to increase income or reduce expenses.`,
				impact: 'high',
				action: 'Identify non-essential expenses you can reduce to boost your savings rate.'
			});
		} else {
			advice.push({
				category: 'savings',
				title: 'Negative Savings Rate',
				description: "You're spending more than you earn, which is not sustainable in the long term.",
				impact: 'critical',
				action: 'Create a budget immediately and identify expenses to cut until your income exceeds expenses.'
			});
		}

		// Budget advice
		const transportationExpense = analysis.expenseBreakdown['transportation'] || 0;
		if (transportationExpense > (rawData.totalIncome || 0) * 0.15) {
			advice.push({
				category: 'budgeting',
				title: 'High Transportation Costs',
				description: `Your transportation expenses (${formatCurrency(transportationExpense)}) make up ${Math.round((transportationExpense / (rawData.totalExpenses || 1)) * 100)}% of your total expenses.`,
				impact: 'medium',
				action: 'Consider more economical transportation options or carpooling to reduce costs.'
			});
		}

		const foodExpense = (analysis.expenseBreakdown['food'] || 0) + (analysis.expenseBreakdown['groceries'] || 0);
		if (foodExpense > (rawData.totalIncome || 0) * 0.2) {
			advice.push({
				category: 'budgeting',
				title: 'High Food Expenses',
				description: `Your food-related expenses (${formatCurrency(foodExpense)}) are higher than recommended.`,
				impact: 'medium',
				action: 'Try meal planning and cooking at home more often to reduce food costs.'
			});
		}

		// Income diversification advice
		if (analysis.diversificationScore < 0.5) {
			advice.push({
				category: 'income',
				title: 'Income Diversification Opportunity',
				description: 'Your income sources are somewhat limited, which increases financial risk.',
				impact: 'medium',
				action: 'Consider developing additional income streams like freelancing, investments, or side projects.'
			});
		} else {
			advice.push({
				category: 'income',
				title: 'Well-Diversified Income',
				description: 'You have multiple income sources, which provides good financial stability.',
				impact: 'positive',
				action: 'Continue maintaining diverse income streams for financial resilience.'
			});
		}

		// Emergency fund advice
		if (analysis.liquidityRatio < 3) {
			advice.push({
				category: 'emergency',
				title: 'Build Emergency Fund',
				description: `Your current balance covers only ${Math.round(analysis.liquidityRatio)} months of expenses.`,
				impact: 'high',
				action: 'Work toward building an emergency fund that covers 3-6 months of expenses.'
			});
		} else if (analysis.liquidityRatio >= 3 && analysis.liquidityRatio < 6) {
			advice.push({
				category: 'emergency',
				title: 'Healthy Emergency Fund',
				description: `Your emergency fund covers ${Math.round(analysis.liquidityRatio)} months of expenses, which is good.`,
				impact: 'positive',
				action: 'Consider investing additional savings beyond your emergency fund.'
			});
		} else {
			advice.push({
				category: 'emergency',
				title: 'Large Cash Reserves',
				description: `Your cash reserves cover ${Math.round(analysis.liquidityRatio)} months of expenses, which might be more than necessary.`,
				impact: 'medium',
				action: 'Consider investing some of your cash reserves for better long-term returns.'
			});
		}

		// Investment advice based on total balance
		if ((rawData.totalBalance || 0) > 10000) {
			advice.push({
				category: 'investment',
				title: 'Investment Opportunity',
				description: 'You have sufficient funds to consider investing for long-term growth.',
				impact: 'medium',
				action: 'Consider consulting with a financial advisor about investing options suited to your goals.'
			});
		}

		return advice;
	};

	// Get categories for filter
	const adviceCategories = ['all', ...new Set(adviceList.map(advice => advice.category))];

	// Filter advice based on selected category
	const filteredAdvice = selectedCategory === 'all'
		? adviceList
		: adviceList.filter(advice => advice.category === selectedCategory);

	// Get appropriate icon for advice impact
	const getImpactIcon = (impact) => {
		switch (impact) {
			case 'critical':
				return <AlertTriangle className="text-red-600 w-6 h-6" />;
			case 'high':
				return <Target className="text-orange-500 w-6 h-6" />;
			case 'medium':
				return <Settings className="text-yellow-500 w-6 h-6" />;
			case 'positive':
				return <CheckCircle className="text-green-500 w-6 h-6" />;
			default:
				return <Sliders className="text-blue-500 w-6 h-6" />;
		}
	};

	// Prepare expense breakdown data for charts
	const prepareExpenseData = () => {
		if (!financialAnalysis || !financialAnalysis.expenseBreakdown) return [];

		return Object.entries(financialAnalysis.expenseBreakdown).map(([category, amount], index) => ({
			name: category.charAt(0).toUpperCase() + category.slice(1),
			value: amount,
			color: COLORS[index % COLORS.length]
		}));
	};

	// Prepare income breakdown data for charts
	const prepareIncomeData = () => {
		if (!financialAnalysis || !financialAnalysis.incomeBreakdown) return [];

		return Object.entries(financialAnalysis.incomeBreakdown).map(([source, amount], index) => ({
			name: source.charAt(0).toUpperCase() + source.slice(1),
			value: amount,
			color: COLORS[index % COLORS.length]
		}));
	};

	const renderActiveShape = (props) => {
		const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

		return (
			<g>
				<text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#888" className="text-sm">
					{payload.name}
				</text>
				<text x={cx} y={cy} textAnchor="middle" fill="#333" className="text-lg font-semibold">
					{formatCurrency(value)}
				</text>
				<text x={cx} y={cy} dy={20} textAnchor="middle" fill="#999" className="text-xs">
					{`${(percent * 100).toFixed(1)}%`}
				</text>
				<Sector
					cx={cx}
					cy={cy}
					innerRadius={innerRadius}
					outerRadius={outerRadius}
					startAngle={startAngle}
					endAngle={endAngle}
					fill={fill}
				/>
			</g>
		);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="text-center p-8 max-w-md mx-auto">
					<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<h3 className="text-xl font-semibold text-gray-700">Loading your financial data...</h3>
					<p className="text-gray-500 mt-2">Please wait while we prepare your insights</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
						<AlertTriangle className="h-6 w-6 text-red-600" />
					</div>
					<h3 className="text-xl font-semibold text-center text-gray-800 mb-2">Error Loading Data</h3>
					<p className="text-gray-600 text-center mb-4">{error}</p>
					<button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
						Try Again
					</button>
				</div>
			</div>
		);
	}

	const expenseData = prepareExpenseData();
	const incomeData = prepareIncomeData();

	return (
		<div className="bg-slate-50 p-6 mt-16">
			{/* Chart Header and Controls */}
			<div className="flex flex-wrap justify-between items-center mb-4">
				<h2 className="text-2xl font-bold text-gray-800">Financial Insights</h2>
				<div className="flex items-center space-x-4">
					<div className="flex items-center">
						<label htmlFor="forecastMonths" className="mr-2 text-sm text-gray-600">Forecast Months:</label>
						<select
							id="forecastMonths"
							value={forecastMonths}
							onChange={(e) => setForecastMonths(parseInt(e.target.value))}
							className="border rounded p-1 text-sm"
						>
							{[1, 2, 3, 6, 12].map(m => (
								<option key={m} value={m}>{m}</option>
							))}
						</select>
					</div>
					<div className="flex items-center">
						<label htmlFor="smoothing" className="mr-2 text-sm text-gray-600">Smoothing:</label>
						<select
							id="smoothing"
							value={smoothing}
							onChange={(e) => setSmoothing(parseFloat(e.target.value))}
							className="border rounded p-1 text-sm"
						>
							{[0.1, 0.2, 0.3, 0.4, 0.5].map(s => (
								<option key={s} value={s}>{s}</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="mb-6 border-b border-gray-200">
				<nav className="flex">
					<button
						onClick={() => setActiveTab('forecast')}
						className={`py-2 px-4 ${activeTab === 'forecast'
							? 'border-b-2 border-blue-500 text-blue-600'
							: 'text-gray-500 hover:text-gray-700'}`}
					>
						Financial Forecast
					</button>
					<button
						onClick={() => setActiveTab('breakdown')}
						className={`py-2 px-4 ${activeTab === 'breakdown'
							? 'border-b-2 border-blue-500 text-blue-600'
							: 'text-gray-500 hover:text-gray-700'}`}
					>
						Income & Expenses
					</button>
					<button
						onClick={() => setActiveTab('advice')}
						className={`py-2 px-4 ${activeTab === 'advice'
							? 'border-b-2 border-blue-500 text-blue-600'
							: 'text-gray-500 hover:text-gray-700'}`}
					>
						Financial Advice
					</button>
				</nav>
			</div>

			{/* Content based on active tab */}
			{activeTab === 'forecast' && (
				<>
					<div className="bg-white rounded-lg p-4 mb-6">
						<div className="h-80 w-full">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={forecastData}
									margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis
										dataKey="month"
										tickFormatter={formatMonth}
										tick={{ fontSize: 12 }}
									/>
									<YAxis
										tickFormatter={(value) => formatCurrency(value)}
										tick={{ fontSize: 12 }}
									/>
									<Tooltip content={<CustomTooltip />} />
									<Legend />
									<defs>
										<linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
										</linearGradient>
										<linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
										</linearGradient>
										<linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
										</linearGradient>
									</defs>
									<Area
										type="monotone"
										dataKey="income"
										name="Income"
										stroke="#10B981"
										fillOpacity={1}
										fill="url(#colorIncome)"
										strokeWidth={2}
										activeDot={{ r: 6 }}
									/>
									<Area
										type="monotone"
										dataKey="expenses"
										name="Expenses"
										stroke="#EF4444"
										fillOpacity={1}
										fill="url(#colorExpenses)"
										strokeWidth={2}
										activeDot={{ r: 6 }}
									/>
									<Area
										type="monotone"
										dataKey="balance"
										name="Balance"
										stroke="#3B82F6"
										fillOpacity={1}
										fill="url(#colorBalance)"
										strokeWidth={2}
										activeDot={{ r: 6 }}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Statistics and Insights Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						<div className="bg-white rounded-lg p-6 shadow-md">
							<h3 className="text-lg font-semibold mb-3 text-gray-800">Trend Analysis</h3>
							<div className="flex items-center mb-2">
								<div className={`rounded-full h-10 w-10 flex items-center justify-center mr-3 ${forecastData[forecastData.length - 1]?.balance > 0
										? 'bg-green-100 text-green-600'
										: 'bg-red-100 text-red-600'
									}`}>
									{forecastData[forecastData.length - 1]?.balance > 0 ? (
										<TrendingUp className="h-5 w-5" />
									) : (
										<TrendingDown className="h-5 w-5" />
									)}
								</div>
								<div>
									<p className="text-sm text-gray-500">Projected Balance (End of Period)</p>
									<p className={`text-xl font-bold ${forecastData[forecastData.length - 1]?.balance > 0
											? 'text-green-600'
											: 'text-red-600'
										}`}>
										{formatCurrency(forecastData[forecastData.length - 1]?.balance || 0)}
									</p>
								</div>
							</div>
							<p className="text-sm text-gray-600 mt-4">
								Based on your current financial patterns, the forecast predicts a
								{forecastData[forecastData.length - 1]?.balance > forecastData[0]?.balance
									? ' positive trend with increasing balance.'
									: ' concerning trend with decreasing balance.'
								}
							</p>
						</div>

						<div className="bg-white rounded-lg p-6 shadow-md">
							<h3 className="text-lg font-semibold mb-3 text-gray-800">Key Metrics</h3>
							<div className="space-y-4">
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm text-gray-500">Average Monthly Income</span>
										<span className="text-sm font-medium text-gray-700">
											{formatCurrency(
												forecastData.reduce((sum, item) => sum + item.income, 0) / forecastData.length
											)}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-green-500 h-2 rounded-full"
											style={{ width: '100%' }}
										></div>
									</div>
								</div>

								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm text-gray-500">Average Monthly Expenses</span>
										<span className="text-sm font-medium text-gray-700">
											{formatCurrency(
												forecastData.reduce((sum, item) => sum + item.expenses, 0) / forecastData.length
											)}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-red-500 h-2 rounded-full"
											style={{
												width: `${(forecastData.reduce((sum, item) => sum + item.expenses, 0) /
													forecastData.length) /
													(forecastData.reduce((sum, item) => sum + item.income, 0) /
														forecastData.length) * 100}%`
											}}
										></div>
									</div>
								</div>

								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm text-gray-500">Savings Rate</span>
										<span className="text-sm font-medium text-gray-700">
											{Math.round(
												(1 - forecastData.reduce((sum, item) => sum + item.expenses, 0) /
													forecastData.reduce((sum, item) => sum + item.income, 0)) * 100
											)}%
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-blue-500 h-2 rounded-full"
											style={{
												width: `${(1 - forecastData.reduce((sum, item) => sum + item.expenses, 0) /
													forecastData.reduce((sum, item) => sum + item.income, 0)) * 100}%`
											}}
										></div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Recommendations based on forecast */}
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
						<h3 className="text-lg font-semibold mb-4 text-indigo-800">Forecast Insights</h3>

						<div className="space-y-4">
							{forecastData[forecastData.length - 1]?.balance < 0 ? (
								<div className="flex">
									<div className="flex-shrink-0">
										<AlertTriangle className="h-5 w-5 text-orange-500" />
									</div>
									<div className="ml-3">
										<p className="text-sm text-gray-700">
											<span className="font-medium text-orange-700">Warning:</span> Your forecast shows a negative balance by the end of the period. Consider reducing non-essential expenses.
										</p>
									</div>
								</div>
							) : forecastData[forecastData.length - 1]?.expenses > forecastData[forecastData.length - 1]?.income ? (
								<div className="flex">
									<div className="flex-shrink-0">
										<AlertTriangle className="h-5 w-5 text-yellow-500" />
									</div>
									<div className="ml-3">
										<p className="text-sm text-gray-700">
											<span className="font-medium text-yellow-700">Caution:</span> Your expenses are projected to exceed income in the future. Monitor your spending closely.
										</p>
									</div>
								</div>
							) : (
								<div className="flex">
									<div className="flex-shrink-0">
										<CheckCircle className="h-5 w-5 text-green-500" />
									</div>
									<div className="ml-3">
										<p className="text-sm text-gray-700">
											<span className="font-medium text-green-700">Looking good!</span> Your financial trajectory shows a positive balance with income exceeding expenses.
										</p>
									</div>
								</div>
							)}

							<div className="flex">
								<div className="flex-shrink-0">
									<Target className="h-5 w-5 text-indigo-500" />
								</div>
								<div className="ml-3">
									<p className="text-sm text-gray-700">
										Based on your forecast, consider saving {formatCurrency(
											Math.max(0, forecastData.reduce((sum, item) => sum + (item.income - item.expenses), 0) / forecastData.length * 0.5)
										)} monthly for your emergency fund or long-term investments.
									</p>
								</div>
							</div>

							<div className="flex">
								<div className="flex-shrink-0">
									<Settings className="h-5 w-5 text-indigo-500" />
								</div>
								<div className="ml-3">
									<p className="text-sm text-gray-700">
										Adjust the forecast parameters above to see how different scenarios might affect your financial future.
									</p>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			{activeTab === 'breakdown' && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Expense Breakdown Chart */}
					<div className="bg-white rounded-lg p-4 shadow-md">
						<h3 className="text-lg font-semibold mb-4 text-center">Expense Breakdown</h3>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={expenseData}
										cx="50%"
										cy="50%"
										labelLine={false}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
										startAngle={90}
										endAngle={-270}
										activeShape={renderActiveShape}
										activeIndex={0}
									>
										{expenseData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip formatter={(value) => formatCurrency(value)} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Income Breakdown Chart */}
					<div className="bg-white rounded-lg p-4 shadow-md">
						<h3 className="text-lg font-semibold mb-4 text-center">Income Sources</h3>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={incomeData}
										cx="50%"
										cy="50%"
										labelLine={false}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
										startAngle={90}
										endAngle={-270}
										activeShape={renderActiveShape}
										activeIndex={0}
									>
										{incomeData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip formatter={(value) => formatCurrency(value)} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Monthly Expense Categories */}
					<div className="bg-white rounded-lg p-4 shadow-md">
						<h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={expenseData} layout="vertical">
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
									<YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
									<Tooltip formatter={(value) => formatCurrency(value)} />
									<Bar dataKey="value" fill="#8884d8">
										{expenseData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Financial Health Summary */}
					<div className="bg-gray-100 p-6 rounded-lg shadow-md">
						<h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Health Summary</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-white p-4 rounded shadow">
								<div className="text-sm text-gray-500">Savings Rate</div>
								<div className="text-xl font-bold">
									{financialAnalysis && `${Math.round(financialAnalysis.savingsRate * 100)}%`}
								</div>
							</div>
							<div className="bg-white p-4 rounded shadow">
								<div className="text-sm text-gray-500">Emergency Fund</div>
								<div className="text-xl font-bold">
									{financialAnalysis && `${Math.round(financialAnalysis.liquidityRatio)} months`}
								</div>
							</div>
							<div className="bg-white p-4 rounded shadow">
								<div className="text-sm text-gray-500">Income Sources</div>
								<div className="text-xl font-bold">
									{financialAnalysis && Object.keys(financialAnalysis.incomeBreakdown).length}
								</div>
							</div>
							<div className="bg-white p-4 rounded shadow">
								<div className="text-sm text-gray-500">Highest Expense</div>
								<div className="text-xl font-bold capitalize">
									{financialAnalysis && financialAnalysis.highestExpenseCategory}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{activeTab === 'advice' && (
				<div className="max-w-full">
					<div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-lg shadow-lg">
						<h2 className="text-2xl font-bold text-white mb-2">Financial Advisor</h2>
						<p className="text-blue-100">Personalized recommendations based on your financial activity</p>
					</div>

					{/* Filter Categories */}
					<div className="bg-gray-100 p-4 border-b border-gray-200">
						<div className="flex items-center space-x-2 overflow-x-auto pb-2">
							<span className="text-sm text-gray-500 whitespace-nowrap">Filter advice by:</span>
							{adviceCategories.map(category => (
								<button
									key={category}
									onClick={() => setSelectedCategory(category)}
									className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedCategory === category
											? 'bg-blue-600 text-white'
											: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
										}`}
								>
									{category.charAt(0).toUpperCase() + category.slice(1)}
								</button>
							))}
						</div>
					</div>

					{/* Advice Cards */}
					<div className="bg-white divide-y divide-gray-200">
						{filteredAdvice.length > 0 ? (
							filteredAdvice.map((advice, index) => (
								<div key={index} className="p-6 hover:bg-blue-50 transition duration-150">
									<div className="flex items-start">
										<div className="mr-4 mt-1">
											{getImpactIcon(advice.impact)}
										</div>
										<div className="flex-1">
											<h3 className="text-lg font-semibold text-gray-800 mb-1">{advice.title}</h3>
											<p className="text-gray-600 mb-3">{advice.description}</p>
											<div className="bg-blue-50 border-l-4 border-blue-500 p-3">
												<p className="text-sm font-medium text-blue-800">
													<span className="mr-2">💡</span>
													Recommended Action:
												</p>
												<p className="text-blue-700 ml-6">{advice.action}</p>
											</div>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="p-6 text-center text-gray-500">
								No advice available for the selected category
							</div>
						)}
					</div>
				</div>
			)}

			<div className="mt-6 text-sm text-gray-500">
				<p>* Forecast uses exponential smoothing based on your historical data.</p>
				<p>* Adjust the forecast months and smoothing factor to see different projections.</p>
			</div>
		</div>
	);
}
export default Insights;	