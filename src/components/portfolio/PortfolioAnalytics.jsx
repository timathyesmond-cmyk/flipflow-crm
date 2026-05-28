import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const COLORS = {
  occupied: '#10b981',
  vacant: '#ef4444',
  maintenance: '#f59e0b',
  planning: '#3b82f6',
  in_progress: '#f59e0b',
  listed: '#8b5cf6',
  sold: '#10b981',
};

function fmt(n) { return n ? `$${Number(n).toLocaleString()}` : '$0'; }

export default function PortfolioAnalytics({ rentals, tenants, flips }) {
  // Occupancy breakdown
  const occupancyData = [
    { name: 'Occupied', value: rentals.filter(r => r.status === 'occupied').length, color: COLORS.occupied },
    { name: 'Vacant',   value: rentals.filter(r => r.status === 'vacant').length,   color: COLORS.vacant },
    { name: 'Maintenance', value: rentals.filter(r => r.status === 'maintenance').length, color: COLORS.maintenance },
  ].filter(d => d.value > 0);

  // Rental income per property
  const incomeData = rentals
    .filter(r => r.monthly_rent)
    .map(r => ({ name: r.address.split(',')[0], income: r.monthly_rent }))
    .slice(0, 8);

  // Flip status breakdown
  const flipStatusData = [
    { name: 'Planning',    value: flips.filter(f => f.status === 'planning').length,    color: COLORS.planning },
    { name: 'In Progress', value: flips.filter(f => f.status === 'in_progress').length, color: COLORS.in_progress },
    { name: 'Listed',      value: flips.filter(f => f.status === 'listed').length,      color: COLORS.listed },
    { name: 'Sold',        value: flips.filter(f => f.status === 'sold').length,        color: COLORS.sold },
  ].filter(d => d.value > 0);

  // Flip profit data
  const flipProfitData = flips
    .filter(f => f.actual_sale_price && f.purchase_price)
    .map(f => ({
      name: f.address.split(',')[0],
      profit: f.actual_sale_price - f.purchase_price - (f.rehab_spent || 0),
    }))
    .slice(0, 6);

  // Summary numbers
  const totalPortfolioValue = rentals.reduce((s, r) => s + (r.current_value || r.purchase_price || 0), 0);
  const totalMonthlyIncome  = rentals.filter(r => r.status === 'occupied').reduce((s, r) => s + (r.monthly_rent || 0), 0);
  const totalFlipProfit     = flips.filter(f => f.status === 'sold').reduce((s, f) => {
    return s + (f.actual_sale_price ? f.actual_sale_price - (f.purchase_price || 0) - (f.rehab_spent || 0) : 0);
  }, 0);
  const occupancyRate = rentals.length > 0
    ? Math.round((rentals.filter(r => r.status === 'occupied').length / rentals.length) * 100)
    : 0;

  const summaryStats = [
    { label: 'Portfolio Value',    value: fmt(totalPortfolioValue), color: 'text-blue-600' },
    { label: 'Monthly Income',     value: fmt(totalMonthlyIncome),  color: 'text-emerald-600' },
    { label: 'Occupancy Rate',     value: `${occupancyRate}%`,       color: occupancyRate >= 80 ? 'text-emerald-600' : 'text-amber-600' },
    { label: 'Realized Flip Profit', value: fmt(totalFlipProfit),   color: totalFlipProfit >= 0 ? 'text-emerald-600' : 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Pie */}
        {occupancyData.length > 0 && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="font-semibold text-sm mb-3">Occupancy Breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={occupancyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                    {occupancyData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Monthly Income Bar */}
        {incomeData.length > 0 && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="font-semibold text-sm mb-3">Monthly Rent by Property</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={incomeData} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Flip Status Pie */}
        {flipStatusData.length > 0 && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="font-semibold text-sm mb-3">Fix-and-Flip Status</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={flipStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                    {flipStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Flip Profit Bar */}
        {flipProfitData.length > 0 && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="font-semibold text-sm mb-3">Flip Profit/Loss</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={flipProfitData} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="profit" radius={[4,4,0,0]}
                    fill="#10b981"
                    label={false}
                  >
                    {flipProfitData.map((entry, i) => (
                      <Cell key={i} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {(occupancyData.length === 0 && incomeData.length === 0 && flipStatusData.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Add properties and projects to see your analytics.</p>
        </div>
      )}
    </div>
  );
}