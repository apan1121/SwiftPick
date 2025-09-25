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
    setAnonymizeName({ commit, dispatch }, flag){
        commit('setAnonymizeName', flag);
        dispatch('saveToStorage');
    },
    setAnonymizeNickname({ commit, dispatch }, flag){
        commit('setAnonymizeNickname', flag);
        dispatch('saveToStorage');
    },
    setAnonymizeParticipants({ commit, dispatch }, flag){
        commit('setAnonymizeParticipants', flag);
        dispatch('saveToStorage');
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
