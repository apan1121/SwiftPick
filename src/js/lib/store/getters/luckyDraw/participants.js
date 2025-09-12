export default {
    participants: (state) => state.participants || [],
    totalParticipants: (state) => (state.participants || []).length,
    searchTerm: (state) => state.searchTerm || '',
};

