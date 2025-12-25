export interface WorkQueue {
  id: string;
  name: string;
  workInProgress: number;
  capacity: number;
  avgProcessTime: number;
  employees: number;
  complexity: number;
}

export interface OperationalState {
  workQueues: WorkQueue[];
  incomingRate: number;
  timestamp: string;
  slaThreshold: number;
}

export interface QueuePrediction {
  workInProgress: number;
  utilization: number;
  bottleneckProbability: number;
  slaBreachProbability: number;
  avgWaitTime: number;
  processed: number;
}

export interface HourlyForecast {
  hour: number;
  timestamp: string;
  predictions: Record<string, QueuePrediction>;
  totalBreachRisk: number;
}

export interface Suggestion {
  severity: 'high' | 'medium' | 'low';
  queue: string;
  queueId: string;
  action: string;
  impact: string;
  resourceChange: { queueId: string; employeeChange: number } | null;
  reasoning: string;
}

export interface SimulationResponse {
  forecast: HourlyForecast[];
  suggestions: Suggestion[];
  metadata: {
    forecastHours: number;
    averageBreachRisk: number;
    peakRiskHour: number;
    peakRiskValue: number;
    resourceChangesApplied: number;
    suggestionsGenerated: number;
    simulationTimestamp: string;
  };
}

export interface HistoricalDataPoint {
  timestamp: string;
  volume: number;
  breaches: number;
  avgProcessTime: number;
  activeEmployees: number;
}
