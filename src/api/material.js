import request from '@/utils/request';

export function getMaterials(params) {
    return request({
        url: '/materials',
        method: 'get',
        params
    });
}

export function getMaterialById(id) {
    return request({
        url: `/materials/${id}`,
        method: 'get'
    });
}

export function searchMaterials(params) {
    return request({
        url: '/materials/search',
        method: 'get',
        params
    });
}

export function uploadMaterial(data) {
    return request({
        url: '/api/materials',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        transformRequest: [function (data) {
            return data; // 不做任何处理，保持原始FormData格式
        }]
    });
}

export function toggleFavorite(id) {
    return request({
        url: `/materials/${id}/favorite`,
        method: 'post'
    });
}

// 获取指定分类的材料
export function getMaterialsByCategory(categoryId, params) {
    return request({
        url: `/categories/${categoryId}/materials`,
        method: 'get',
        params
    });
}

// 删除材料
export function deleteMaterial(id) {
    return request({
        url: `/materials/${id}`,
        method: 'delete'
    });
}

// 更新材料
export function updateMaterial(id, data) {
    return request({
        url: `/materials/${id}`,
        method: 'put',
        data
    });
}