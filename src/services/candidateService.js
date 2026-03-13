import api from '../api/api';

const BASE_PATH = '/candidates';

export const candidateService = {
    getAllCandidates: async () => {
        try {
            const response = await api.get(BASE_PATH);
            return response.data;
        } catch (error) {
            console.error("Error fetching candidates:", error);
            // Return mock data if backend fails
            return [
                {
                    id: 'CAN001',
                    name: 'Michael Scott',
                    email: 'michael.scott@example.com',
                    phone: '555-0101',
                    location: 'Scranton',
                    role: 'Manager',
                    status: 'Hired'
                },
                {
                    id: 'CAN002',
                    name: 'Dwight Schrute',
                    email: 'dwight.schrute@example.com',
                    phone: '555-0102',
                    location: 'Scranton',
                    role: 'Sales',
                    status: 'Hired'
                },
                {
                    id: 'CAN003',
                    name: 'Jim Halpert',
                    email: 'jim.halpert@example.com',
                    phone: '555-0103',
                    location: 'Stamford',
                    role: 'Sales',
                    status: 'Interviewing'
                }
            ];
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
    }
};
