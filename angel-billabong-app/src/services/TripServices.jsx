import api from "./api";

// GET all trips
export const getTrips = () => api.get("/trips");

// GET detail trip
export const getTripById = (id) => api.get(`/trips/${id}`);

// POST create trip
export const createTrip = (data) => api.post("/trips", data);

// UPDATE trip
export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);

// DELETE trip
export const deleteTrip = (id) => api.delete(`/trips/${id}`);