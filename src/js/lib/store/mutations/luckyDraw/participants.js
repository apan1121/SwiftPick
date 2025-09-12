export default {
    setParticipants(state, list){
        state.participants = Array.isArray(list) ? list : [];
    },
    clearParticipants(state){
        state.participants = [];
    },
    setSearchTerm(state, term){
        state.searchTerm = term || '';
    },
    markWinners(state, winnerIds){
        const set = new Set(winnerIds || []);
        state.participants = state.participants.map(p => ({ ...p, isWinner: set.has(p.id) || p.isWinner }));
    },
    unmarkWinners(state, winnerIds){
        const set = new Set(winnerIds || []);
        state.participants = state.participants.map(p => (set.has(p.id) ? { ...p, isWinner: false } : p));
    },
};
