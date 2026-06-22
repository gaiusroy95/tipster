import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const chartColors = {
  primary: '#00c853',
  muted: '#8b9aab',
  grid: '#2a3441',
  win: '#22c55e',
  loss: '#ef4444',
}

interface PerformanceChartProps {
  data: { date: string; cumulative: number }[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: chartColors.muted, fontSize: 11 }} />
        <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: '#1a222d',
            border: '1px solid #2a3441',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#f0f4f8' }}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke={chartColors.primary}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface LeagueBarChartProps {
  data: { leagueName: string; profitLoss: number }[]
}

export function LeagueBarChart({ data }: LeagueBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
        <XAxis dataKey="leagueName" tick={{ fill: chartColors.muted, fontSize: 10 }} />
        <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: '#1a222d',
            border: '1px solid #2a3441',
            borderRadius: '8px',
          }}
        />
        <Bar
          dataKey="profitLoss"
          fill={chartColors.primary}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
