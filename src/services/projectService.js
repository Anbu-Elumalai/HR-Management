import api from '../api/api';

const BASE_PATH = 'http://localhost:5002/api/projects';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const projectService = {
    getAllProjects: async (page = 0, limit = 5, filters = {}) => {
        try {
            const params = new URLSearchParams({ limit, page });
            if (filters.name) params.append('name', filters.name);
            if (filters.manager) params.append('manager', filters.manager);
            if (filters.location) params.append('location', filters.location);
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`${BASE_PATH}/?${params.toString()}`, getHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    },

    createProject: async (projectData) => {
        try {
            const response = await api.post(`${BASE_PATH}/`, projectData, getHeaders());
            return response.data;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    updateProject: async (id, projectData) => {
        try {
            const response = await api.put(`${BASE_PATH}/${id}`, projectData, getHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error updating project ${id}:`, error);
            throw error;
        }
    },

    deleteProject: async (id) => {
        try {
            const response = await api.delete(`${BASE_PATH}/${id}`, getHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error deleting project ${id}:`, error);
            throw error;
        }
    },

    getProjectById: async (id) => {
        try {
            const response = await api.get(`${BASE_PATH}/${id}`, getHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching project ${id}:`, error);
            throw error;
        }
    }
};
