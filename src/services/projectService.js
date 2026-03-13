import api from '../api/api';

const BASE_PATH = '/projects';

export const projectService = {
    getAllProjects: async () => {
        try {
            const response = await api.get(BASE_PATH);
            return response.data;
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    },

    createProject: async (projectData) => {
        try {
            const response = await api.post(BASE_PATH, projectData);
            return response.data;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    updateProject: async (id, projectData) => {
        try {
            const response = await api.put(`${BASE_PATH}/${id}`, projectData);
            return response.data;
        } catch (error) {
            console.error(`Error updating project ${id}:`, error);
            throw error;
        }
    },

    deleteProject: async (id) => {
        try {
            const response = await api.delete(`${BASE_PATH}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting project ${id}:`, error);
            throw error;
        }
    },

    getProjectById: async (id) => {
        try {
            const response = await api.get(`${BASE_PATH}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching project ${id}:`, error);
            throw error;
        }
    }
};
