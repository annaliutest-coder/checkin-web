
export interface CheckInData {
  email: string;
  timestamp: string;
  id: string;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
