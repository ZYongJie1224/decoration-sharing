import request from '@/utils/request';

export function getUserMaterials(params) {
  return request({
    url: '/user/materials',
    method: 'get',
    params
  });
}

export function getUserFavorites(params) {
  return request({
    url: '/user/favorites',
    method: 'get',
    params
  });
}