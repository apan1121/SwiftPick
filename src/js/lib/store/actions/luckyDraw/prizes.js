export default {
    setPrizes({ commit, dispatch }, prizes){
        commit('setPrizes', prizes);
        dispatch('saveToStorage');
    },
    addPrize({ commit, dispatch }, prize){
        commit('addPrize', prize);
        dispatch('saveToStorage');
    },
    updatePrize({ commit, dispatch }, payload){
        commit('updatePrize', payload);
        dispatch('saveToStorage');
    },
    removePrize({ commit, dispatch }, id){
        commit('removePrize', id);
        dispatch('saveToStorage');
    },
    addWinnersToPrize({ commit, dispatch }, payload){
        commit('addWinnersToPrize', payload);
        dispatch('saveToStorage');
    },
    removeWinnersFromPrize({ commit, dispatch }, payload){
        commit('removeWinnersFromPrize', payload);
        dispatch('saveToStorage');
    },
    clearPrizeWinners({ commit, dispatch }, prizeId){
        commit('clearPrizeWinners', prizeId);
        dispatch('saveToStorage');
    },
};
