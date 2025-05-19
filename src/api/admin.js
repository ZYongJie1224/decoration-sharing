import request from '@/utils/request';

export function getUsers(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  });
}

export function updateUser(id, data) {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  });
}

export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  });
}

export function getMaterials(params) {
  return request({
    url: '/admin/materials',
    method: 'get',
    params
  });
}

export function getPendingMaterials(params) {
  return request({
    url: '/admin/materials/pending',
    method: 'get',
    params
  });
}

export function approveMaterial(id) {
  return request({
    url: `/admin/materials/${id}/approve`,
    method: 'put'
  });
}

export function rejectMaterial(id, data) {
  return request({
    url: `/admin/materials/${id}/reject`,
    method: 'put',
    data
  });
}

export function deleteMaterial(id) {
  return request({
    url: `/admin/materials/${id}`,
    method: 'delete'
  });
}

export function createCategory(data) {
  return request({
    url: '/admin/categories',
    method: 'post',
    data
  });
}

export function updateCategory(id, data) {
  return request({
    url: `/admin/categories/${id}`,
    method: 'put',
    data
  });
}

export function deleteCategory(id) {
  return request({
    url: `/admin/categories/${id}`,
    method: 'delete'
  });
}

export function getStats() {
  return request({
    url: '/admin/stats',
    method: 'get'
  });
}