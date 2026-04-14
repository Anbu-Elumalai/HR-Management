import api from '../api/api';

const BASE_PATH = '/candidates';

export const candidateService = {
    getAllCandidates: async (page = 0, limit = 10, filters = {}) => {
        try {
            const queryParams = new URLSearchParams({
                page,
                limit,
                search: filters.search || '',
                candidateId: filters.candidateId || '',
                name: filters.name || '',
                status: filters.status || '',
                appliedFor: filters.role || filters.appliedFor || '',
                departmentId: filters.departmentId || ''
            }).toString();
            
            const response = await api.get(`${BASE_PATH}?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching candidates:", error);
            throw error;
        }
    },

    getCandidateById: async (id) => {
        try {
            const response = await api.get(`${BASE_PATH}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching candidate ${id}:`, error);
            throw error;
        }
    },

    createCandidate: async (candidateData) => {
        try {
            const response = await api.post(BASE_PATH, candidateData);
            return response.data;
        } catch (error) {
            console.error("Error creating candidate:", error);
            throw error;
        }
    },

    updateCandidate: async (id, candidateData) => {
        try {
            const response = await api.put(`${BASE_PATH}/${id}`, candidateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating candidate ${id}:`, error);
            throw error;
        }
    },

    deleteCandidate: async (id) => {
        try {
            const response = await api.delete(`${BASE_PATH}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting candidate ${id}:`, error);
            throw error;
        }
    }
};
