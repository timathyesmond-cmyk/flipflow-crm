import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const stageLabels = {
  lead: 'Leads',
  contacted: 'Contacted',
  under_contract: 'Under Contract',
  assigned: 'Assigned',
  closed: 'Closed',
  dead: 'Dead'
};

const stageColors = [
  'hsl(220, 14%, 70%)',
  'hsl(222, 47%, 40%)',
  'hsl(38, 92%, 50%)',
  'hsl(200, 70%, 50%)',
  'hsl(160, 60%, 45%)',
  'hsl(0, 40%, 55%)',
];

export default function PipelineChart({ deals }) {
  const data = Object.entries(stageLabels).map(([key, label]) => ({
    name: label,
    count: deals.filter(d => d.stage === key).length
  }));

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/60">
      <h3 className="text-sm font-semibold mb-4">Deal Pipeline</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220,9%,46%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(220,9%,46%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'hsl(220,14%,92%)', radius: 8 }}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={stageColors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}