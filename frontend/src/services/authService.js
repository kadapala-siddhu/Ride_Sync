import API from "./api";

export const registerProvider = (data) => API.post("/auth/register/provider", data);
export const registerSeeker   = (data) => API.post("/auth/register/seeker",   data);
export const login            = (data) => API.post("/auth/login",              data);
export const getProfile       = ()     => API.get("/auth/profile");
export const updateProfile    = (data) => API.put("/auth/profile",             data);
export const deleteAccount    = ()     => API.delete("/auth/profile");
