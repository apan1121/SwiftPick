<template>
    <div v-if="show" class="ld-mask">
        <div class="ld-modal">
            <div class="ld-header d-flex align-items-center justify-content-between">
                <h4 class="mb-0"><i class="fas fa-folder-open text-primary"></i> 選擇抽獎活動</h4>
            </div>
            <div class="ld-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <h6 class="text-muted">現有活動</h6>
                        <div v-if="!campaignsMeta.length" class="text-muted small">尚無活動，請於右側建立新的活動。</div>
                        <div class="list-group ld-list">
                            <div
                                v-for="c in campaignsMeta"
                                :key="c.id"
                                class="list-group-item list-group-item-action d-flex align-items-center"
                                role="button"
                                tabindex="0"
                                @click="enter(c)"
                                @keydown.enter="enter(c)"
                            >
                                <div class="flex-grow-1 text-left">
                                    <div class="font-weight-bold">{{ c.name || '未命名活動' }}</div>
                                    <div class="small text-muted">更新：{{ formatTime(c.updatedAt || c.createdAt) }}</div>
                                </div>
                                <button class="btn btn-sm btn-outline-secondary mr-2" @click.stop="rename(c)" title="重新命名"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-outline-danger" @click.stop="remove(c)" title="刪除"><i class="fas fa-trash"></i></button>
                                <i class="fas fa-chevron-right text-muted ml-2 chev"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <h6 class="text-muted">新增活動</h6>
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="輸入活動名稱" v-model.trim="name" @keyup.enter.prevent />
                            <div class="input-group-append">
                                <button class="btn btn-success" :disabled="!name" @click="create"><i class="fas fa-plus"></i> 建立</button>
                            </div>
                        </div>
                        <div class="small text-muted mt-2">每個活動會各自保存獎項與名單。</div>
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
    <ConfirmModal
        :show="showDelete"
        title="刪除活動"
        :message="deleteTarget ? `確定刪除活動「${deleteTarget.name}」？` : ''"
        @close="showDelete=false"
        @confirm="confirmDelete"
    />
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import InputModal from 'components/common/InputModal.vue';
import ConfirmModal from 'components/common/ConfirmModal.vue';

export default {
    name: 'CampaignOverlay',
    components: { InputModal, ConfirmModal },
    data(){
        return { name: '', showRenameModal: false, renameText: '', renamingId: null, showDelete: false, deleteTarget: null };
    },
    computed: {
        ...mapGetters([
            'currentCampaignId',
            'campaignsMeta',
            'showCampaignOverlay',
        ]),
        show(){
            return !this.currentCampaignId || this.showCampaignOverlay;
        },
    },
    watch: {
        show(v){
            try { document.body.style.overflow = v ? 'hidden' : ''; } catch (e) {}
        },
    },
    methods: {
        ...mapActions([
            'createCampaign', 'loadCampaignById', 'deleteCampaign', 'renameCampaign', 'loadCampaignsMeta',
        ]),
        async create(){
            const n = this.name.trim();
            if (!n) return;
            await this.createCampaign(n);
            this.name = '';
        },
        async enter(c){
            await this.loadCampaignById(c.id);
        },
        async remove(c){
            this.deleteTarget = c;
            this.showDelete = true;
        },
        async confirmDelete(){
            const c = this.deleteTarget;
            if (!c) { this.showDelete = false; return; }
            await this.deleteCampaign(c.id);
            await this.loadCampaignsMeta();
            this.showDelete = false;
            this.deleteTarget = null;
        },
        rename(c){
            this.renamingId = c.id;
            this.renameText = c.name || '';
            this.showRenameModal = true;
        },
        async confirmRename(){
            const id = this.renamingId;
            const name = String(this.renameText || '').trim();
            if (!id || !name) { this.showRenameModal = false; return; }
            await this.renameCampaign({ id, name });
            await this.loadCampaignsMeta();
            this.showRenameModal = false;
        },
        formatTime(ts){
            try { return new Date(ts).toLocaleString(); } catch (e) { return ts || ''; }
        },
    },
    async mounted(){
        await this.loadCampaignsMeta();
        this.show && (document.body.style.overflow = 'hidden');
    },
    unmounted(){
        try { document.body.style.overflow = ''; } catch (e) {}
    },
};
</script>

<style lang="scss" scoped>
.ld-mask{ position: fixed; inset: 0; background: rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index: 2000; }
.ld-modal{ background: #fff; width: 860px; max-width: 92vw; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.25); overflow: hidden; }
.ld-header{ padding: 14px 16px; border-bottom: 1px solid #eee; }
.ld-body{ padding: 16px; max-height: 70vh; overflow: auto; }
.ld-list{ max-height: 50vh; overflow: auto; }
.ld-list .list-group-item[role="button"]{ cursor: pointer; }
.ld-list .list-group-item[role="button"]:hover{ background: #f8f9fa; }
.ld-list .list-group-item{ border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 8px; transition: background-color .12s ease, border-color .12s ease; }
.ld-list .list-group-item:hover{ background: #f8f9fb; border-color: #dfe3e6; }
.ld-list .chev{ opacity: .5; transition: opacity .12s ease, transform .12s ease; }
.ld-list .list-group-item:hover .chev{ opacity: 1; transform: translateX(1px); }
</style>
