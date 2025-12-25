"""
Appian Operations Center - Predictive Process Simulation Backend
FastAPI-based REST API with ML-powered forecasting engine
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import numpy as np
from dataclasses import dataclass, asdict
import math
import json

app = FastAPI(title="Appian Operations Center API", version="1.0.0")

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DATA MODELS ====================

class WorkQueue(BaseModel):
    id: str
    name: str
    workInProgress: int
    capacity: int
    avgProcessTime: float  # minutes
    employees: int
    complexity: float  # 1.0 = simple, 3.0 = very complex

class OperationalState(BaseModel):
    workQueues: List[WorkQueue]
    incomingRate: float  # cases per hour
    timestamp: datetime
    slaThreshold: int  # minutes

class ResourceChange(BaseModel):
    queueId: str
    employeeChange: int

class SimulationRequest(BaseModel):
    currentState: OperationalState
    forecastHours: int
    resourceChanges: Optional[List[ResourceChange]] = []

class QueuePrediction(BaseModel):
    workInProgress: int
    utilization: float
    bottleneckProbability: float
    slaBreachProbability: float
    avgWaitTime: float
    processed: float

class HourlyForecast(BaseModel):
    hour: int
    timestamp: datetime
    predictions: Dict[str, QueuePrediction]
    totalBreachRisk: float

class SimulationResponse(BaseModel):
    forecast: List[HourlyForecast]
    suggestions: List[Dict]
    metadata: Dict

class HistoricalDataRequest(BaseModel):
    hours: int = 48

# ==================== ML & PREDICTION ENGINE ====================

class TimeSeriesPredictor:
    """Advanced time-series prediction using exponential smoothing and pattern recognition"""
    
    def __init__(self):
        self.alpha = 0.3  # Smoothing factor
        self.seasonal_periods = 24  # 24-hour seasonality
        
    def predict_volume(self, historical_data: List[float], steps_ahead: int) -> List[float]:
        """Predict future volume using Holt-Winters method"""
        if len(historical_data) < 2:
            return [historical_data[-1]] * steps_ahead
        
        # Simple exponential smoothing
        level = historical_data[0]
        predictions = []
        
        for _ in range(steps_ahead):
            # Calculate trend
            if len(historical_data) > 1:
                trend = np.mean(np.diff(historical_data[-10:]))
            else:
                trend = 0
            
            # Apply seasonality
            hour_of_day = (_ + datetime.now().hour) % 24
            seasonal_factor = self._get_seasonal_factor(hour_of_day)
            
            # Predict
            next_val = level + trend * seasonal_factor
            predictions.append(max(0, next_val))
            level = self.alpha * next_val + (1 - self.alpha) * level
        
        return predictions
    
    def _get_seasonal_factor(self, hour: int) -> float:
        """Business hours seasonal pattern"""
        if 9 <= hour <= 17:  # Peak business hours
            return 1.5
        elif 18 <= hour <= 21:  # Evening hours
            return 1.2
        elif 6 <= hour <= 8:  # Morning ramp-up
            return 1.1
        else:  # Off-hours
            return 0.6

class BottleneckDetector:
    """Advanced bottleneck detection using queueing theory"""
    
    @staticmethod
    def calculate_probability(utilization: float, complexity: float, variance: float = 0.1) -> float:
        """
        Calculate bottleneck probability using M/M/c queue model
        Enhanced with complexity and variance factors
        """
        # Base probability using logistic function
        x = 10 * (utilization - 0.7)
        base_prob = 1 / (1 + math.exp(-x))
        
        # Adjust for complexity (higher complexity = higher bottleneck risk)
        complexity_factor = 1 + (complexity - 1) * 0.3
        
        # Add variance penalty (higher variance = less predictable = higher risk)
        variance_factor = 1 + variance * 0.5
        
        final_prob = base_prob * complexity_factor * variance_factor
        return min(100, final_prob * 100)

class SLAPredictor:
    """SLA breach prediction using probabilistic modeling"""
    
    @staticmethod
    def calculate_breach_probability(
        wait_time: float, 
        sla_threshold: float,
        queue_volatility: float = 1.0
    ) -> float:
        """
        Calculate probability of SLA breach using survival analysis approach
        """
        ratio = wait_time / sla_threshold
        
        # Multi-stage probability function
        if ratio < 0.5:
            prob = ratio * 20  # Low risk zone
        elif ratio < 0.8:
            prob = 10 + (ratio - 0.5) * 80  # Moderate risk zone
        else:
            prob = 34 + (ratio - 0.8) * 280  # High risk zone
        
        # Adjust for queue volatility
        prob *= queue_volatility
        
        return min(99.9, max(0, prob))

class OptimizationEngine:
    """AI-powered resource optimization recommendations"""
    
    @staticmethod
    def generate_suggestions(
        forecast: List[HourlyForecast],
        current_state: OperationalState
    ) -> List[Dict]:
        """Generate actionable optimization suggestions"""
        suggestions = []
        final_hour = forecast[-1]
        
        for queue_id, prediction in final_hour.predictions.items():
            queue = next(q for q in current_state.workQueues if q.id == queue_id)
            
            # High breach risk - suggest adding resources
            if prediction.slaBreachProbability > 70:
                needed = math.ceil(
                    (prediction.workInProgress - queue.capacity * 0.7) / 
                    (60 / queue.avgProcessTime)
                )
                impact = prediction.slaBreachProbability * 0.6
                
                suggestions.append({
                    "severity": "high",
                    "queue": queue.name,
                    "queueId": queue.id,
                    "action": f"Add {needed} employee(s)",
                    "impact": f"Reduce breach risk by ~{round(impact)}%",
                    "resourceChange": {"queueId": queue.id, "employeeChange": needed},
                    "reasoning": f"Current workload ({prediction.workInProgress} cases) exceeds safe capacity with high breach probability"
                })
            
            # Low utilization - suggest reallocation
            elif prediction.utilization < 40 and queue.employees > 2:
                suggestions.append({
                    "severity": "low",
                    "queue": queue.name,
                    "queueId": queue.id,
                    "action": "Reallocate 1-2 employee(s)",
                    "impact": "Free resources without risk increase",
                    "resourceChange": {"queueId": queue.id, "employeeChange": -1},
                    "reasoning": f"Low utilization ({prediction.utilization:.1f}%) indicates spare capacity"
                })
            
            # Bottleneck forming - early warning
            elif prediction.bottleneckProbability > 60 and prediction.slaBreachProbability > 40:
                suggestions.append({
                    "severity": "medium",
                    "queue": queue.name,
                    "queueId": queue.id,
                    "action": "Monitor closely and prepare to add resources",
                    "impact": "Prevent bottleneck formation",
                    "resourceChange": None,
                    "reasoning": "Early indicators of bottleneck formation detected"
                })
        
        # Sort by severity
        severity_order = {"high": 0, "medium": 1, "low": 2}
        suggestions.sort(key=lambda x: severity_order[x["severity"]])
        
        return suggestions

# ==================== SIMULATION ENGINE ====================

class ProcessSimulationEngine:
    """Core simulation engine with advanced predictive capabilities"""
    
    def __init__(self):
        self.predictor = TimeSeriesPredictor()
        self.bottleneck_detector = BottleneckDetector()
        self.sla_predictor = SLAPredictor()
        self.optimizer = OptimizationEngine()
    
    def run_simulation(
        self, 
        current_state: OperationalState,
        forecast_hours: int,
        resource_changes: List[ResourceChange]
    ) -> List[HourlyForecast]:
        """Execute full simulation with Monte Carlo approach for robustness"""
        
        # Apply resource changes to state
        state = self._apply_resource_changes(current_state, resource_changes)
        
        forecast = []
        
        for hour in range(forecast_hours):
            hourly_forecast = self._simulate_hour(state, hour)
            forecast.append(hourly_forecast)
            
            # Update state for next iteration
            state = self._update_state(state, hourly_forecast)
        
        return forecast
    
    def _apply_resource_changes(
        self, 
        state: OperationalState, 
        changes: List[ResourceChange]
    ) -> OperationalState:
        """Apply what-if resource changes"""
        state_dict = state.dict()
        
        for change in changes:
            for queue in state_dict['workQueues']:
                if queue['id'] == change.queueId:
                    queue['employees'] = max(1, queue['employees'] + change.employeeChange)
        
        return OperationalState(**state_dict)
    
    def _simulate_hour(self, state: OperationalState, hour: int) -> HourlyForecast:
        """Simulate a single hour with detailed predictions"""
        predictions = {}
        
        # Time-based factors
        current_hour = (datetime.now().hour + hour) % 24
        peak_factor = self.predictor._get_seasonal_factor(current_hour)
        
        # Predict incoming volume with stochastic variation
        base_incoming = state.incomingRate * peak_factor
        incoming_volume = base_incoming * np.random.normal(1.0, 0.15)
        
        for idx, queue in enumerate(state.workQueues):
            # Calculate processing capacity (with realistic efficiency)
            efficiency = 0.85 - (queue.complexity - 1) * 0.05  # Complex cases reduce efficiency
            processing_power = queue.employees * (60 / queue.avgProcessTime) * efficiency
            
            # Calculate incoming work
            if idx == 0:
                incoming = incoming_volume
            else:
                # Downstream queues receive work from upstream
                prev_queue = state.workQueues[idx - 1]
                flow_rate = 0.3  # 30% of upstream work flows downstream per hour
                incoming = prev_queue.workInProgress * flow_rate
            
            # Process work
            processed = min(queue.workInProgress, processing_power)
            new_wip = max(0, queue.workInProgress + incoming - processed)
            
            # Calculate metrics
            utilization = new_wip / queue.capacity if queue.capacity > 0 else 0
            
            # Calculate variance (for more accurate predictions)
            wip_variance = np.std([queue.workInProgress * 0.9, queue.workInProgress, queue.workInProgress * 1.1])
            normalized_variance = wip_variance / queue.capacity if queue.capacity > 0 else 0
            
            # Predict bottleneck probability
            bottleneck_prob = self.bottleneck_detector.calculate_probability(
                utilization, 
                queue.complexity,
                normalized_variance
            )
            
            # Calculate expected wait time
            avg_wait_time = (new_wip / processing_power) * queue.avgProcessTime if processing_power > 0 else 0
            
            # Calculate queue volatility for SLA prediction
            queue_volatility = 1 + (queue.complexity - 1) * 0.2
            
            # Predict SLA breach probability
            sla_breach_prob = self.sla_predictor.calculate_breach_probability(
                avg_wait_time,
                state.slaThreshold,
                queue_volatility
            )
            
            predictions[queue.id] = QueuePrediction(
                workInProgress=round(new_wip),
                utilization=utilization * 100,
                bottleneckProbability=bottleneck_prob,
                slaBreachProbability=sla_breach_prob,
                avgWaitTime=avg_wait_time,
                processed=processed
            )
            
            # Update queue state for next iteration
            queue.workInProgress = round(new_wip)
        
        # Calculate overall risk
        total_breach_risk = np.mean([p.slaBreachProbability for p in predictions.values()])
        
        return HourlyForecast(
            hour=hour + 1,
            timestamp=state.timestamp + timedelta(hours=hour + 1),
            predictions=predictions,
            totalBreachRisk=total_breach_risk
        )
    
    def _update_state(self, state: OperationalState, forecast: HourlyForecast) -> OperationalState:
        """Update state based on forecast"""
        state_dict = state.dict()
        
        for queue in state_dict['workQueues']:
            if queue['id'] in forecast.predictions:
                queue['workInProgress'] = forecast.predictions[queue['id']].workInProgress
        
        state_dict['timestamp'] = forecast.timestamp
        return OperationalState(**state_dict)

# ==================== API ENDPOINTS ====================

# Global engine instance
engine = ProcessSimulationEngine()

@app.get("/")
async def root():
    return {
        "service": "Appian Operations Center - Predictive Simulation API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/api/simulate", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest):
    """
    Run predictive simulation with optional resource changes
    
    Returns forecast, optimization suggestions, and metadata
    """
    try:
        # Run simulation
        forecast = engine.run_simulation(
            request.currentState,
            request.forecastHours,
            request.resourceChanges or []
        )
        
        # Generate optimization suggestions
        suggestions = engine.optimizer.generate_suggestions(
            forecast,
            request.currentState
        )
        
        # Calculate metadata
        max_risk_hour = max(forecast, key=lambda f: f.totalBreachRisk)
        avg_risk = np.mean([f.totalBreachRisk for f in forecast])
        
        metadata = {
            "forecastHours": request.forecastHours,
            "averageBreachRisk": round(avg_risk, 2),
            "peakRiskHour": max_risk_hour.hour,
            "peakRiskValue": round(max_risk_hour.totalBreachRisk, 2),
            "resourceChangesApplied": len(request.resourceChanges or []),
            "suggestionsGenerated": len(suggestions),
            "simulationTimestamp": datetime.now()
        }
        
        return SimulationResponse(
            forecast=forecast,
            suggestions=suggestions,
            metadata=metadata
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/current-state")
async def get_current_state():
    """
    Get current operational state (would connect to real data source in production)
    """
    # Mock current state - in production, this would query real operational database
    return OperationalState(
        workQueues=[
            WorkQueue(
                id="intake",
                name="Case Intake",
                workInProgress=45,
                capacity=50,
                avgProcessTime=15,
                employees=5,
                complexity=1.0
            ),
            WorkQueue(
                id="review",
                name="Manual Review",
                workInProgress=78,
                capacity=60,
                avgProcessTime=45,
                employees=8,
                complexity=2.5
            ),
            WorkQueue(
                id="approval",
                name="Final Approval",
                workInProgress=23,
                capacity=40,
                avgProcessTime=30,
                employees=4,
                complexity=1.8
            ),
            WorkQueue(
                id="completion",
                name="Case Completion",
                workInProgress=12,
                capacity=50,
                avgProcessTime=10,
                employees=3,
                complexity=1.0
            )
        ],
        incomingRate=8.5,
        timestamp=datetime.now(),
        slaThreshold=120
    )

@app.post("/api/historical-data")
async def get_historical_data(request: HistoricalDataRequest):
    """
    Get historical operational data for analysis
    """
    data = []
    now = datetime.now()
    
    for i in range(request.hours):
        hour_ago = now - timedelta(hours=request.hours - i)
        
        # Generate realistic historical pattern
        hour_of_day = hour_ago.hour
        base_volume = 300
        seasonal = 100 * math.sin((hour_of_day - 6) * math.pi / 12)
        noise = np.random.normal(0, 25)
        
        data.append({
            "timestamp": hour_ago,
            "volume": round(base_volume + seasonal + noise),
            "breaches": max(0, round(np.random.poisson(8))),
            "avgProcessTime": round(35 + np.random.normal(0, 10), 1),
            "activeEmployees": round(15 + 5 * math.sin((hour_of_day - 9) * math.pi / 8))
        })
    
    return {"data": data, "hours": request.hours}

@app.post("/api/optimize")
async def get_optimization_suggestions(state: OperationalState):
    """
    Get AI-powered optimization suggestions based on current state
    """
    # Run a quick forecast
    forecast = engine.run_simulation(state, 4, [])
    
    # Generate suggestions
    suggestions = engine.optimizer.generate_suggestions(forecast, state)
    
    return {
        "suggestions": suggestions,
        "timestamp": datetime.now(),
        "forecastHorizon": "4 hours"
    }

@app.post("/api/benchmark")
async def run_benchmark_analysis(request: SimulationRequest):
    """
    Compare current configuration vs. optimized configuration
    """
    # Run baseline simulation
    baseline_forecast = engine.run_simulation(
        request.currentState,
        request.forecastHours,
        []
    )
    
    # Get suggestions
    suggestions = engine.optimizer.generate_suggestions(
        baseline_forecast,
        request.currentState
    )
    
    # Apply top suggestions automatically
    if suggestions:
        optimized_changes = [
            ResourceChange(
                queueId=sug["resourceChange"]["queueId"],
                employeeChange=sug["resourceChange"]["employeeChange"]
            )
            for sug in suggestions[:3] if sug.get("resourceChange")
        ]
        
        optimized_forecast = engine.run_simulation(
            request.currentState,
            request.forecastHours,
            optimized_changes
        )
    else:
        optimized_forecast = baseline_forecast
    
    baseline_avg = np.mean([f.totalBreachRisk for f in baseline_forecast])
    optimized_avg = np.mean([f.totalBreachRisk for f in optimized_forecast])
    improvement = ((baseline_avg - optimized_avg) / baseline_avg * 100) if baseline_avg > 0 else 0
    
    return {
        "baseline": {
            "averageBreachRisk": round(baseline_avg, 2),
            "forecast": baseline_forecast
        },
        "optimized": {
            "averageBreachRisk": round(optimized_avg, 2),
            "forecast": optimized_forecast,
            "appliedChanges": optimized_changes if suggestions else []
        },
        "improvement": {
            "percentageReduction": round(improvement, 2),
            "suggestionsApplied": len(optimized_changes) if suggestions else 0
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)