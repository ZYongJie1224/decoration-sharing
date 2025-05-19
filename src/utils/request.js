import axios from 'axios';

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 确保baseURL正确
  timeout: 15000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果有token就在header中添加
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 重要：不要修改FormData内容
    if (config.data instanceof FormData) {
      // 对于FormData，不要让axios或其他拦截器修改content-type
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('响应错误:', error);
    return Promise.reject(error);
  }
);

export default request;