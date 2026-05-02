import Axios from "axios";

export const baseURL = import.meta.env.VITE_API_URL;

export const httpClient = Axios.create({
  baseURL:baseURL,
});