export default {
    setPrizes(state, prizes){
        state.prizes = Array.isArray(prizes) ? prizes : [];
    },
    addPrize(state, prize){
        state.prizes.push(prize);
    },
    updatePrize(state, payload){
        const idx = state.prizes.findIndex(p => p.id === payload.id);
        if (idx !== -1) state.prizes.splice(idx, 1, { ...state.prizes[idx], ...payload });
    },
    removePrize(state, id){
        state.prizes = state.prizes.filter(p => p.id !== id);
    },
    addWinnersToPrize(state, { prizeId, winners }){
        const prize = state.prizes.find(p => p.id === prizeId);
        if (!prize) return;
        const set = new Set(prize.winners || []);
        (winners || []).forEach(w => set.add(w));
        prize.winners = Array.from(set);
    },
    removeWinnersFromPrize(state, { prizeId, winnerIds }){
        const prize = state.prizes.find(p => p.id === prizeId);
        if (!prize) return;
        const removeSet = new Set(winnerIds || []);
        prize.winners = (prize.winners || []).filter(id => !removeSet.has(id));
    },
    clearPrizeWinners(state, prizeId){
        const prize = state.prizes.find(p => p.id === prizeId);
        if (prize) prize.winners = [];
    },
};
