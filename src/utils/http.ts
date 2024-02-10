/* eslint-disable @typescript-eslint/no-explicit-any */
import Axios, { AxiosRequestConfig } from 'axios';

const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_URL_DEV,
});

axios.interceptors.request.use(
  (config) => {
    if (!config.headers) return config;

    const token = localStorage.getItem('pick-toss-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);

export const http = {
  get: <Response = unknown>(url: GetApiPath, config?: AxiosRequestConfig) => {
    return axios.get<Response>(url, config).then((res) => res.data);
  },
  post: <Request = any, Response = unknown>(url: PostApiPath, body?: Request, config?: AxiosRequestConfig) => {
    return axios.post<Response>(url, body, config).then((res) => res.data);
  },
  patch: <Request = any, Response = unknown>(url: PatchApiPath, body?: Request, config?: AxiosRequestConfig) => {
    return axios.patch<Response>(url, body, config).then((res) => res.data);
  },
  delete: <Response = unknown>(url: DeleteApiPath, config?: AxiosRequestConfig) => {
    return axios.delete<Response>(url, config).then((res) => res.data);
  },
};

type GetApiPath =
  | '/categories'
  | `/categories/${number}/documents`
  | `/documents/${number}`
  | `/categories/${number}/documents/questions`;

type PostApiPath = '/categories' | '/documents';

type PatchApiPath = `/categories/${number}`;

type DeleteApiPath = `/categories/${number}`;