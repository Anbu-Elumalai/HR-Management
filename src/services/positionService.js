
import api from '../api/api';

const BASE_PATH = '/positions';

export const positionService = {
    getAllPositions: async () => {
        try {
            const response = await api.get(BASE_PATH);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error fetching positions:", error);
            return [
            ];
        }
    }
};
