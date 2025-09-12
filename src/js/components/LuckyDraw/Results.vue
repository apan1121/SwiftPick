<template>
    <div>
        <LuckyDrawNav />
        <div class="container content-area">
            <div class="page-card">
                <div class="page-header d-flex justify-content-between align-items-center">
                    <h2><i class="fas fa-chart-bar text-success"></i> 抽獎結果</h2>
                    <div>
                        <button class="btn btn-success btn-sm" :disabled="!hasWinners" @click="exportAll"><i class="fas fa-download"></i> 匯出全部</button>
                        <button class="btn btn-outline-secondary btn-sm" @click="printPage"><i class="fas fa-print"></i> 列印</button>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-7">
                        <div class="form-section">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5>中獎名單</h5>
                                <div>
                                    <button class="btn btn-outline-danger btn-sm mr-2" @click="clearAllConfirm">清空所有資料</button>
                                    <input type="search" placeholder="搜尋中獎者..." class="form-control form-control-sm d-inline-block" style="width:220px" v-model="q" />
                                </div>
                            </div>
                            <div v-if="!hasWinners" class="alert alert-info mt-2">尚無中獎紀錄。</div>
                            <div v-for="pr in prizes" :key="pr.id" class="mb-3">
                                <h6 class="d-flex align-items-center">
                                    <span class="flex-grow-1"><i class="fas fa-trophy text-warning"></i> {{ pr.name }} ({{ pr.quantity }}名)</span>
                                    <button class="btn btn-sm btn-outline-danger mr-2" :disabled="!pr.winners || !pr.winners.length" @click="clearPrize(pr)">清空本獎項</button>
                                    <button class="btn btn-sm btn-outline-secondary" :disabled="!pr.winners || !pr.winners.length" @click="exportPrize(pr)">匯出</button>
                                </h6>
                                <div v-if="pr.winners && pr.winners.length" class="alert alert-light border">
                                    <div v-for="p in winnersOfPrize(pr)" :key="p.id" class="d-flex align-items-center">
                                        <span class="flex-grow-1"><i class="fas fa-check text-success"></i> {{ p.name }} <span class="text-muted">({{ p.nickname }})</span></span>
                                        <button class="btn btn-sm btn-outline-danger" @click="removeWinner(pr, p)">取消中獎</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <div class="form-section">
                            <h5>抽獎統計</h5>
                            <ul class="mb-0">
                                <li>總參與人數：{{ totalParticipants }}</li>
                                <li>總中獎人數：{{ totalWinners }}</li>
                                <li>中獎率：{{ winRate }}</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import LuckyDrawNav from './Nav.vue';
import { mapGetters } from 'vuex';

export default {
    name: 'Results',
    components: { LuckyDrawNav },
    data(){
        return { q: '' };
    },
    computed: {
        ...mapGetters([
            'participants',
            'prizes',
            'totalParticipants',
        ]),
        indexById(){
            const idx = new Map();
            (this.participants || []).forEach(p => idx.set(p.id, p));
            return idx;
        },
        hasWinners(){
            return (this.prizes || []).some(pr => pr.winners && pr.winners.length);
        },
        totalWinners(){
            return (this.prizes || []).reduce((sum, pr) => sum + ((pr.winners || []).length), 0);
        },
        winRate(){
            if (!this.totalParticipants) return '0%';
            return ((this.totalWinners / this.totalParticipants) * 100).toFixed(3) + '%';
        },
    },
    methods: {
        winnersOfPrize(pr){
            const term = (this.q || '').trim().toLowerCase();
            const list = (pr.winners || []).map(id => this.indexById.get(id)).filter(Boolean);
            if (!term) return list;
            return list.filter(p => (p.name || '').toLowerCase().includes(term) || (p.nickname || '').toLowerCase().includes(term));
        },
        removeWinner(pr, p){
            if (!confirm(`確定取消 ${p.name} 的中獎資格？`)) return;
            this.$store.dispatch('unmarkWinners', [p.id]);
            this.$store.dispatch('removeWinnersFromPrize', { prizeId: pr.id, winnerIds: [p.id] });
        },
        clearPrize(pr){
            if (!confirm(`確定清空「${pr.name}」的中獎名單？`)) return;
            const ids = (pr.winners || []).slice();
            if (ids.length) this.$store.dispatch('unmarkWinners', ids);
            this.$store.dispatch('clearPrizeWinners', pr.id);
        },
        async clearAllConfirm(){
            if (!confirm('確定要清空所有資料？此動作無法復原。')) return;
            await this.$store.dispatch('clearStorage');
            location.reload();
        },
        exportAll(){
            const rows = [];
            (this.prizes || []).forEach(pr => {
                (pr.winners || []).forEach(id => {
                    const p = this.indexById.get(id);
                    if (p) rows.push([pr.name, p.name, p.nickname || '']);
                });
            });
            this.downloadCsv(['獎項','姓名','暱稱'], rows, 'winners_all.csv');
        },
        exportPrize(pr){
            const rows = (pr.winners || []).map(id => {
                const p = this.indexById.get(id);
                return p ? [pr.name, p.name, p.nickname || ''] : null;
            }).filter(Boolean);
            this.downloadCsv(['獎項','姓名','暱稱'], rows, `winners_${pr.name}.csv`);
        },
        downloadCsv(headers, rows, filename){
            const content = [headers.join(','), ...rows.map(r => r.map(v => `${String(v).replace(/"/g,'""')}`).join(','))].join('\n');
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
        },
        printPage(){
            window.print();
        },
    },
};
</script>

<style lang="scss" scoped>
.content-area{ margin-top: 20px; margin-bottom: 20px; }
.page-card{ background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.06); padding: 24px; }
.page-header{ border-bottom: 2px solid #e9ecef; padding-bottom: 12px; margin-bottom: 20px; }
.form-section{ background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; }
</style>
