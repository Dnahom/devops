import axios from "axios";
import Cookies from "js-cookie";

// Update backend URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

const httpClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Intercept the request and add JWT token
httpClient.interceptors.request.use(
  function (config) {
    const token = Cookies.get("sh_token") || null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Auth APIs
export const getCurrentUser = () => httpClient.get("/user/me");
export const loginUser = (formData) => httpClient.post("/user/login", formData);
export const registerUser = (formData) => httpClient.post("/user/register", formData);

// Product APIs
export const getAllProducts = () => httpClient.get("/products");
export const addProduct = (formData) => httpClient.post("/products", formData);
export const deleteProduct = (id) => httpClient.delete(`/products/${id}`);

// Cart APIs
export const createCart = (data) => httpClient.post("/cart", data);
export const getCartHistory = () => httpClient.get("/cart");
export const getCartHistoryById = (id) => httpClient.get(`/cart/${id}`);

// Statistics APIs
export const getTopCategory = () => httpClient.get("/cart/topcategory");
export const getTopProduct = () => httpClient.get("/cart/topproduct");
