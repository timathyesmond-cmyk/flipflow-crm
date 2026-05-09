import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function MonthlyProfitChart({ deals }) {
  // Build last 6 months of data
  const data = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const profit = deals
      .filter(d => {
        if (d.stage !== 'closed') return false;
        const closed = d.closing_date ? new Date(d.closing_date) : d.updated_date ? new Date(d.updated_date) : null;
        return closed && closed >= start && closed <= end;
      })
      .reduce((sum, d) => sum + (d.assignment_fee || 0), 0);
    return { month: format(date, 'MMM'), profit };
  });

  const total = data.reduce((s, d) => s + d.profit, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Monthly Profit (Closed Deals)</CardTitle>
        <p className="text-xs text-muted-foreground">Last 6 months · ${total.toLocaleString()} total</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '0' : `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={v => [`$${v.toLocaleString()}`, 'Profit']}
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: 12 }}
            />
            <Bar dataKey="profit" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}