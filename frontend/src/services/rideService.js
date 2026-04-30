import API from "./api";

export const createRide   = (data)   => API.post("/rides", data);
export const getAllRides   = (params) => API.get("/rides", { params });
export const getRideById  = (id)     => API.get(`/rides/${id}`);
export const updateRide   = (id, data) => API.put(`/rides/${id}`, data);
export const deleteRide   = (id)     => API.delete(`/rides/${id}`);
export const getMyRides   = ()       => API.get("/rides/my");
