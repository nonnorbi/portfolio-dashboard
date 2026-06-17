import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Minimalista Portfolio Dashboard
 * 
 * Design Philosophy:
 * - Clean, information-focused layout
 * - Two-level navigation: Overview → Detailed Reports
 * - Teal (#0D9488) as primary accent color
 * - Only essential KPIs on main view
 * - Detailed data in separate Reports section
 */

interface PortfolioData {
  portfolio: {
    etf: { total_eur: number; percentage: number };
    bonds: { total_eur: number; percentage: number };
    fundamenta: { total_eur: number; percentage: number };
    total_eur: number;
  };
  goals: {
    primary: { target_eur: number; year: number; description: string };
    milestones: Array<{ target_eur: number; year: number; description: string }>;
  };
  summary: {
    current_total: number;
    primary_goal: number;
    progress_percent: number;
    next_milestone: { target: number; year: number; progress_percent: number };
  };
}

const PORTFOLIO_DATA: PortfolioData = {
  portfolio: {
    etf: { total_eur: 6176.23, percentage: 15.26 },
    bonds: { total_eur: 26848, percentage: 66.34 },
    fundamenta: { total_eur: 5967, percentage: 14.74 },
    total_eur: 40491.64,
  },
  goals: {
    primary: { target_eur: 1000000, year: 2040, description: 'DREAM' },
    milestones: [
      { target_eur: 50000, year: 2026, description: 'STAIR STEP' },
      { target_eur: 70000, year: 2027, description: 'STAIR STEP' },
      { target_eur: 85000, year: 2028, description: "LIL' GOAL" },
      { target_eur: 100000, year: 2029, description: "LIL' GOAL" },
      { target_eur: 250000, year: 2032, description: 'BIG GOAL' },
      { target_eur: 500000, year: 2036, description: 'BIG GOAL' },
      { target_eur: 800000, year: 2038, description: 'BIG GOAL' },
      { target_eur: 1000000, year: 2040, description: 'DREAM' },
    ],
  },
  summary: {
    current_total: 40491.64,
    primary_goal: 1000000,
    progress_percent: 4.05,
    next_milestone: { target: 50000, year: 2026, progress_percent: 80.98 },
  },
};

const COLORS = ['#0D9488', '#14B8A6', '#2DD4BF'];

type ViewMode = 'overview' | 'reports';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [showValues, setShowValues] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState(PORTFOLIO_DATA);

  // Load portfolio data on mount
  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      const response = await fetch('/portfolio_data.json');
      if (response.ok) {
        const data = await response.json();
        setPortfolioData(data);
        if (data.last_updated) {
          setLastUpdated(new Date(data.last_updated).toLocaleString('hu-HU'));
        }
      }
    } catch (error) {
      console.log('Using default portfolio data');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadPortfolioData();
      toast.success('Portfolio data refreshed!');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const portfolioComposition = [
    { name: 'ETF', value: portfolioData.portfolio.etf.percentage, eur: portfolioData.portfolio.etf.total_eur },
    { name: 'Bonds', value: portfolioData.portfolio.bonds.percentage, eur: portfolioData.portfolio.bonds.total_eur },
    { name: 'Fundamenta', value: portfolioData.portfolio.fundamenta.percentage, eur: portfolioData.portfolio.fundamenta.total_eur },
  ];

  const goalProgressData = portfolioData.goals.milestones.map((milestone) => ({
    year: milestone.year,
    target: milestone.target_eur,
    current: portfolioData.summary.current_total,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663766075886/j63S5MLASwfVZKxck9hmvY/dashboard-logo-Z6HoemJYnWXhnnHzFhFYMi.webp"
              alt="Portfolio Logo"
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-secondary rounded transition-colors disabled:opacity-50"
              title="Refresh data from Google Sheets"
            >
              <RefreshCw className={`w-5 h-5 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowValues(!showValues)}
              className="p-2 hover:bg-secondary rounded transition-colors"
              title={showValues ? 'Hide values' : 'Show values'}
            >
              {showValues ? <Eye className="w-5 h-5 text-muted-foreground" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
            </button>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('hu-HU')}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container py-6 border-b border-border">
        <nav className="tab-nav">
          <button
            onClick={() => setViewMode('overview')}
            className={`tab-item ${viewMode === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('reports')}
            className={`tab-item ${viewMode === 'reports' ? 'active' : ''}`}
          >
            Reports
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="container py-12">
        {viewMode === 'overview' && (
          <OverviewView data={portfolioData} portfolioComposition={portfolioComposition} showValues={showValues} />
        )}
        {viewMode === 'reports' && (
          <ReportsView data={portfolioData} goalProgressData={goalProgressData} showValues={showValues} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>Portfolio Dashboard • Data updates automatically • {new Date().getFullYear()}</p>
          {lastUpdated && <p className="text-xs mt-2">Last updated: {lastUpdated}</p>}
        </div>
      </footer>
    </div>
  );
}

interface OverviewViewProps {
  data: any;
  portfolioComposition: Array<{ name: string; value: number; eur: number }>;
  showValues: boolean;
}

function OverviewView({ data, portfolioComposition, showValues }: OverviewViewProps) {
  return (
    <div className="space-y-12">
      {/* Primary KPI */}
      <section>
        <div className="dashboard-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Current Total */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Current Total</div>
              <div className="text-4xl font-bold text-foreground">
                {showValues ? `€${data.summary.current_total.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••'}
              </div>
            </div>

            {/* Primary Goal */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Primary Goal ({data.goals.primary.year})</div>
              <div className="text-4xl font-bold text-foreground">
                {showValues ? `€${data.goals.primary.target_eur.toLocaleString('hu-HU')}` : '••••'}
              </div>
              <div className="text-sm text-accent mt-2">{data.goals.primary.description}</div>
            </div>

            {/* Progress */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Progress to Dream</div>
              <div className="text-4xl font-bold text-accent">{data.summary.progress_percent.toFixed(2)}%</div>
              <div className="w-full bg-secondary rounded mt-3 h-2">
                <div
                  className="bg-accent h-2 rounded transition-all"
                  style={{ width: `${Math.min(data.summary.progress_percent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Milestone */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Next Milestone</h3>
        <div className="dashboard-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Target</div>
              <div className="text-2xl font-bold text-foreground">
                {showValues ? `€${data.summary.next_milestone.target.toLocaleString('hu-HU')}` : '••••'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{data.summary.next_milestone.year}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-2xl font-bold text-accent">{data.summary.next_milestone.progress_percent.toFixed(1)}%</div>
              <div className="w-48 bg-secondary rounded mt-3 h-2">
                <div
                  className="bg-accent h-2 rounded transition-all"
                  style={{ width: `${Math.min(data.summary.next_milestone.progress_percent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Composition */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Portfolio Composition</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="dashboard-card p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={portfolioComposition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#0D9488"
                  dataKey="value"
                >
                  {portfolioComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Table */}
          <div className="dashboard-card p-6">
            <div className="space-y-4">
              {portfolioComposition.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-foreground font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-foreground font-semibold">
                      {showValues ? `€${item.eur.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••'}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.value.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ReportsViewProps {
  data: any;
  goalProgressData: Array<{ year: number; target: number; current: number }>;
  showValues: boolean;
}

function ReportsView({ data, goalProgressData, showValues }: ReportsViewProps) {
  return (
    <div className="space-y-12">
      {/* Goal Timeline */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Goal Timeline</h3>
        <div className="dashboard-card p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={goalProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="year" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                formatter={(value) => `€${(value as number).toLocaleString('hu-HU')}`}
              />
              <Legend />
              <Line type="monotone" dataKey="target" stroke="#0D9488" strokeWidth={2} dot={{ fill: '#0D9488' }} name="Target" />
              <Line type="monotone" dataKey="current" stroke="#14B8A6" strokeWidth={2} dot={{ fill: '#14B8A6' }} name="Current" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Milestones Table */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">All Milestones</h3>
        <div className="dashboard-card p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Year</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Target</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Progress</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.goals.milestones.map((milestone: any, idx: number) => {
                  const progress = (data.summary.current_total / milestone.target_eur) * 100;
                  const isReached = progress >= 100;

                  return (
                    <tr key={idx} className="border-b border-border hover:bg-secondary transition-colors">
                      <td className="py-3 px-4 text-foreground font-medium">{milestone.year}</td>
                      <td className="py-3 px-4 text-foreground">
                        {showValues ? `€${milestone.target_eur.toLocaleString('hu-HU')}` : '••••'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{milestone.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary rounded h-1.5">
                            <div
                              className={`h-1.5 rounded transition-all ${isReached ? 'bg-accent' : 'bg-accent'}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                          isReached
                            ? 'bg-accent/10 text-accent'
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          {isReached ? 'Reached' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Portfolio Details by Category */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Portfolio Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ETF */}
          <div className="dashboard-card p-6">
            <h4 className="font-semibold text-foreground mb-4">ETF</h4>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold text-foreground">
                  {showValues ? `€${data.portfolio.etf.total_eur.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Allocation</div>
                <div className="text-lg font-semibold text-accent">{data.portfolio.etf.percentage.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          {/* Bonds */}
          <div className="dashboard-card p-6">
            <h4 className="font-semibold text-foreground mb-4">Bonds</h4>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold text-foreground">
                  {showValues ? `€${data.portfolio.bonds.total_eur.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Allocation</div>
                <div className="text-lg font-semibold text-accent">{data.portfolio.bonds.percentage.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          {/* Fundamenta */}
          <div className="dashboard-card p-6">
            <h4 className="font-semibold text-foreground mb-4">Fundamenta</h4>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold text-foreground">
                  {showValues ? `€${data.portfolio.fundamenta.total_eur.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Allocation</div>
                <div className="text-lg font-semibold text-accent">{data.portfolio.fundamenta.percentage.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
