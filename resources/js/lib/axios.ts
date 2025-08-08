import axios from 'axios';
import { toast } from 'sonner';
import { getCsrfToken } from './utils';

const instance = axios.create({
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Attach CSRF token if present
instance.interceptors.request.use((config) => {
  const token = getCsrfToken();
  if (token) {
    config.headers = config.headers ?? {};
    // @ts-expect-error axios header index
    config.headers['X-CSRF-TOKEN'] = token;
  }
  return config;
});

// Global response handling
instance.interceptors.response.use(
  (response) => {
    const message = (response.data && (response.data.message || response.data.success)) || 'Success';
    if (message) {
      toast.success(String(message));
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    let message: string = 'Something went wrong';
    if (data?.message) message = data.message;
    else if (status === 419) message = 'CSRF token mismatch. Please refresh the page.';
    else if (status === 422) message = 'Validation failed. Please check the form.';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default instance;


