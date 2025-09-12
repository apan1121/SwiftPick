import prizes from './prizes';
import participants from './participants';
import drawing from './drawing';
import { saveAll, loadAll, clearAll } from 'services/storage';

export default {
    ...prizes,
    ...participants,
    ...drawing,
    async saveToStorage({ state }){
        try {
            await saveAll(state);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('saveToStorage failed', e);
        }
    },
    async loadFromStorage({ commit }){
        try {
            const data = await loadAll();
            if (Array.isArray(data.prizes)) commit('setPrizes', data.prizes);
            if (Array.isArray(data.participants)) commit('setParticipants', data.participants);
            if (data.currentPrizeId) commit('setCurrentPrizeId', data.currentPrizeId);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('loadFromStorage failed', e);
        }
    },
    async clearStorage(){
        try { await clearAll(); } catch (e) { /* ignore */ }
    },
};
