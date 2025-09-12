export default {
    currentCampaignId: (state) => state.currentCampaignId || null,
    currentCampaignName: (state) => state.currentCampaignName || '',
    campaignsMeta: (state) => state.campaignsMeta || [],
    showCampaignOverlay: (state) => !!state.showCampaignOverlay,
};
