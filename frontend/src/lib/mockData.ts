import { OperationalState, SimulationResponse, HistoricalDataPoint } from '@/types/operations';

export const mockOperationalState: OperationalState = {
  workQueues: [
    {
      id: "intake",
      name: "Case Intake",
      workInProgress: 45,
      capacity: 50,
      avgProcessTime: 15,
      employees: 5,
      complexity: 1.0
    },
    {
      id: "review",
      name: "Manual Review",
      workInProgress: 78,
      capacity: 60,
      avgProcessTime: 45,
      employees: 8,
      complexity: 2.5
    },
    {
      id: "approval",
      name: "Final Approval",
      workInProgress: 23,
      capacity: 40,
      avgProcessTime: 30,
      employees: 4,
      complexity: 1.8
    },
    {
      id: "completion",
      name: "Case Completion",
      workInProgress: 12,
      capacity: 50,
      avgProcessTime: 10,
      employees: 3,
      complexity: 1.0
    }
  ],
  incomingRate: 8.5,
  timestamp: new Date().toISOString(),
  slaThreshold: 120
};

export const generateMockForecast = (hours: number): SimulationResponse => {
  const forecast = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const hourFactor = Math.sin((i + now.getHours()) * Math.PI / 12) * 0.3 + 1;
    const predictions: Record<string, any> = {};
    
    mockOperationalState.workQueues.forEach((queue, idx) => {
      const baseUtil = (queue.workInProgress / queue.capacity) * 100;
      const utilization = Math.min(100, baseUtil * hourFactor + Math.random() * 10);
      const breachProb = Math.max(0, Math.min(100, (utilization - 60) * 2 + Math.random() * 15));
      const bottleneckProb = Math.max(0, Math.min(100, (utilization - 50) * 1.5 + Math.random() * 10));
      
      predictions[queue.id] = {
        workInProgress: Math.round(queue.workInProgress * hourFactor + Math.random() * 10),
        utilization,
        bottleneckProbability: bottleneckProb,
        slaBreachProbability: breachProb,
        avgWaitTime: queue.avgProcessTime * (utilization / 50),
        processed: Math.round(queue.employees * (60 / queue.avgProcessTime) * 0.85)
      };
    });
    
    forecast.push({
      hour: i + 1,
      timestamp: new Date(now.getTime() + (i + 1) * 3600000).toISOString(),
      predictions,
      totalBreachRisk: Object.values(predictions).reduce((sum: number, p: any) => sum + p.slaBreachProbability, 0) / 4
    });
  }
  
  return {
    forecast,
    suggestions: [
      {
        severity: 'high',
        queue: 'Manual Review',
        queueId: 'review',
        action: 'Add 2 employee(s)',
        impact: 'Reduce breach risk by ~42%',
        resourceChange: { queueId: 'review', employeeChange: 2 },
        reasoning: 'Current workload (78 cases) exceeds safe capacity with high breach probability'
      },
      {
        severity: 'medium',
        queue: 'Final Approval',
        queueId: 'approval',
        action: 'Monitor closely and prepare to add resources',
        impact: 'Prevent bottleneck formation',
        resourceChange: null,
        reasoning: 'Early indicators of bottleneck formation detected'
      },
      {
        severity: 'low',
        queue: 'Case Completion',
        queueId: 'completion',
        action: 'Reallocate 1-2 employee(s)',
        impact: 'Free resources without risk increase',
        resourceChange: { queueId: 'completion', employeeChange: -1 },
        reasoning: 'Low utilization (24%) indicates spare capacity'
      }
    ],
    metadata: {
      forecastHours: hours,
      averageBreachRisk: 32.5,
      peakRiskHour: 4,
      peakRiskValue: 58.2,
      resourceChangesApplied: 0,
      suggestionsGenerated: 3,
      simulationTimestamp: new Date().toISOString()
    }
  };
};

export const generateHistoricalData = (hours: number): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    const hourOfDay = timestamp.getHours();
    const baseVolume = 300;
    const seasonal = 100 * Math.sin((hourOfDay - 6) * Math.PI / 12);
    
    data.push({
      timestamp: timestamp.toISOString(),
      volume: Math.round(baseVolume + seasonal + (Math.random() - 0.5) * 50),
      breaches: Math.max(0, Math.round(Math.random() * 15)),
      avgProcessTime: Math.round(35 + (Math.random() - 0.5) * 20),
      activeEmployees: Math.round(15 + 5 * Math.sin((hourOfDay - 9) * Math.PI / 8))
    });
  }
  
  return data;
};
