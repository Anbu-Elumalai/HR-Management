
import api from '../api/api';

const BASE_PATH = '/departments';

export const departmentService = {
    getAllDepartments: async () => {
        try {
            const response = await api.get(BASE_PATH);
            // Handle paginated response structure { data: [...] }
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error fetching departments:", error);
            return [

            ];
        }
    }
};
