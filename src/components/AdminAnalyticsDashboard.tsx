import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  Eye,
  Percent,
  Smartphone,
  Globe,
  Share2,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Order, Product } from '../types';
import { computeRealtimeAnalytics, DailySalesMetric } from '../services/analytics';

interface AdminAnalyticsDashboardProps {
  orders: Order[];
  products: Product[];
  onRefreshOrders: () => void;
  formatCurrency: (amount: number) => string;
  onEditProduct?: (product: Product) => void;
}

export const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({
  orders,
  products,
  onRefreshOrders,
  formatCurrency,
  onEditProduct,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'today'>('7d');
  const [activeChartMetric, setActiveChartMetric] = useState<'both' | 'revenue' | 'orders'>('both');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLiveAutoRefresh, setIsLiveAutoRefresh] = useState(true);

  // Compute live analytics based on real orders, products catalog and visitor trends
  const analytics = useMemo(() => {
    return computeRealtimeAnalytics(orders, products, timeRange);
  }, [orders, products, timeRange, lastUpdated]);

  // Periodic live pulse simulation (every 20s if enabled)
  useEffect(() => {
    if (!isLiveAutoRefresh) return;
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 20000);
    return () => clearInterval(interval);
  }, [isLiveAutoRefresh]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefreshOrders();
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  // Custom Tooltip for Revenue / Sales Chart
  const CustomSalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[170px]">
          <p className="font-extrabold text-slate-300 border-b border-slate-700/80 pb-1">
            {timeRange === 'today' ? `Time: ${data.hour}` : data.displayDate || label}
          </p>
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span>Sales Revenue:</span>
            <span>{formatCurrency(data.revenue || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-blue-300">
            <span>Orders Placed:</span>
            <span className="font-bold">{data.orders || 0} orders</span>
          </div>
          {data.visitors !== undefined && (
            <div className="flex items-center justify-between text-amber-300">
              <span>Visitors:</span>
              <span className="font-bold">{data.visitors} sessions</span>
            </div>
          )}
          {data.aov > 0 && (
            <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <span>Avg Order Value:</span>
              <span>{formatCurrency(data.aov)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Traffic / Conversion Chart
  const CustomTrafficTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[170px]">
          <p className="font-extrabold text-slate-300 border-b border-slate-700/80 pb-1">
            {data.displayDate || label}
          </p>
          <div className="flex items-center justify-between text-indigo-300 font-bold">
            <span>Unique Visitors:</span>
            <span>{data.visitors}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Page Views:</span>
            <span>{data.pageViews}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
            <span>Conversion Rate:</span>
            <span>{data.conversionRate}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartData: DailySalesMetric[] = timeRange === 'today' ? analytics.hourlyMetrics : analytics.dailyMetrics;

  return (
    <div className="space-y-6">
      {/* 1. HEADER & REAL-TIME CONTROLS BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B2545] text-[#F58220] flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  Real-Time Store Analytics
                </h2>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualizing Pan-India daily sales, storefront traffic, visitor conversions & product velocity.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Visitor Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{analytics.summary.activeLiveVisitors} Active Online Now</span>
          </div>

          {/* Time Range Selector */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-bold text-slate-600">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 'today'
                  ? 'bg-white text-[#0B2545] shadow-xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === '7d'
                  ? 'bg-white text-[#0B2545] shadow-xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === '14d'
                  ? 'bg-white text-[#0B2545] shadow-xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === '30d'
                  ? 'bg-white text-[#0B2545] shadow-xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. CORE KPI PERFORMANCE CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Period Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
              ₹
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(analytics.summary.totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Avg Order Value:</span>
            <span className="text-slate-700 font-extrabold">
              {formatCurrency(analytics.summary.aov)}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {analytics.summary.totalOrders}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
            <span>Store Conversion:</span>
            <span className="text-slate-700 font-extrabold">
              {analytics.summary.conversionRate}%
            </span>
          </div>
        </div>

        {/* Visitors */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Store Visitors</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {analytics.summary.totalVisitors.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600">
            <Eye className="w-3.5 h-3.5" />
            <span>{analytics.summary.totalPageViews.toLocaleString('en-IN')} Page Views</span>
          </div>
        </div>

        {/* Live Active Customers */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Today's Activity</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#F58220] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {analytics.summary.todayVisitors} <span className="text-xs text-slate-400 font-normal">visits</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F58220]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{analytics.summary.activeLiveVisitors} browsing right now</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN SALES & ORDERS VISUALIZATION (RECHARTS AREA & BAR) */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Daily Sales & Order Velocity</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                ₹ INR
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive timeline of gross orders, net revenue, and average cart size across India.
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveChartMetric('both')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeChartMetric === 'both'
                  ? 'bg-[#0B2545] text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Revenue & Orders
            </button>
            <button
              onClick={() => setActiveChartMetric('revenue')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeChartMetric === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Revenue Only
            </button>
            <button
              onClick={() => setActiveChartMetric('orders')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeChartMetric === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Orders Only
            </button>
          </div>
        </div>

        {/* Recharts Area / Bar Chart Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey={timeRange === 'today' ? 'hour' : 'displayDate'}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />
              {activeChartMetric !== 'revenue' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#3B82F6' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
              )}
              <Tooltip content={<CustomSalesTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px', fontWeight: 600 }}
              />

              {activeChartMetric !== 'orders' && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Sales Revenue (₹)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              )}

              {activeChartMetric !== 'revenue' && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Order Count"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. TWO-COLUMN SPLIT: VISITOR TRAFFIC & TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visitor Counts & Conversion Trend (7 Cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Visitor Traffic & Conversion Funnel</span>
              </h3>
              <p className="text-xs text-slate-400">
                Daily visitor count vs unique page views on SolveSpace storefront
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Avg Conv: {analytics.summary.conversionRate}%
            </span>
          </div>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey={timeRange === 'today' ? 'hour' : 'displayDate'}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTrafficTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                />
                <Bar dataKey="visitors" name="Store Visitors" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pageViews" name="Page Views" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Source & Device Breakdown Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Traffic Channels */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Traffic Acquisition Channels
              </span>
              <div className="space-y-1.5">
                {analytics.trafficSources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 truncate max-w-[150px]">{source.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{source.percentage}%</span>
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${source.percentage}%`, backgroundColor: source.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Mix */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                Device Platform Mix
              </span>
              <div className="space-y-1.5">
                {analytics.deviceBreakdown.map((dev) => (
                  <div key={dev.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{dev.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{dev.percentage}%</span>
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${dev.percentage}%`, backgroundColor: dev.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Top-Performing Products Breakdown (5 Cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#F58220]" />
                  <span>Top-Performing Products</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ranked by revenue contribution & units dispatched
                </p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                {analytics.topProducts.length} items
              </span>
            </div>

            {/* Mini Horizontal Bar Chart for Top 4 Products */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={analytics.topProducts.slice(0, 4)}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickFormatter={(val) => `₹${val}`}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={90}
                    tick={{ fontSize: 10, fill: '#0B2545', fontWeight: 600 }}
                    tickFormatter={(title) => (title.length > 14 ? `${title.slice(0, 14)}…` : title)}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue Generated']}
                    contentStyle={{ backgroundColor: '#0B2545', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="revenue" fill="#F58220" radius={[0, 4, 4, 0]}>
                    {analytics.topProducts.slice(0, 4).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#F58220' : index === 1 ? '#0B2545' : '#3B82F6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Product Performance List */}
            <div className="space-y-2.5 pt-3">
              {analytics.topProducts.slice(0, 3).map((item, idx) => {
                const catalogMatch = products.find((p) => p.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{item.unitsSold} sold</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {catalogMatch && onEditProduct && (
                      <button
                        onClick={() => onEditProduct(catalogMatch)}
                        className="p-1.5 text-slate-400 hover:text-[#0B2545] hover:bg-white rounded-lg transition-all shrink-0 cursor-pointer"
                        title="Edit in Shopify Studio"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Real-time inventory syncing enabled</span>
            <span className="font-bold text-slate-700">SolveSpace Catalog</span>
          </div>
        </div>
      </div>
    </div>
  );
};
