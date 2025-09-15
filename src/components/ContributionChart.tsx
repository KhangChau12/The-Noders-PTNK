'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ContributionChartData } from '@/types/project'
import { getContributionColor, getInitials } from '@/lib/utils'

interface ContributionChartProps {
  data: ContributionChartData[]
  size?: 'sm' | 'md' | 'lg'
}

export function ContributionChart({ data, size = 'md' }: ContributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-text-tertiary text-sm">
        No contribution data available
      </div>
    )
  }

  const sizes = {
    sm: 150,
    md: 200,
    lg: 250,
  }

  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || getContributionColor(item.value)
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="text-text-primary font-medium">{data.name}</span>
          </div>
          <p className="text-text-secondary text-sm mt-1">
            {data.value}% contribution
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={sizes[size]}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={size === 'sm' ? 40 : size === 'md' ? 50 : 60}
            outerRadius={size === 'sm' ? 60 : size === 'md' ? 80 : 100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-text-secondary truncate">{item.name}</span>
            </div>
            <span className="text-text-primary font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple horizontal bar version
export function ContributionBar({ data }: { data: ContributionChartData[] }) {
  if (!data || data.length === 0) return null

  return (
    <div className="w-full">
      <div className="flex h-2 bg-dark-bg rounded-full overflow-hidden">
        {data.map((item, index) => (
          <div
            key={index}
            className="h-full transition-all duration-500"
            style={{
              width: `${item.value}%`,
              backgroundColor: item.color || getContributionColor(item.value)
            }}
          />
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-1 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color || getContributionColor(item.value) }}
            />
            <span className="text-text-tertiary">
              {item.name}: {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}