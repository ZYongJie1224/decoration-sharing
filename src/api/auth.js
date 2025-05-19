import request from '@/utils/request';

export function login(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  });
}

export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  });
}

export function getProfile() {
  return request({
    url: '/auth/profile',
    method: 'get'
  });
}

export function updateProfile(data) {
  return request({
    url: '/auth/profile',
    method: 'put',
    data
  });
}