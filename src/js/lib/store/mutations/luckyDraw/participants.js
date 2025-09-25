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
    setAnonymizeName(state, flag){
        state.anonymizeName = !!flag;
    },
    setAnonymizeNickname(state, flag){
        state.anonymizeNickname = !!flag;
    },
    setAnonymizeParticipants(state, flag){
        // Backward compatibility: toggle both fields simultaneously
        state.anonymizeName = !!flag;
        state.anonymizeNickname = !!flag;
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
