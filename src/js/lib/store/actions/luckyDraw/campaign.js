import {
    getCampaignsMeta,
    setCampaignsMeta,
    getCurrentCampaignId,
    setCurrentCampaignId,
    loadCampaign,
    saveCampaign,
    deleteCampaign as storageDeleteCampaign,
    saveAll,
} from 'services/storage';

const uid = () => `camp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export default {
    async initCampaigns({ dispatch, commit }){
        await dispatch('loadCampaignsMeta');
        // 每次初次進入一律顯示全遮罩，強制選擇/新增活動
        commit('setShowCampaignOverlay', true);
        // 若無活動但偵測到舊版資料，建立為一個可供選擇的活動，但不自動選取
        const meta = await getCampaignsMeta();
        if (!meta || meta.length === 0) {
            try {
                const legacy = await (await import('services/storage')).loadAll();
                const hasLegacy = (legacy && ((legacy.prizes || []).length || (legacy.participants || []).length));
                if (hasLegacy) {
                    const id = uid();
                    const now = new Date().toISOString();
                    const newMeta = [{ id, name: '從舊版匯入', createdAt: now, updatedAt: now }];
                    await setCampaignsMeta(newMeta);
                    await saveCampaign(id, {
                        prizes: legacy.prizes || [],
                        participants: legacy.participants || [],
                        currentPrizeId: legacy.currentPrizeId || null,
                    });
                    commit('setCampaignsMeta', newMeta);
                }
            } catch (e) {}
        }
    },
    async loadCampaignsMeta({ commit }){
        const meta = await getCampaignsMeta();
        commit('setCampaignsMeta', meta);
    },
    openCampaignOverlay({ commit }){
        commit('setShowCampaignOverlay', true);
    },
    closeCampaignOverlay({ commit }){
        commit('setShowCampaignOverlay', false);
    },
    async createCampaign({ commit, dispatch }, name){
        const id = uid();
        const now = new Date().toISOString();
        const meta = { id, name: name || '未命名活動', createdAt: now, updatedAt: now };
        const list = await getCampaignsMeta();
        list.push(meta);
        await setCampaignsMeta(list);
        await saveCampaign(id, { prizes: [], participants: [], currentPrizeId: null });
        await setCurrentCampaignId(id);
        commit('setCampaignsMeta', list);
        commit('setCurrentCampaign', { id, name: meta.name });
        // 清空目前 store 的抽獎資料
        commit('setPrizes', []);
        commit('setParticipants', []);
        commit('setCurrentPrizeId', null);
        commit('setShowCampaignOverlay', false);
    },
    async loadCampaignById({ commit }, id){
        const metaList = await getCampaignsMeta();
        const meta = metaList.find(m => m.id === id) || { id, name: '' };
        const data = await loadCampaign(id);
        commit('setCurrentCampaign', { id, name: meta.name || '' });
        commit('setPrizes', Array.isArray(data.prizes) ? data.prizes : []);
        commit('setParticipants', Array.isArray(data.participants) ? data.participants : []);
        commit('setCurrentPrizeId', data.currentPrizeId || null);
        await setCurrentCampaignId(id);
        commit('setShowCampaignOverlay', false);
    },
    async saveToStorage({ state, getters }){
        // Overwrite default save: prefer campaign-aware save
        if (state.currentCampaignId) {
            await saveCampaign(state.currentCampaignId, {
                prizes: state.prizes || [],
                participants: state.participants || [],
                currentPrizeId: state.currentPrizeId || null,
            });
            // update meta.updatedAt
            const list = await getCampaignsMeta();
            const idx = list.findIndex(m => m.id === state.currentCampaignId);
            if (idx !== -1) {
                list[idx] = { ...list[idx], updatedAt: new Date().toISOString() };
                await setCampaignsMeta(list);
            }
        } else {
            await saveAll(state);
        }
    },
    async deleteCampaign({ state, commit }, id){
        await storageDeleteCampaign(id);
        commit('removeCampaignMeta', id);
        if (state.currentCampaignId === id) {
            commit('setCurrentCampaign', { id: null, name: '' });
            // 保留現有 store 的資料，但解除關聯
        }
    },
    async renameCampaign({ state, commit }, { id, name }){
        const list = await getCampaignsMeta();
        const idx = list.findIndex(m => m.id === id);
        if (idx !== -1) {
            list[idx] = { ...list[idx], name: name || list[idx].name, updatedAt: new Date().toISOString() };
            await setCampaignsMeta(list);
            commit('setCampaignsMeta', list);
            if (state.currentCampaignId === id) commit('setCurrentCampaign', { id, name });
        }
    },
};
