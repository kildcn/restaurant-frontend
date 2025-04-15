import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle token expiration or unauthorized access
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      // Only redirect to login if not already on login page to avoid infinite loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export const api = {
  get: (url) => axiosInstance.get(url),
  post: (url, data) => axiosInstance.post(url, data),
  put: (url, data) => axiosInstance.put(url, data),
  delete: (url) => axiosInstance.delete(url)
};

// Restaurant specific API functions
export const restaurantApi = {
  getSettings: () => api.get('/restaurant'),
  getAvailability: (date, time, partySize, duration) =>
    api.post('/bookings/check-availability', { date, time, partySize, duration }),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  cancelBooking: (id) => api.put(`/bookings/${id}/status`, { status: 'cancelled' }),
  lookupBooking: (reference, email) => api.post('/bookings/lookup', { reference, email })
};

// Admin API functions
export const adminApi = {
  // Tables
  getTables: () => api.get('/tables'),
  createTable: (tableData) => api.post('/tables', tableData),
  updateTable: (id, tableData) => api.put(`/tables/${id}`, tableData),
  deleteTable: (id) => api.delete(`/tables/${id}`),
  getTableAvailability: (date) => api.get(`/tables/availability/${date}`),

  // Bookings
  getAllBookings: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return api.get(`/bookings?${params}`);
  },
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),

  // Users
  getUsers: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return api.get(`/users?${params}`);
  },
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Restaurant settings
  getSettings: () => api.get('/restaurant'),
  updateRestaurantSettings: (settings) => api.put('/restaurant', settings),
  updateOpeningHours: (openingHours) => api.put('/restaurant/opening-hours', { openingHours }),
  addSpecialEvent: (event) => api.post('/restaurant/special-events', event),
  addClosedDate: (closedDate) => api.post('/restaurant/closed-dates', closedDate),
  updateBookingRules: (rules) => api.put('/restaurant/booking-rules', rules)
};

export default api;
