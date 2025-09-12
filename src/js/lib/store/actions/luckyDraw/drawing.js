export default {
    setCurrentPrizeId({ commit, dispatch }, prizeId){
        commit('setCurrentPrizeId', prizeId);
        dispatch('saveToStorage');
    },
    startDrawing({ commit }){
        commit('setDrawingStatus', true);
    },
    pauseDrawing({ commit }){
        commit('setDrawingStatus', false);
    },
    setSpeed({ commit }, speed){
        commit('setSpeed', speed);
    },
    incrementLightCount({ commit }){
        commit('incrementLightCount');
    },
    resetDrawing({ commit }){
        commit('resetDrawing');
    },
};
