import prizes from './prizes';
import participants from './participants';
import drawing from './drawing';
import campaign from './campaign';
import { saveAll, loadAll, clearAll, getCurrentCampaignId, loadCampaign } from 'services/storage';

export default {
    ...prizes,
    ...participants,
    ...drawing,
    ...campaign,
    async loadFromStorage({ commit }){
        try {
            // Prefer loading current campaign if present
            const curId = await getCurrentCampaignId();
            if (curId) {
                const data = await loadCampaign(curId);
                if (Array.isArray(data.prizes)) commit('setPrizes', data.prizes);
                if (Array.isArray(data.participants)) commit('setParticipants', data.participants);
                if (data.currentPrizeId) commit('setCurrentPrizeId', data.currentPrizeId);
                commit('setCurrentCampaign', { id: curId, name: '' });
            } else {
                const data = await loadAll();
                if (Array.isArray(data.prizes)) commit('setPrizes', data.prizes);
                if (Array.isArray(data.participants)) commit('setParticipants', data.participants);
                if (data.currentPrizeId) commit('setCurrentPrizeId', data.currentPrizeId);
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('loadFromStorage failed', e);
        }
    },
    async clearStorage(){
        try { await clearAll(); } catch (e) { /* ignore */ }
    },
};
