export interface IMotivationalMessageFilters {
  search?: string;
  status?: "active" | "delete";
}

export interface ICreateMotivationalMessagePayload {
  message: string;
  author?: string | null;
}

export interface IUpdateMotivationalMessagePayload {
  message?: string;
  author?: string | null;
  status?: "active" | "delete";
}
