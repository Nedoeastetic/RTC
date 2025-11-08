export interface Prediction {
  sku: string;
  days_until_stockout: number;
  recommended_order: number;
  confidence_score: number;
  critical_level: "CRITICAL" | "MEDIUM" | "OK";
  warehouse_code: string;
  last_updated: number;
}

export interface CriticalityResponse {
  status: "ok" | "error";
  warehouse_code: string;
  criticality?: string;
  predictions?: Prediction[];
  data?: {
    CRITICAL: Prediction[];
    MEDIUM: Prediction[];
    OK: Prediction[];
  };
  message?: string;
}