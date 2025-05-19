import request from '@/utils/request';

export function getCategories() {
  return request({
    url: '/api/categories',
    method: 'get'
  });
}

export function getCategoryById(id) {
  return request({
    url: `/categories/${id}`,
    method: 'get'
  });
}