import api from '../api/api';

const BASE_PATH = '/locations';

export const locationService = {
    getAllLocations: async () => {
        try {
            const response = await api.get(BASE_PATH);
            // Handle both paginated response structure { data: [...] } and direct array
            const data = response.data.data || response.data;
            
            // Map locations to { value, label } format
            if (Array.isArray(data)) {
                return data.map(location => ({
                    value: location.id || location._id || location.name || location,
                    label: location.name || location
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching locations:", error);
            return [];
        }
    },

    getLocationById: async (id) => {
        try {
            const response = await api.get(`${BASE_PATH}/${id}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error fetching location:", error);
            return null;
        }
    },

    createLocation: async (locationData) => {
        try {
            const response = await api.post(BASE_PATH, locationData);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error creating location:", error);
            throw error;
        }
    },

    updateLocation: async (id, locationData) => {
        try {
            const response = await api.put(`${BASE_PATH}/${id}`, locationData);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error updating location:", error);
            throw error;
        }
    },

    deleteLocation: async (id) => {
        try {
            await api.delete(`${BASE_PATH}/${id}`);
            return true;
        } catch (error) {
            console.error("Error deleting location:", error);
            throw error;
        }
    }
};
