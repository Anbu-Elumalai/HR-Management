
import api from '../api/api';

const BASE_PATH = '/employees/';

export const employeeService = {
    getAllEmployees: async () => {
        try {
            const response = await api.get(BASE_PATH);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error fetching employees:", error);
            // Fallback mock data for testing/demo
            return [

            ];
        }
    }
};
