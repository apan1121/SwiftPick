export default {
    prizes: (state) => state.prizes || [],
    totalPrizeQuantity: (state) => (state.prizes || []).reduce((sum, p) => sum + (p.quantity || 0), 0),
    currentPrize: (state) => (state.prizes || []).find(p => p.id === state.currentPrizeId) || null,
};

