import API from "./api";

export const joinRide            = (rideId) => API.post(`/bookings/${rideId}`);
export const getMyBookings       = ()       => API.get("/bookings/my");
export const getRideParticipants = (rideId) => API.get(`/bookings/ride/${rideId}`);
export const getRideHistory      = ()       => API.get("/bookings/history");
export const acceptRequest       = (bookingId) => API.put(`/bookings/${bookingId}/accept`);
export const rejectRequest       = (bookingId) => API.put(`/bookings/${bookingId}/reject`);
