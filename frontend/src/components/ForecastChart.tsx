import { HourlyForecast } from '@/types/operations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface ForecastChartProps {
  forecast: HourlyForecast[];
  selectedQueue?: string;
}

export const ForecastChart = ({ forecast, selectedQueue }: ForecastChartProps) => {
  const data = forecast.map((f) => {
    const base: any = {
      hour: `+${f.hour}h`,
      time: format(new Date(f.timestamp), 'HH:mm'),
      totalRisk: f.totalBreachRisk
    };
    
    Object.entries(f.predictions).forEach(([queueId, pred]) => {
      base[`${queueId}_util`] = pred.utilization;
      base[`${queueId}_risk`] = pred.slaBreachProbability;
    });
    
    return base;
  });
  
  const queueIds = forecast[0] ? Object.keys(forecast[0].predictions) : [];
  
  const colors = {
    intake: '#22d3ee',
    review: '#f472b6',
    approval: '#a78bfa',
    completion: '#34d399'
  };
  
  return (
    <div className="glass rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Forecast Timeline</h3>
          <p className="text-sm text-muted-foreground">Projected utilization & risk over time</p>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {queueIds.map((id) => (
                <linearGradient key={id} id={`gradient_${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[id as keyof typeof colors] || '#6366f1'} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={colors[id as keyof typeof colors] || '#6366f1'} stopOpacity={0} />
                </linearGradient>
              ))}
              <linearGradient id="gradient_risk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="hour" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            
            {queueIds.map((id) => (
              <Area
                key={id}
                type="monotone"
                dataKey={`${id}_util`}
                name={id.charAt(0).toUpperCase() + id.slice(1)}
                stroke={colors[id as keyof typeof colors] || '#6366f1'}
                fill={`url(#gradient_${id})`}
                strokeWidth={2}
              />
            ))}
            
            <Area
              type="monotone"
              dataKey="totalRisk"
              name="Total Risk"
              stroke="#ef4444"
              fill="url(#gradient_risk)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
