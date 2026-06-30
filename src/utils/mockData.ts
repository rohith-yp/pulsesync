// PulseSync AI - Realistic Hospital Mock Data Generator & Hooks
// Structured to simulate asynchronous REST/GraphQL API requests

export interface Department {
  id: string;
  name: string;
  occupancy: number; // percentage
  currentCount: number;
  capacity: number;
  waitingTimeCurrent: number; // in minutes
  waitingTimePredicted: number; // in minutes
  riskScore: number; // 0 - 100
  status: 'green' | 'yellow' | 'orange' | 'red';
  trend: number[];
}

export interface KPICard {
  id: string;
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  trend: number[];
  iconName: string;
  unit?: string;
}

export interface AIAlert {
  id: string;
  departmentName: string;
  time: string;
  message: string;
  severity: 'danger' | 'warning' | 'info';
  recommendedActions: string[];
  expectedReduction: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  patientsAssigned: number;
  hoursWorked: number;
  stressScore: number; // 0 - 100
  burnoutProbability: number; // percentage
  aiRecommendation: string;
  status: 'stable' | 'warning' | 'critical';
}

export interface ResourceItem {
  id: string;
  name: string;
  available: number;
  total: number;
  unit: string;
  status: 'critical' | 'warning' | 'stable';
  aiRecommendation?: string;
}

export interface BottleneckInfo {
  department: string;
  currentWaitingTime: number;
  predictedWaitingTime: number;
  currentCapacity: number;
  futureCapacity: number;
  riskScore: number;
  aiSuggestions: string[];
}

export interface ReportData {
  timeframe: 'daily' | 'weekly' | 'monthly';
  staffPerformance: { name: string; score: number; burnoutIndex: number }[];
  patientStats: { label: string; count: number; predicted: number }[];
  resourceUtilization: { name: string; utilization: number }[];
  burnoutAnalysis: { department: string; riskPercentage: number }[];
  aiInsights: string[];
}

// Helper to determine status color based on occupancy or score
export const getStatusFromValue = (value: number): 'green' | 'yellow' | 'orange' | 'red' => {
  if (value < 60) return 'green';
  if (value < 75) return 'yellow';
  if (value < 90) return 'orange';
  return 'red';
};

// Generates dynamic updates by slightly shaking data points
const jitter = (val: number, min: number, max: number, percentage = 0.05): number => {
  const change = val * percentage * (Math.random() - 0.5) * 2;
  const newVal = Math.round(val + change);
  return Math.max(min, Math.min(max, newVal));
};

// 1. Initial State Data
export const initialDepartments: Department[] = [
  { id: 'er', name: 'Emergency', occupancy: 88, currentCount: 44, capacity: 50, waitingTimeCurrent: 45, waitingTimePredicted: 65, riskScore: 85, status: 'orange', trend: [30, 35, 45, 55, 60, 75, 88] },
  { id: 'icu', name: 'ICU', occupancy: 95, currentCount: 19, capacity: 20, waitingTimeCurrent: 15, waitingTimePredicted: 20, riskScore: 92, status: 'red', trend: [80, 85, 85, 90, 90, 95, 95] },
  { id: 'gw', name: 'General Ward', occupancy: 72, currentCount: 144, capacity: 200, waitingTimeCurrent: 25, waitingTimePredicted: 22, riskScore: 55, status: 'yellow', trend: [70, 72, 74, 75, 73, 71, 72] },
  { id: 'rad', name: 'Radiology', occupancy: 62, currentCount: 15, capacity: 24, waitingTimeCurrent: 35, waitingTimePredicted: 45, riskScore: 60, status: 'yellow', trend: [50, 55, 58, 62, 60, 58, 62] },
  { id: 'lab', name: 'Laboratory', occupancy: 45, currentCount: 18, capacity: 40, waitingTimeCurrent: 15, waitingTimePredicted: 12, riskScore: 35, status: 'green', trend: [40, 42, 45, 48, 47, 44, 45] },
  { id: 'pha', name: 'Pharmacy', occupancy: 82, currentCount: 33, capacity: 40, waitingTimeCurrent: 28, waitingTimePredicted: 35, riskScore: 78, status: 'orange', trend: [65, 70, 75, 78, 80, 81, 82] },
  { id: 'ot', name: 'Operation Theatre', occupancy: 85, currentCount: 6, capacity: 7, waitingTimeCurrent: 120, waitingTimePredicted: 150, riskScore: 82, status: 'orange', trend: [70, 75, 80, 85, 85, 80, 85] }
];

export const initialKPIs = (deps: Department[]): KPICard[] => {
  const er = deps.find(d => d.id === 'er')!;
  const icu = deps.find(d => d.id === 'icu')!;
  return [
    { id: 'patients', title: 'Patients Today', value: 342, change: '+14% vs yesterday', isPositive: false, trend: [250, 280, 310, 290, 320, 342], iconName: 'Activity' },
    { id: 'doctors', title: 'Doctors On Duty', value: 24, change: '100% scheduled', isPositive: true, trend: [24, 24, 24, 24, 24, 24], iconName: 'Stethoscope' },
    { id: 'nurses', title: 'Nurses Available', value: 85, change: '6 on break', isPositive: true, trend: [90, 88, 85, 87, 86, 85], iconName: 'Users' },
    { id: 'icu_occ', title: 'ICU Occupancy', value: `${icu.occupancy}%`, change: 'Critical state reached', isPositive: false, trend: icu.trend, iconName: 'HeartPulse', unit: '%' },
    { id: 'er_queue', title: 'Emergency Queue', value: er.currentCount, change: '+8 in last hr', isPositive: false, trend: er.trend, iconName: 'Hourglass' },
    { id: 'risk_score', title: 'Hospital Risk Score', value: 76, change: 'High Overload Risk', isPositive: false, trend: [50, 55, 62, 68, 72, 76], iconName: 'ShieldAlert' }
  ];
};

export const initialAlerts: AIAlert[] = [
  {
    id: 'a1',
    departmentName: 'Emergency Department',
    time: 'Predicted in 45 minutes',
    message: 'Emergency Department patient inflow surge predicted. Arrival rate will exceed current discharge rate by 40%.',
    severity: 'danger',
    recommendedActions: [
      'Assign 2 doctors from General Ward rotation to Emergency.',
      'Move 3 triage nurses to admissions queue.',
      'Reserve 2 ICU beds for potential emergency surgeries.',
      'Activate Emergency Overflow Protocol in wing B.'
    ],
    expectedReduction: '38%'
  },
  {
    id: 'a2',
    departmentName: 'ICU Unit',
    time: 'Immediate Risk',
    message: 'ICU bed capacity at 95%. Next emergency surgical admission will cause 100% capacity block.',
    severity: 'danger',
    recommendedActions: [
      'Assess 2 recovering ICU patients for transfer to High Dependency Unit.',
      'Postpone non-urgent post-op ICU admissions for 4 hours.',
      'Activate shared regional ICU ventilator reserve.'
    ],
    expectedReduction: '20%'
  },
  {
    id: 'a3',
    departmentName: 'Operation Theatre',
    time: 'Predicted in 2 hours',
    message: 'Operation Theatre turnaround delay detected. Schedule lag is growing by 15 mins/hour.',
    severity: 'warning',
    recommendedActions: [
      'Redistribute cleaning crews to speed up post-op sanitization.',
      'Verify patient pre-op status 45 minutes in advance.',
      'Redirect non-urgent minor cases to outpatient surgery center.'
    ],
    expectedReduction: '15%'
  }
];

// Reserve pool — cycled in as active alerts are resolved
export const alertPool: AIAlert[] = [
  {
    id: 'p1',
    departmentName: 'Pharmacy Unit',
    time: 'Now',
    message: 'IV medication stock running critically low. Current supply covers only 2 hours of active ICU demand.',
    severity: 'danger',
    recommendedActions: [
      'Trigger emergency reorder from central pharmacy warehouse.',
      'Audit current IV drip rates and reduce non-critical infusions.',
      'Notify attending physicians of substitution protocols.'
    ],
    expectedReduction: '22%'
  },
  {
    id: 'p2',
    departmentName: 'General Ward',
    time: 'Predicted in 1 hour',
    message: 'General Ward nurse-to-patient ratio falling below safe threshold due to shift gap.',
    severity: 'warning',
    recommendedActions: [
      'Call in 2 on-call nurses from standby pool.',
      'Redistribute current nursing staff from low-load zones.',
      'Defer non-critical documentation tasks to morning shift.'
    ],
    expectedReduction: '18%'
  },
  {
    id: 'p3',
    departmentName: 'Radiology',
    time: 'Predicted in 30 minutes',
    message: 'Radiology scan queue backing up. CT machine utilization at 98% with 14 patients pending.',
    severity: 'warning',
    recommendedActions: [
      'Prioritize critical trauma and ICU scan orders.',
      'Activate second MRI suite for overflow imaging.',
      'Notify referring physicians of 45-minute delay estimate.'
    ],
    expectedReduction: '30%'
  },
  {
    id: 'p4',
    departmentName: 'Emergency Department',
    time: 'Immediate',
    message: 'Ambulance bay at full capacity. 3 inbound units unable to dock. Diversion protocol needed.',
    severity: 'danger',
    recommendedActions: [
      'Activate ambulance diversion protocol to St. Mary\'s Hospital.',
      'Clear Bay 2 by expediting patient transfers to triage.',
      'Alert ED charge nurse to open secondary intake corridor.'
    ],
    expectedReduction: '35%'
  },
  {
    id: 'p5',
    departmentName: 'ICU Unit',
    time: 'Predicted in 90 minutes',
    message: 'Ventilator supply insufficient for projected intubation demand in next shift window.',
    severity: 'danger',
    recommendedActions: [
      'Request 4 additional ventilators from central biomedical stores.',
      'Evaluate 2 patients for weaning trial to free units.',
      'Contact regional hospital for ventilator sharing agreement.'
    ],
    expectedReduction: '25%'
  },
  {
    id: 'p6',
    departmentName: 'Operation Theatre',
    time: 'In 45 minutes',
    message: 'Surgical instrument sterilization backlog detected. 3 sets unready for next scheduled case.',
    severity: 'warning',
    recommendedActions: [
      'Expedite flash sterilization cycle for priority instrument sets.',
      'Reschedule elective case #4 by 30 minutes.',
      'Alert scrub technicians to prioritize OT Room 2 setup.'
    ],
    expectedReduction: '12%'
  },
  {
    id: 'p7',
    departmentName: 'Laboratory',
    time: 'Now',
    message: 'Blood culture processing delay: 18 samples pending beyond 6-hour threshold.',
    severity: 'info',
    recommendedActions: [
      'Assign additional lab technician to microbiology bench.',
      'Prioritize sepsis and ICU-critical samples immediately.',
      'Flag delayed results for attending physician notification.'
    ],
    expectedReduction: '10%'
  },
  {
    id: 'p8',
    departmentName: 'Emergency Department',
    time: 'Predicted in 20 minutes',
    message: 'High pediatric triage volume incoming from road accident. Pediatric bay understaffed.',
    severity: 'danger',
    recommendedActions: [
      'Summon on-call pediatric specialist from rest quarters.',
      'Prepare 3 pediatric trauma bays with age-appropriate equipment.',
      'Alert PICU team for potential overflow admissions.'
    ],
    expectedReduction: '40%'
  }
];

export const initialDoctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Jenkins', department: 'Emergency', patientsAssigned: 8, hoursWorked: 11.5, stressScore: 88, burnoutProbability: 82, aiRecommendation: 'Mandatory shift end. Delegate current files to Dr. Chen.', status: 'critical' },
  { id: 'd2', name: 'Dr. Michael Chen', department: 'Emergency', patientsAssigned: 5, hoursWorked: 6.0, stressScore: 45, burnoutProbability: 38, aiRecommendation: 'Available for Emergency overload tasks.', status: 'stable' },
  { id: 'd3', name: 'Dr. Alisha Patel', department: 'ICU', patientsAssigned: 4, hoursWorked: 9.0, stressScore: 72, burnoutProbability: 68, aiRecommendation: 'Schedule 30-min break. Shift cover available from General rotation.', status: 'warning' },
  { id: 'd4', name: 'Dr. Robert Carter', department: 'General Ward', patientsAssigned: 15, hoursWorked: 8.0, stressScore: 50, burnoutProbability: 40, aiRecommendation: 'Normal load. Able to support wing transition.', status: 'stable' },
  { id: 'd5', name: 'Dr. Elena Rostova', department: 'Operation Theatre', patientsAssigned: 3, hoursWorked: 10.0, stressScore: 81, burnoutProbability: 75, aiRecommendation: 'Limit surgical load. Transition to diagnostics review.', status: 'critical' },
  { id: 'd6', name: 'Dr. David Kim', department: 'Radiology', patientsAssigned: 12, hoursWorked: 7.5, stressScore: 30, burnoutProbability: 25, aiRecommendation: 'Optimal workload. No action needed.', status: 'stable' },
  { id: 'd7', name: 'Dr. James Wilson', department: 'ICU', patientsAssigned: 3, hoursWorked: 5.5, stressScore: 40, burnoutProbability: 30, aiRecommendation: 'Optimal workload. Ready to cover Dr. Patel.', status: 'stable' },
  { id: 'd8', name: 'Dr. Linda Martinez', department: 'General Ward', patientsAssigned: 18, hoursWorked: 9.5, stressScore: 65, burnoutProbability: 58, aiRecommendation: 'Monitor workload. Suggest ward assistants support administrative logs.', status: 'warning' }
];

export const initialResources: ResourceItem[] = [
  { id: 'r1', name: 'Available Beds', available: 18, total: 200, unit: 'beds', status: 'warning', aiRecommendation: 'Discharge 8 ready patients from General Ward; request 5 wing transfers.' },
  { id: 'r2', name: 'Ventilators', available: 3, total: 25, unit: 'units', status: 'critical', aiRecommendation: 'Retrieve 2 standby units from Lab storage. Request backup from general regional supplier.' },
  { id: 'r3', name: 'Wheelchairs', available: 14, total: 50, unit: 'units', status: 'stable', aiRecommendation: 'No distribution change needed.' },
  { id: 'r4', name: 'ICU Beds', available: 1, total: 20, unit: 'beds', status: 'critical', aiRecommendation: 'Expedite clearance checks for 2 patients scheduled for General Ward transfer.' },
  { id: 'r5', name: 'Ambulances', available: 4, total: 12, unit: 'vehicles', status: 'stable', aiRecommendation: 'No action needed.' },
  { id: 'r6', name: 'Medical Equipment (Mobile X-Ray)', available: 1, total: 5, unit: 'units', status: 'warning', aiRecommendation: 'Relocate mobile unit 2 from Radiology to Emergency.' },
  { id: 'r7', name: 'Medicine Stock (Intravenous Flu)', available: 85, total: 1000, unit: 'vials', status: 'critical', aiRecommendation: 'Urgent: Stock level under 10%. Trigger automatic re-order from pharmacy warehouse.' }
];

export const initialBottlenecks = (deps: Department[]): BottleneckInfo[] => {
  return deps.map(d => ({
    department: d.name,
    currentWaitingTime: d.waitingTimeCurrent,
    predictedWaitingTime: d.waitingTimePredicted,
    currentCapacity: d.currentCount,
    futureCapacity: Math.round(d.currentCount * (d.id === 'er' || d.id === 'icu' ? 1.35 : 1.05)),
    riskScore: d.riskScore,
    aiSuggestions: d.id === 'er' 
      ? ['Open Triage Lane 3', 'Divert minor injuries to clinic'] 
      : d.id === 'icu'
      ? ['Transfer stable post-op to ward', 'Coordinate emergency ward setup']
      : ['Speed up cleaning operations', 'Review discharge procedures']
  }));
};

export const initialReports: ReportData[] = [
  {
    timeframe: 'daily',
    staffPerformance: [
      { name: 'Emergency Staff', score: 94, burnoutIndex: 78 },
      { name: 'ICU Staff', score: 91, burnoutIndex: 85 },
      { name: 'General Ward Staff', score: 88, burnoutIndex: 52 },
      { name: 'OR Surgical Staff', score: 96, burnoutIndex: 72 }
    ],
    patientStats: [
      { label: '08:00', count: 42, predicted: 45 },
      { label: '10:00', count: 68, predicted: 60 },
      { label: '12:00', count: 85, predicted: 80 },
      { label: '14:00', count: 92, predicted: 95 },
      { label: '16:00', count: 78, predicted: 85 },
      { label: '18:00', count: 110, predicted: 105 },
      { label: '20:00', count: 95, predicted: 90 }
    ],
    resourceUtilization: [
      { name: 'ICU Beds', utilization: 95 },
      { name: 'Ventilators', utilization: 88 },
      { name: 'OR Rooms', utilization: 85 },
      { name: 'Ambulances', utilization: 67 }
    ],
    burnoutAnalysis: [
      { department: 'Emergency', riskPercentage: 82 },
      { department: 'ICU', riskPercentage: 91 },
      { department: 'Operation Theatre', riskPercentage: 76 },
      { department: 'General Ward', riskPercentage: 45 }
    ],
    aiInsights: [
      'Emergency Department demand was 12% higher than seasonal expectations, driven by midday heat related admissions.',
      'ICU capacity remained above 90% for 14 hours. High alert is recommended for the next 24 hours.',
      'Doctor burnout probabilities rose by 8% on average due to extended shift durations in the Emergency Wing.'
    ]
  },
  {
    timeframe: 'weekly',
    staffPerformance: [
      { name: 'Emergency Staff', score: 92, burnoutIndex: 70 },
      { name: 'ICU Staff', score: 89, burnoutIndex: 82 },
      { name: 'General Ward Staff', score: 87, burnoutIndex: 48 },
      { name: 'OR Surgical Staff', score: 93, burnoutIndex: 68 }
    ],
    patientStats: [
      { label: 'Mon', count: 310, predicted: 295 },
      { label: 'Tue', count: 290, predicted: 300 },
      { label: 'Wed', count: 320, predicted: 310 },
      { label: 'Thu', count: 350, predicted: 340 },
      { label: 'Fri', count: 385, predicted: 370 },
      { label: 'Sat', count: 412, predicted: 420 },
      { label: 'Sun', count: 375, predicted: 390 }
    ],
    resourceUtilization: [
      { name: 'ICU Beds', utilization: 92 },
      { name: 'Ventilators', utilization: 80 },
      { name: 'OR Rooms', utilization: 82 },
      { name: 'Ambulances', utilization: 58 }
    ],
    burnoutAnalysis: [
      { department: 'Emergency', riskPercentage: 75 },
      { department: 'ICU', riskPercentage: 84 },
      { department: 'Operation Theatre', riskPercentage: 70 },
      { department: 'General Ward', riskPercentage: 40 }
    ],
    aiInsights: [
      'Weekend surges in emergency arrivals follow weekly averages, but response times improved by 14% due to pre-emptive staffing adjustments.',
      'Ventilator stocks faced a 2-day warning bottleneck; early redistribution prevented a localized crisis on Wednesday.',
      'Proactive rotation changes helped lower the general ward stress index by 5.4%.'
    ]
  },
  {
    timeframe: 'monthly',
    staffPerformance: [
      { name: 'Emergency Staff', score: 91, burnoutIndex: 67 },
      { name: 'ICU Staff', score: 88, burnoutIndex: 78 },
      { name: 'General Ward Staff', score: 86, burnoutIndex: 45 },
      { name: 'OR Surgical Staff', score: 92, burnoutIndex: 65 }
    ],
    patientStats: [
      { label: 'Week 1', count: 2100, predicted: 2000 },
      { label: 'Week 2', count: 2240, predicted: 2200 },
      { label: 'Week 3', count: 2450, predicted: 2350 },
      { label: 'Week 4', count: 2600, predicted: 2500 }
    ],
    resourceUtilization: [
      { name: 'ICU Beds', utilization: 88 },
      { name: 'Ventilators', utilization: 76 },
      { name: 'OR Rooms', utilization: 78 },
      { name: 'Ambulances', utilization: 52 }
    ],
    burnoutAnalysis: [
      { department: 'Emergency', riskPercentage: 68 },
      { department: 'ICU', riskPercentage: 79 },
      { department: 'Operation Theatre', riskPercentage: 65 },
      { department: 'General Ward', riskPercentage: 38 }
    ],
    aiInsights: [
      'Total patient inflow grew by 8.2% month-over-month, showing a steady upward seasonal trend in cardiac and respiratory admissions.',
      'The PulseSync redistribution system saved an estimated 142 transfer delay hours this month.',
      'Staff burnout risk decreased globally by 11% compared to the historical baseline due to AI-driven shift leveling.'
    ]
  }
];

// 2. Dynamic Hospital Data Engine Class
export class HospitalDataEngine {
  private departments: Department[];
  private kpis: KPICard[];
  private alerts: AIAlert[];
  private doctors: Doctor[];
  private resources: ResourceItem[];
  private listener: (() => void) | null = null;
  private intervalId: any = null;

  constructor() {
    this.departments = JSON.parse(JSON.stringify(initialDepartments));
    this.kpis = initialKPIs(this.departments);
    this.alerts = JSON.parse(JSON.stringify(initialAlerts));
    this.doctors = JSON.parse(JSON.stringify(initialDoctors));
    this.resources = JSON.parse(JSON.stringify(initialResources));
  }

  public startMocking() {
    this.intervalId = setInterval(() => {
      this.tick();
      if (this.listener) this.listener();
    }, 15000); // Tick every 15 seconds to simulate real-time feed
  }

  public stopMocking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public registerListener(cb: () => void) {
    this.listener = cb;
  }

  public getData() {
    return {
      departments: this.departments,
      kpis: this.kpis,
      alerts: this.alerts,
      doctors: this.doctors,
      resources: this.resources,
      bottlenecks: initialBottlenecks(this.departments)
    };
  }

  // Ticks state changes randomly for realistic movements
  private tick() {
    // 1. Update Departments occupancy
    this.departments = this.departments.map(d => {
      let count = d.currentCount;
      if (d.id === 'er') count = jitter(d.currentCount, 25, 49, 0.15);
      else if (d.id === 'icu') count = jitter(d.currentCount, 15, 20, 0.08);
      else if (d.id === 'gw') count = jitter(d.currentCount, 120, 180, 0.03);
      else count = jitter(d.currentCount, Math.round(d.capacity * 0.3), d.capacity, 0.1);

      const occupancy = Math.round((count / d.capacity) * 100);
      const status = getStatusFromValue(occupancy);
      
      // Update wait times
      const waitingTimeCurrent = jitter(d.waitingTimeCurrent, 10, 150, 0.1);
      const waitingTimePredicted = Math.round(waitingTimeCurrent * (occupancy > 80 ? 1.25 : 0.95));

      // Update trend
      const trend = [...d.trend.slice(1), occupancy];

      return {
        ...d,
        currentCount: count,
        occupancy: Math.min(100, occupancy),
        status,
        waitingTimeCurrent,
        waitingTimePredicted,
        trend,
        riskScore: Math.min(99, Math.round(occupancy * 0.95 + (waitingTimePredicted > 60 ? 10 : 0)))
      };
    });

    // 2. Update KPIs
    const er = this.departments.find(d => d.id === 'er')!;
    const icu = this.departments.find(d => d.id === 'icu')!;

    this.kpis = this.kpis.map(k => {
      if (k.id === 'patients') {
        const val = jitter(Number(k.value), 300, 420, 0.03);
        return { ...k, value: val, trend: [...k.trend.slice(1), val] };
      }
      if (k.id === 'er_queue') {
        return { ...k, value: er.currentCount, trend: er.trend };
      }
      if (k.id === 'icu_occ') {
        return { ...k, value: `${icu.occupancy}%`, trend: icu.trend };
      }
      if (k.id === 'risk_score') {
        const avgRisk = Math.round(this.departments.reduce((sum, d) => sum + d.riskScore, 0) / this.departments.length);
        return { ...k, value: avgRisk, trend: [...k.trend.slice(1), avgRisk] };
      }
      return k;
    });

    // 3. Update Doctors slightly
    this.doctors = this.doctors.map(d => {
      const assigned = jitter(d.patientsAssigned, 2, 20, 0.1);
      const hours = Number((d.hoursWorked + 0.1).toFixed(1));
      let stress = jitter(d.stressScore, 20, 95, 0.05);
      if (assigned > 10) stress = Math.min(99, stress + 3);
      if (hours > 10) stress = Math.min(99, stress + 5);

      const burnout = Math.round(stress * 0.9);
      let status: 'stable' | 'warning' | 'critical' = 'stable';
      if (burnout > 75) status = 'critical';
      else if (burnout > 55) status = 'warning';

      return {
        ...d,
        patientsAssigned: assigned,
        hoursWorked: hours,
        stressScore: stress,
        burnoutProbability: burnout,
        status
      };
    });

    // 4. Update Resources
    this.resources = this.resources.map(r => {
      if (r.id === 'r1') { // Beds
        const available = this.departments.reduce((sum, d) => sum + (d.capacity - d.currentCount), 0);
        return { ...r, available, status: available < 15 ? 'critical' : available < 35 ? 'warning' : 'stable' };
      }
      if (r.id === 'r2') { // Ventilators
        const available = jitter(r.available, 1, 8, 0.3);
        return { ...r, available, status: available <= 2 ? 'critical' : available <= 5 ? 'warning' : 'stable' };
      }
      if (r.id === 'r4') { // ICU Beds
        const icuDep = this.departments.find(d => d.id === 'icu')!;
        const available = icuDep.capacity - icuDep.currentCount;
        return { ...r, available, status: available <= 1 ? 'critical' : available <= 3 ? 'warning' : 'stable' };
      }
      return r;
    });
  }

  // 3. Simulate Emergency Trigger
  public simulateEmergency(type: 'accident' | 'outbreak' | 'mass_casualty' | 'fire' | 'flood') {
    let extraPatients = 0;
    let doctorsNeeded = 0;
    let nursesNeeded = 0;
    let bedsNeeded = 0;
    let icuNeeded = 0;
    let ambulanceAllocation = 0;
    let recoveryTime = '';
    let message = '';

    switch (type) {
      case 'accident':
        extraPatients = 25;
        doctorsNeeded = 4;
        nursesNeeded = 8;
        bedsNeeded = 12;
        icuNeeded = 4;
        ambulanceAllocation = 6;
        recoveryTime = '6 - 8 Hours';
        message = 'Major Highway Pileup (15-vehicle collision). ETA of first arrival: 5 mins.';
        break;
      case 'outbreak':
        extraPatients = 80;
        doctorsNeeded = 6;
        nursesNeeded = 18;
        bedsNeeded = 45;
        icuNeeded = 8;
        ambulanceAllocation = 4;
        recoveryTime = '48 - 72 Hours';
        message = 'Suspected Foodborne Toxin Outbreak at Local University. Patient count rising rapidly.';
        break;
      case 'mass_casualty':
        extraPatients = 120;
        doctorsNeeded = 14;
        nursesNeeded = 28;
        bedsNeeded = 60;
        icuNeeded = 18;
        ambulanceAllocation = 15;
        recoveryTime = '12 - 24 Hours';
        message = 'Industrial Explosion at Chemical Facility. Extreme respiratory and burn trauma alert.';
        break;
      case 'fire':
        extraPatients = 35;
        doctorsNeeded = 5;
        nursesNeeded = 12;
        bedsNeeded = 20;
        icuNeeded = 6;
        ambulanceAllocation = 8;
        recoveryTime = '8 - 12 Hours';
        message = 'High-rise Residential Fire in Downtown. Smoke inhalation and minor/major burn admissions.';
        break;
      case 'flood':
        extraPatients = 60;
        doctorsNeeded = 8;
        nursesNeeded = 15;
        bedsNeeded = 35;
        icuNeeded = 5;
        ambulanceAllocation = 10;
        recoveryTime = '24 - 36 Hours';
        message = 'Flash Flood in Low-lying Suburbs. Waterborne risks, hypothermia, and orthopaedic trauma.';
        break;
    }

    // Temporarily impact the live stats of Emergency and ICU
    this.departments = this.departments.map(d => {
      if (d.id === 'er') {
        const newCount = Math.min(d.capacity + 15, d.currentCount + Math.round(extraPatients * 0.6));
        return {
          ...d,
          currentCount: newCount,
          occupancy: Math.round((newCount / d.capacity) * 100),
          waitingTimeCurrent: d.waitingTimeCurrent + 45,
          waitingTimePredicted: d.waitingTimePredicted + 75,
          status: 'red',
          riskScore: 98
        };
      }
      if (d.id === 'icu') {
        const newCount = Math.min(d.capacity, d.currentCount + Math.round(icuNeeded * 0.8));
        return {
          ...d,
          currentCount: newCount,
          occupancy: Math.round((newCount / d.capacity) * 100),
          status: 'red',
          riskScore: 99
        };
      }
      return d;
    });

    // Add high severity alert
    const newAlert: AIAlert = {
      id: `emergency_${Date.now()}`,
      departmentName: 'Crisis Response Center',
      time: 'Just Now',
      message: `CRITICAL ALERT: ${message} Influx of ${extraPatients} patients expected.`,
      severity: 'danger',
      recommendedActions: [
        `Mobilize ${doctorsNeeded} doctors and ${nursesNeeded} nurses to Emergency Zone.`,
        `Clear and prep ${bedsNeeded} general beds and reserve ${icuNeeded} ICU spaces.`,
        `Divert ${ambulanceAllocation} ambulance units to coordinate active rescue loop.`,
        'Establish mass casualty triage command station at ER entrance.'
      ],
      expectedReduction: '45%'
    };

    this.alerts = [newAlert, ...this.alerts];
    
    if (this.listener) this.listener();

    return {
      extraPatients,
      doctorsNeeded,
      nursesNeeded,
      bedsNeeded,
      icuNeeded,
      ambulanceAllocation,
      recoveryTime,
      message
    };
  }

  // 4. Run AI Crisis Simulator Scenario
  public runCrisisSimulation(patientsCount: number, startHour: number, endHour: number) {

    // Calculate impacts
    const affectedDeps = ['Emergency', 'ICU', 'Radiology', 'Pharmacy'];
    const staffNeeded = Math.ceil(patientsCount / 8); // 1 doctor/nurse per 8 patients
    const bedsNeeded = Math.ceil(patientsCount * 0.4); // 40% need admission
    const icuNeeded = Math.ceil(patientsCount * 0.12); // 12% need ICU
    const simulatedRiskScore = Math.min(99, 45 + Math.round(patientsCount * 0.35));

    const recommendations = [
      `Deploy ${Math.ceil(staffNeeded * 0.4)} additional triage personnel during peak hours (${startHour}:00 - ${endHour}:00).`,
      `Establish secondary discharge lounge in General Ward to free up ${bedsNeeded} beds.`,
      `Transition ${Math.ceil(icuNeeded * 0.8)} stable step-down ICU patients to high-dependency ward.`,
      `Ramp up Lab and Radiology schedules by 30% to prevent diagnostic bottlenecks.`
    ];

    return {
      predictedOccupancy: Math.min(100, 68 + Math.round(patientsCount * 0.2)),
      staffNeeded,
      departmentsAffected: affectedDeps,
      resourceRequirement: {
        beds: bedsNeeded,
        icu: icuNeeded,
        ventilators: Math.ceil(icuNeeded * 0.5)
      },
      hospitalRiskScore: simulatedRiskScore,
      recommendedActions: recommendations
    };
  }
}

// Export single singleton instance
export const mockDataEngine = new HospitalDataEngine();
mockDataEngine.startMocking();
