export type IMotivationalMessageFilters = {
  search?: string;
  status?: "active" | "delete";
};

export type ICreateMotivationalMessagePayload = {
  message: string;
  author?: string | null;
};

export type IUpdateMotivationalMessagePayload = {
  message?: string;
  author?: string | null;
  status?: "active" | "delete";
};
