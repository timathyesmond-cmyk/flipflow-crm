import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export default function MonthlyGrowthChart({ deals }) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const added = deals.filter(d => {
      const created = d.created_date ? new Date(d.created_date) : null;
      return created && created >= start && created <= end;
    }).length;

    const closed = deals.filter(d => {
      if (d.stage !== 'closed') return false;
      const closedDate = d.closing_date
        ? new Date(d.closing_date)
        : d.updated_date ? new Date(d.updated_date) : null;
      return closedDate && closedDate >= start && closedDate <= end;
    }).length;

    return { month: format(date, 'MMM yy'), added, closed };
  });

  const totalAdded = months.reduce((s, m) => s + m.added, 0);
  const totalClosed = months.reduce((s, m) => s + m.closed, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Monthly Deal Activity</CardTitle>
        <p className="text-xs text-muted-foreground">
          Last 6 months · {totalAdded} added · {totalClosed} closed
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={months} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="added" name="Added" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="closed" name="Closed" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}