<template>
    <div>
        <LuckyDrawNav />
        <div class="container content-area">
            <div class="page-card">
                <div class="page-header d-flex justify-content-between align-items-center">
                    <h2><i class="fas fa-folder-open text-primary"></i> 選擇抽獎活動</h2>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-section">
                            <h5>現有活動</h5>
                            <div v-if="!campaignsMeta.length" class="text-muted">尚無活動，請建立新的活動。</div>
                            <ul class="list-group">
                                <li v-for="c in campaignsMeta" :key="c.id" class="list-group-item d-flex align-items-center">
                                    <div class="flex-grow-1">
                                        <div class="font-weight-bold">{{ c.name || '未命名活動' }}</div>
                                        <div class="small text-muted">更新：{{ formatTime(c.updatedAt || c.createdAt) }}</div>
                                    </div>
                                    <button class="btn btn-sm btn-primary mr-2" @click="enter(c)"><i class="fas fa-sign-in-alt"></i> 進入</button>
                                    <button class="btn btn-sm btn-outline-secondary mr-2" @click="rename(c)"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-danger" @click="remove(c)"><i class="fas fa-trash"></i></button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-section">
                            <h5>新增活動</h5>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="輸入活動名稱" v-model.trim="name" @keyup.enter="create" />
                                <div class="input-group-append">
                                    <button class="btn btn-success" :disabled="!name" @click="create"><i class="fas fa-plus"></i> 建立</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import LuckyDrawNav from './Nav.vue';
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'CampaignPicker',
    components: { LuckyDrawNav },
    data(){
        return { name: '' };
    },
    computed: {
        ...mapGetters([
            'campaignsMeta',
        ]),
    },
    methods: {
        ...mapActions([
            'createCampaign',
            'loadCampaignById',
            'deleteCampaign',
            'renameCampaign',
            'loadCampaignsMeta',
        ]),
        async create(){
            const n = this.name.trim();
            if (!n) return;
            await this.createCampaign(n);
            this.name = '';
            this.$router.push({ name: 'PrizeSetup' });
        },
        async enter(c){
            await this.loadCampaignById(c.id);
            this.$router.push({ name: 'PrizeSetup' });
        },
        async remove(c){
            if (!confirm(`確定刪除活動「${c.name}」？`)) return;
            await this.deleteCampaign(c.id);
            await this.loadCampaignsMeta();
        },
        async rename(c){
            const n = window.prompt('輸入新的活動名稱', c.name || '');
            if (n == null) return;
            await this.renameCampaign({ id: c.id, name: String(n).trim() });
        },
        formatTime(ts){
            try { return new Date(ts).toLocaleString(); } catch (e) { return ts || ''; }
        },
    },
    async mounted(){
        await this.loadCampaignsMeta();
    },
};
</script>

<style lang="scss" scoped>
.content-area{ margin-top: 20px; margin-bottom: 20px; }
.page-card{ background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.06); padding: 24px; }
.page-header{ border-bottom: 2px solid #e9ecef; padding-bottom: 12px; margin-bottom: 20px; }
.form-section{ background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; }
</style>

