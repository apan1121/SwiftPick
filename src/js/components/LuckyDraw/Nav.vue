<template>
    <div class="ld-nav">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-4 title d-flex align-items-center">
                    <i class="fas fa-dice"></i>
                    <span class="ml-1"> 抽獎系統</span>
                    <span
                        v-if="currentCampaignName"
                        class="badge badge-light ml-2"
                        style="cursor: pointer;"
                        title="點擊重新命名活動"
                        @click="renameCurrentCampaign"
                    >
                        {{ currentCampaignName }}
                    </span>
                    <button class="btn btn-sm btn-outline-light ml-2" @click="openSwitch"><i class="fas fa-exchange-alt"></i> 切換活動</button>
                </div>
                <div class="col-md-8">
                    <div class="row">
                        <div class="col" v-for="(step, idx) in steps" :key="step.name">
                            <router-link :to="{ name: step.name }"
                                class="nav-step"
                                :class="{ active: currentIndex === idx, completed: idx < currentIndex }">
                                <div class="icon"><i :class="step.icon"></i></div>
                                <div class="label">{{ step.label }}</div>
                                <div class="state">
                                    <span v-if="currentIndex === idx">進行中</span>
                                    <i v-else-if="idx < currentIndex" class="fas fa-check"></i>
                                    <span v-else>-</span>
                                </div>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <InputModal
            :show="showRenameModal"
            title="重新命名活動"
            label="活動名稱"
            placeholder="請輸入活動名稱"
            v-model="renameText"
            :min-length="1"
            @close="showRenameModal=false"
            @confirm="confirmRename"
        />
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import InputModal from 'components/common/InputModal.vue';

export default {
    name: 'LuckyDrawNav',
    components: { InputModal },
    computed: {
        ...mapGetters([
            'totalParticipants',
            'totalPrizeQuantity',
            'prizes',
            'currentCampaignName',
            'currentCampaignId',
        ]),
        steps(){
            return [
                { name: 'PrizeSetup', label: '獎項設定', icon: 'fas fa-trophy' },
                { name: 'ParticipantList', label: '參與者名單', icon: 'fas fa-users' },
                { name: 'DrawingBoard', label: '開始抽獎', icon: 'fas fa-play' },
                { name: 'Results', label: '結果查看', icon: 'fas fa-chart-bar' },
            ];
        },
        currentIndex(){
            const idx = this.steps.findIndex(s => s.name === this.$route.name);
            return idx === -1 ? 0 : idx;
        },
        totalWinners(){
            return (this.prizes || []).reduce((sum, pr) => sum + ((pr.winners || []).length), 0);
        },
    },
    methods: {
        ...mapActions(['openCampaignOverlay', 'renameCampaign']),
        openSwitch(){ this.openCampaignOverlay(); },
        renameCurrentCampaign(){
            if (!this.currentCampaignId) return;
            this.renameText = this.currentCampaignName || '';
            this.showRenameModal = true;
        },
        confirmRename(name){
            if (!this.currentCampaignId) return;
            const v = String(name || '').trim();
            if (!v) return;
            this.renameCampaign({ id: this.currentCampaignId, name: v });
            this.showRenameModal = false;
        },
    },
    data(){
        return {
            showRenameModal: false,
            renameText: '',
        };
    },
};
</script>

<style lang="scss" scoped>
.ld-nav{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 12px 0; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
.title{ font-weight: 600; }
.nav-step{ display:block; text-align:center; padding:10px; margin:5px; border-radius:8px; background: rgba(255,255,255,.1); color:#fff; text-decoration:none; transition:.2s; }
.nav-step .icon{ margin-bottom: 4px; }
.nav-step.active{ background: rgba(255,193,7,.85); transform: scale(1.03); color:#212529; }
.nav-step.completed{ background: rgba(40,167,69,.85); }
.nav-step:hover{ background: rgba(255,255,255,.2); text-decoration:none; }
</style>

 
