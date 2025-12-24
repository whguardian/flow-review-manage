
export interface InspectionItem {
  id: string;
  originalName: string;
  displayName: string;
}

export interface ProcessBaseInfo {
  id: string;
  code: string;
  name: string;
  version: string;
  description: string;
  isCheckActive: boolean;
  inspectionItems: InspectionItem[];
}

export interface ProcessSummary {
  id: string;
  code: string;
  name: string;
  version: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
