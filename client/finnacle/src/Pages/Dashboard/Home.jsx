import { useEffect, useState } from "react";
import axiosInstance from "../../Utils/axiosinstance";
import { API_PATHS } from "../../Utils/ApiPaths";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Coffee,
  Home as HomeIcon,
  Briefcase,
  DollarSign,
  Film,
  TrendingUp,
  ShoppingCart,
  Plane,
  Heart,
  Book,
  HelpCircle,
  CreditCard,
  Users,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronRight,
  Activity,
  Wallet,
} from "lucide-react";

const CATEGORY_ICONS = {
  food: <Coffee className="h-5 w-5" />,
  rent: <HomeIcon className="h-5 w-5" />,
  salary: <Briefcase className="h-5 w-5" />,
  freelance: <DollarSign className="h-5 w-5" />,
  capitalGain: <TrendingUp className="h-5 w-5" />,
  entertainment: <Film className="h-5 w-5" />,
  utilities: <HomeIcon className="h-5 w-5" />,
  shopping: <ShoppingCart className="h-5 w-5" />,
  travel: <Plane className="h-5 w-5" />,
  health: <Heart className="h-5 w-5" />,
  education: <Book className="h-5 w-5" />,
  other: <HelpCircle className="h-5 w-5" />,
  loan: <CreditCard className="h-5 w-5" />,
  "personal & family": <Users className="h-5 w-5" />,
};

// Modern color palette
const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F472B6", "#F59E0B", "#10B981", "#3B82F6"];
const GRADIENTS = {
  income: ["#10B981", "#A7F3D0"],
  expenses: ["#F43F5E", "#FECDD3"],
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.DASHBOARD);
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const last7Income = dashboardData.last60DaysIncome.transactions.slice(0, 7);
  const last7Expenses = dashboardData.last30DaysExpenses.transactions.slice(0, 7);

  // Calculate income and expense trends
  const incomeTrend = calculateTrend(dashboardData.last60DaysIncome.transactions);
  const expenseTrend = calculateTrend(dashboardData.last30DaysExpenses.transactions);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Top navigation bar */}
      <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Financial Dashboard</h1>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2">
              <Wallet className="h-4 w-4" /> 
              <span>Accounts</span>
            </button>
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Activity className="h-4 w-4" /> 
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Navigation tabs */}
        {/* <div className="mb-8 flex gap-2 border-b border-slate-200">
          {["overview", "income", "expenses", "insights"].map((section) => (
            <button
              key={section}
              className={`px-4 py-3 font-medium capitalize ${
                activeSection === section
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </div> */}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <SummaryCard 
            title="Current Balance" 
            value={`₹ ${formatCurrency(dashboardData.totalBalance)}`} 
            icon={<Wallet className="h-5 w-5" />}
            color="bg-gradient-to-br from-violet-500 to-purple-600"
          />
          <SummaryCard 
            title="Total Income" 
            value={`₹ ${formatCurrency(dashboardData.totalIncome)}`} 
            trend={incomeTrend}
            icon={<ArrowUp className="h-5 w-5" />}
            color="bg-gradient-to-br from-emerald-500 to-green-600"
          />
          <SummaryCard 
            title="Total Expenses" 
            value={`₹ ${formatCurrency(dashboardData.totalExpenses)}`} 
            trend={expenseTrend}
            icon={<ArrowDown className="h-5 w-5" />}
            color="bg-gradient-to-br from-rose-500 to-pink-600"
          />
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <DashboardCard title="Financial Overview" className="h-full">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...dashboardData.last60DaysIncome.transactions].reverse()}>

                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString("en-GB", {day: '2-digit', month: 'short'})} 
                      stroke="#94A3B8"
                      tick={{fontSize: 12}}
                    />
                    <YAxis 
                      stroke="#94A3B8" 
                      tick={{fontSize: 12}}
                      tickFormatter={(value) => `₹${formatCompactCurrency(value)}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹ ${formatCurrency(value)}`, "Amount"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString("en-GB", {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                      contentStyle={{
                        backgroundColor: "#FFF",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#incomeGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>

          <div>
            <DashboardCard title="Expense Distribution" className="h-full">
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.last30DaysExpenses.transactions}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={60}
                      paddingAngle={2}
                    >
                      {dashboardData.last30DaysExpenses.transactions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`₹ ${formatCurrency(value)}`, "Amount"]}
                      contentStyle={{
                        backgroundColor: "#FFF",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-sm font-medium text-slate-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <DashboardCard 
            title="Recent Income" 
            action={{ 
              label: "View All", 
              icon: <ChevronRight className="h-4 w-4" /> 
            }}
          >
            <div className="divide-y divide-slate-100">
              {last7Income.length > 0 ? (
                last7Income.map((txn) => (
                  <TransactionItem 
                    key={txn._id} 
                    transaction={txn} 
                    type="income" 
                  />
                ))
              ) : (
                <EmptyState message="No recent income transactions" />
              )}
            </div>
          </DashboardCard>

          <DashboardCard 
            title="Recent Expenses" 
            action={{ 
              label: "View All", 
              icon: <ChevronRight className="h-4 w-4" /> 
            }}
          >
            <div className="divide-y divide-slate-100">
              {last7Expenses.length > 0 ? (
                last7Expenses.map((txn) => (
                  <TransactionItem 
                    key={txn._id} 
                    transaction={txn} 
                    type="expense" 
                  />
                ))
              ) : (
                <EmptyState message="No recent expense transactions" />
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, trend, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-slate-500">{title}</h2>
          <div className={`${color} text-white p-2 rounded-lg`}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-800 mb-2">{value}</p>
        
        {trend && (
          <div className="flex items-center">
            <span className={`text-sm font-medium flex items-center ${
              trend > 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {trend > 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(trend)}% 
            </span>
            <span className="text-xs text-slate-400 ml-2">vs. last period</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardCard({ title, children, action, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {action && (
          <button className="text-sm text-indigo-600 font-medium flex items-center hover:text-indigo-800 transition-colors">
            {action.label}
            {action.icon}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function TransactionItem({ transaction, type }) {
  const { source, category, date, amount, icon } = transaction;
  const displayName = source || category || "Unnamed Transaction";
  const iconComponent = CATEGORY_ICONS[icon] || <DollarSign className="h-5 w-5" />;
  
  return (
    <div className="py-4 flex items-center justify-between group hover:bg-slate-50 rounded-lg transition-colors px-2 -mx-2 cursor-pointer">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
        }`}>
          {iconComponent}
        </div>
        <div>
          <p className="font-medium text-slate-800">{displayName}</p>
          <p className="text-xs text-slate-500">
            {new Date(date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <p className={`font-semibold ${
          type === "income" ? "text-emerald-600" : "text-rose-600"
        }`}>
          {type === "income" ? "+" : "-"}₹ {formatCurrency(amount)}
        </p>
        <ArrowRight className="h-4 w-4 text-slate-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading your financial data...</p>
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-8 text-center">
      <p className="text-slate-500">{message}</p>
    </div>
  );
}

// Utility: Format Currency nicely
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN").format(amount);
}

// Utility: Format currency in compact form (e.g., 10K, 1M)
function formatCompactCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    compactDisplay: "short",
  }).format(amount);
}

// Calculate percent trend (mock function)
function calculateTrend(transactions) {
  if (!transactions || transactions.length < 2) return null;

  const latest = transactions[0].amount;
  const previous = transactions[1].amount;

  const trend = ((latest - previous) / previous) * 100;
  return Math.round(trend);
}