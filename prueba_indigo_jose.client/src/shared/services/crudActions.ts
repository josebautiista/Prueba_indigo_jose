import apiClient from "./apiClient";

export async function getItems<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await apiClient.get<T[]>(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error in getItems (${endpoint}):`, error);
    throw error;
  }
}

export async function getItem<T>(endpoint: string): Promise<T> {
  try {
    const response = await apiClient.get<T>(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error in getItem (${endpoint}):`, error);
    throw error;
  }
}

export async function getItemById<T>(
  endpoint: string,
  id: string | number
): Promise<T> {
  try {
    const response = await apiClient.get<T>(`${endpoint}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getItemById (${endpoint}/${id}):`, error);
    throw error;
  }
}

export async function postItem<TRequest, TResponse = TRequest>(
  endpoint: string,
  data: TRequest
): Promise<TResponse> {
  try {
    const response = await apiClient.post<TResponse>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error in postItem (${endpoint}):`, error);
    throw error;
  }
}

export async function updateItem<T>(
  endpoint: string,
  id: string | number,
  data: T
): Promise<T> {
  try {
    const response = await apiClient.put<T>(`${endpoint}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error in updateItem (${endpoint}/${id}):`, error);
    throw error;
  }
}

export async function deleteItem(
  endpoint: string,
  id: string | number
): Promise<boolean> {
  try {
    await apiClient.delete(`${endpoint}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error in deleteItem (${endpoint}/${id}):`, error);
    throw error;
  }
}
