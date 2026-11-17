export interface ProfilePillar {
  index: string;
  title: string;
  detail: string;
}

export interface PortfolioProfile {
  name: string;
  shortName: string;
  headline: string;
  role: string;
  specialization: string;
  university: string;
  location: string;
  githubUrl: string;
  liveUrl: string;
  bioLead: string;
  bioBody: string;
  pillars: ProfilePillar[];
}

export interface SkillMatrixItem {
  name: string;
  projectCount: number;
  linkedProjects: string[];
}

export interface SkillMatrixGroup {
  id: string;
  category: string;
  focus: string;
  items: SkillMatrixItem[];
  totalReferences: number;
}

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: string;
  domain: string;
  summary: string;
  skillsUsed: string[];
  analyzerKey: 'food' | 'traffic' | 'aqi' | 'ambulance';
  metricsLabel: string;
}

export interface EducationInfo {
  status: string;
  degree: string;
  field: string;
  institution: string;
  location: string;
}

export interface CertificateItem {
  id: string;
  issuer: string;
  date: string;
  title: string;
  credentialFile: string;
  url: string;
  topics: string[];
}

export interface PortfolioData {
  generatedAt: string;
  processor: string;
  profile: PortfolioProfile;
  education: EducationInfo;
  skillMatrix: SkillMatrixGroup[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  interests: string[];
  summary: {
    totalProjects: number;
    pythonBackedProjects: number;
    totalSkillTopics: number;
    verifiedCertificates: number;
    domainBreakdown: Record<string, number>;
  };
}

export interface FoodAnalysisResult {
  engine: string;
  item: string;
  score: number;
  grade: string;
  verdict: string;
  calories: number;
  estimatedGlycemicLoad: number;
  macroSharePct: {
    protein: number;
    carbs: number;
    fat: number;
  };
  insights: string[];
  presets: string[];
}

export interface TrafficOptimizationResult {
  engine: string;
  optimalCycleSec: number;
  effectiveGreenSec: number;
  totalFlowRatioY: number;
  phases: Array<{
    phase: string;
    criticalFlowVph: number;
    flowRatio: number;
    allocatedGreenSec: number;
    saturationPct: number;
  }>;
  avgOptimizedDelaySec: number;
  avgFixedBaselineDelaySec: number;
  delayReductionPct: number;
}

export interface AqiAnalysisResult {
  engine: string;
  city: string;
  aqi: number;
  category: string;
  dominantPollutant: string;
  inputs: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
  };
  nationalBenchmark: {
    meanAqi: number;
    medianAqi: number;
    stdDevAqi: number;
    pm25No2PearsonR: number;
  };
  cityComparison: Array<{
    city: string;
    aqi: number;
    category: string;
    dominantPollutant: string;
    pm25: number;
  }>;
}

export interface AmbulanceRouteResult {
  engine: string;
  origin: string;
  destination: string;
  route: string[];
  intersectionsPreempted: number;
  normalTransitMin: number;
  greenWaveTransitMin: number;
  timeSavedSec: number;
  timeSavedPct: number;
}

export interface LanguageShare {
  language: string;
  bytes: number;
  percentage: number;
}

export interface RepoLanguageReport {
  repository: string;
  githubUrl: string;
  pagesUrl: string;
  source: string;
  current: {
    totalBytes: number;
    languages: LanguageShare[];
  };
  projected: {
    totalBytes: number;
    pythonSharePct: number;
    targetMet: boolean;
    languages: LanguageShare[];
  };
  pythonModules: Array<{
    path: string;
    bytes: number;
  }>;
}

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  receivedAt: string;
}
