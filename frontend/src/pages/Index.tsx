import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { QueueCard } from '@/components/QueueCard';
import { ForecastChart } from '@/components/ForecastChart';
import { SuggestionCard } from '@/components/SuggestionCard';
import { SimulationControls } from '@/components/SimulationControls';
import { RiskGauge } from '@/components/RiskGauge';
import { mockOperationalState, generateMockForecast } from '@/lib/mockData';
import { SimulationResponse, Suggestion } from '@/types/operations';
import { 
  Activity, 
  Users, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentState] = useState(mockOperationalState);
  
  // Run initial simulation on mount
  useEffect(() => {
    handleRunSimulation(8);
  }, []);
  
  const handleRunSimulation = async (hours: number) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const result = generateMockForecast(hours);
    setSimulation(result);
    setIsLoading(false);
    
    toast.success('Simulation complete', {
      description: `Generated ${hours}-hour forecast with ${result.suggestions.length} suggestions`
    });
  };
  
  const handleApplySuggestion = (suggestion: Suggestion) => {
    toast.success('Suggestion applied', {
      description: `${suggestion.action} for ${suggestion.queue}`
    });
    // Re-run simulation with applied changes
    handleRunSimulation(simulation?.metadata.forecastHours || 8);
  };
  
  const handleReset = () => {
    setSimulation(null);
    toast.info('Simulation reset');
  };
  
  const totalWIP = currentState.workQueues.reduce((sum, q) => sum + q.workInProgress, 0);
  const totalEmployees = currentState.workQueues.reduce((sum, q) => sum + q.employees, 0);
  const avgRisk = simulation?.metadata.averageBreachRisk ?? 0;
  
  // Get latest predictions for queue cards
  const latestPredictions = simulation?.forecast[simulation.forecast.length - 1]?.predictions;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 max-w-[1600px]">
        {/* Top Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Work in Progress"
            value={totalWIP}
            subtitle="Across all queues"
            icon={Layers}
            status="info"
            trend={{ value: 12, label: 'vs last hour' }}
          />
          <MetricCard
            title="Active Employees"
            value={totalEmployees}
            subtitle="Currently assigned"
            icon={Users}
            status="healthy"
          />
          <MetricCard
            title="Incoming Rate"
            value={`${currentState.incomingRate}/hr`}
            subtitle="New cases per hour"
            icon={TrendingUp}
            status="info"
          />
          <MetricCard
            title="SLA Threshold"
            value={`${currentState.slaThreshold}m`}
            subtitle="Target response time"
            icon={Clock}
            status={avgRisk > 50 ? 'warning' : 'healthy'}
          />
        </section>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Queues */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Work Queues</h2>
                <p className="text-sm text-muted-foreground">Real-time status and predictions</p>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-status-healthy animate-pulse-glow" />
                <span className="text-sm text-muted-foreground">Live updates</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentState.workQueues.map((queue, idx) => (
                <QueueCard
                  key={queue.id}
                  queue={queue}
                  prediction={latestPredictions?.[queue.id]}
                  delay={idx}
                />
              ))}
            </div>
          </div>
          
          {/* Right Column - Controls & Gauges */}
          <div className="space-y-6">
            <SimulationControls
              onRunSimulation={handleRunSimulation}
              onReset={handleReset}
              isLoading={isLoading}
            />
            
            {simulation && (
              <div className="glass rounded-xl p-6 animate-fade-in">
                <h3 className="font-semibold text-lg mb-4">Risk Overview</h3>
                <div className="flex justify-around">
                  <RiskGauge
                    value={simulation.metadata.averageBreachRisk}
                    label="Avg Breach Risk"
                    size="md"
                  />
                  <RiskGauge
                    value={simulation.metadata.peakRiskValue}
                    label="Peak Risk"
                    size="md"
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Peak risk at hour {simulation.metadata.peakRiskHour}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Forecast Chart */}
        {simulation && (
          <section className="mb-8">
            <ForecastChart forecast={simulation.forecast} />
          </section>
        )}
        
        {/* AI Suggestions */}
        {simulation && simulation.suggestions.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <AlertTriangle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">AI Recommendations</h2>
                <p className="text-sm text-muted-foreground">
                  {simulation.suggestions.length} optimization suggestions
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {simulation.suggestions.map((suggestion, idx) => (
                <SuggestionCard
                  key={`${suggestion.queueId}-${idx}`}
                  suggestion={suggestion}
                  onApply={handleApplySuggestion}
                  delay={idx}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
