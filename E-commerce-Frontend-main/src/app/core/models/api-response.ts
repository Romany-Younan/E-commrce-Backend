export interface ApiResponse<T> {
  status: string;
  data: T;
  results?: number;
  total?: number;
}
