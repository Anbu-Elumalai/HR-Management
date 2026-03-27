
import api from '../api/api';

const BASE_PATH = '/admin-users';

export const employeeService = {
    getAllEmployees: async () => {
        try {
            const response = await api.get(BASE_PATH + '?limit=1000');
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching employees:", error);
            // Fallback mock data for testing/demo
            return [

            ];
        }
    }
};
