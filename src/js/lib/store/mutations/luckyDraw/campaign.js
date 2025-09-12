export default {
    setCurrentCampaign(state, { id, name }){
        state.currentCampaignId = id || null;
        state.currentCampaignName = name || '';
    },
    setCampaignsMeta(state, list){
        state.campaignsMeta = Array.isArray(list) ? list : [];
    },
    upsertCampaignMeta(state, meta){
        const list = Array.isArray(state.campaignsMeta) ? state.campaignsMeta.slice() : [];
        const idx = list.findIndex(m => m.id === meta.id);
        if (idx === -1) list.push(meta);
        else list.splice(idx, 1, { ...list[idx], ...meta });
        state.campaignsMeta = list;
    },
    removeCampaignMeta(state, id){
        state.campaignsMeta = (state.campaignsMeta || []).filter(m => m.id !== id);
    },
    setShowCampaignOverlay(state, val){
        state.showCampaignOverlay = !!val;
    },
};
