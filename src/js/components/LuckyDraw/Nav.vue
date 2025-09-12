<template>
    <div class="ld-nav">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-3 title">
                    <i class="fas fa-dice"></i>
                    <span> 抽獎系統</span>
                </div>
                <div class="col-md-9">
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
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'LuckyDrawNav',
    computed: {
        ...mapGetters([
            'totalParticipants',
            'totalPrizeQuantity',
            'prizes',
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
