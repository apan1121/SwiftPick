export default {
    setParticipants({ commit, dispatch }, list){
        commit('setParticipants', list);
        dispatch('saveToStorage');
    },
    clearParticipants({ commit, dispatch }){
        commit('clearParticipants');
        dispatch('saveToStorage');
    },
    setSearchTerm({ commit }, term){
        commit('setSearchTerm', term);
    },
    markWinners({ commit, dispatch }, winnerIds){
        commit('markWinners', winnerIds);
        dispatch('saveToStorage');
    },
    unmarkWinners({ commit, dispatch }, winnerIds){
        commit('unmarkWinners', winnerIds);
        dispatch('saveToStorage');
    },
};
