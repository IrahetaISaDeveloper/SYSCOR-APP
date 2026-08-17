import apiClient from "./apiClient";

export const fetchAllTables = async () => {
  const { data } = await apiClient.get("/tables");
  return data;
};

export const createTable = async ({ number, status }) => {
  const { data } = await apiClient.post("/tables", { number, status });
  return data;
};

export const updateTableFull = async (id, { number, status }) => {
  const { data } = await apiClient.put(`/tables/${id}`, { number, status });
  return data;
};

export const deleteTableById = async (id) => {
  const { data } = await apiClient.delete(`/tables/${id}`);
  return data;
};
