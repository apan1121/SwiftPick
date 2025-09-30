<template>
    <div>
        <LuckyDrawNav />
        <div class="container content-area">
            <div class="page-card">
                <div class="page-header d-flex justify-content-between align-items-center flex-column flex-md-row align-items-start align-items-md-center">
                    <h2><i class="fas fa-users text-info"></i> 參與者名單</h2>
                    <div class="header-actions d-flex flex-wrap mt-2 mt-md-0">
                        <button class="btn btn-outline-secondary btn-sm mr-1" @click="manualSave"><i class="fas fa-save"></i> 手動儲存</button>
                        <button class="btn btn-outline-danger btn-sm mr-1" :disabled="!participants.length" @click="clearAll"><i class="fas fa-trash"></i> 清空名單</button>
                        <button class="btn btn-outline-success btn-sm" :disabled="!participants.length" @click="openExportOptions"><i class="fas fa-download"></i> 匯出CSV</button>
                        <label class="btn btn-outline-primary btn-sm mb-0">
                            <i class="fas fa-upload"></i> 匯入CSV
                            <input ref="fileInput" type="file" accept=".csv" class="d-none" @change="onFileChange" />
                        </label>
                        <div class="form-check form-check-inline mb-0 align-self-center ml-md-2">
                            <input class="form-check-input" type="checkbox" id="toggleAnonymizeName" v-model="anonymizeNameToggle">
                            <label class="form-check-label" for="toggleAnonymizeName">匿名姓名</label>
                        </div>
                        <div class="form-check form-check-inline mb-0 align-self-center">
                            <input class="form-check-input" type="checkbox" id="toggleAnonymizeNickname" v-model="anonymizeNicknameToggle">
                            <label class="form-check-label" for="toggleAnonymizeNickname">匿名暱稱</label>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-8">
                        <div class="form-section">
                            <h5>Textarea 輸入</h5>
                            <small class="text-muted">格式：姓名,暱稱（每行一筆；暱稱可留空）</small>
                            <textarea v-model="text" class="form-control" rows="6" placeholder="張三,小張\n李四,阿李"></textarea>
                            <div class="mt-2 btn-row d-flex flex-wrap">
                                <button class="btn btn-secondary btn-sm" @click="text=''">清空</button>
                                <button class="btn btn-primary btn-sm" @click="parseFromText">解析</button>
                                <button class="btn btn-warning btn-sm" @click="addDemo(1000)">新增1000筆測試資料</button>
                            </div>
                            <div v-if="errors.length" class="alert alert-warning mt-2 p-2">
                                <div class="small" v-for="(e, idx) in errors" :key="idx">第 {{ e.line }} 行：{{ e.message }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="form-section">
                            <h5>統計</h5>
                            <ul class="mb-0">
                                <li>總參與人數：{{ totalParticipants }}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="text-center mt-4">
                    <router-link class="btn btn-primary btn-lg" :to="{ name: 'DrawingBoard' }">
                        下一步 <i class="fas fa-arrow-right"></i>
                    </router-link>
                </div>
            </div>
            <ConfirmModal
                :show="showConfirm"
                :message="confirmMessage"
                title="確認動作"
                @close="onClose"
                @confirm="onConfirm"
            />
            <ConfirmModal
                :show="showExportModal"
                title="匯出參與者名單"
                message="勾選以下選項後，對應欄位會以遮罩處理；未勾選則保留原始資料。"
                confirm-text="匯出"
                cancel-text="取消"
                @close="closeExportOptions"
                @confirm="confirmExport"
            >
                <div class="mt-3">
                    <div class="form-check mb-2">
                        <input id="exportMaskName" v-model="exportAnonymizeName" type="checkbox" class="form-check-input">
                        <label class="form-check-label" for="exportMaskName">匿名姓名</label>
                    </div>
                    <div class="form-check">
                        <input id="exportMaskNickname" v-model="exportAnonymizeNickname" type="checkbox" class="form-check-input">
                        <label class="form-check-label" for="exportMaskNickname">匿名暱稱</label>
                    </div>
                </div>
            </ConfirmModal>
        </div>
    </div>
</template>

<script>
import LuckyDrawNav from './Nav.vue';
import { mapActions, mapGetters } from 'vuex';
import ConfirmModal from 'components/common/ConfirmModal.vue';
import { parseText, parseCsvFile, parseParticipantsRows, generateParticipants } from 'services/csv';
import { maskName } from 'lib/common/nameMask';

export default {
    name: 'ParticipantList',
    components: { LuckyDrawNav, ConfirmModal },
    data(){
        return {
            text: '',
            errors: [],
            showConfirm: false,
            confirmMessage: '',
            confirmAction: null,
            showExportModal: false,
            exportAnonymizeName: false,
            exportAnonymizeNickname: false,
        };
    },
    computed: {
        ...mapGetters([
            'participants',
            'totalParticipants',
            'anonymizeName',
            'anonymizeNickname',
        ]),
        anonymizeNameToggle: {
            get(){
                return this.anonymizeName;
            },
            set(v){
                this.setAnonymizeName(!!v);
            },
        },
        anonymizeNicknameToggle: {
            get(){
                return this.anonymizeNickname;
            },
            set(v){
                this.setAnonymizeNickname(!!v);
            },
        },
    },
    methods: {
        ...mapActions([
            'setParticipants',
            'setAnonymizeName',
            'setAnonymizeNickname',
        ]),
        manualSave(){
            this.$store.dispatch('saveToStorage');
            alert('已儲存到本機');
        },
        parseFromText(){
            const rows = parseText(this.text || '');
            const { items, errors } = parseParticipantsRows(rows);
            this.errors = errors;
            if (items.length) this.setParticipants(items);
        },
        async onFileChange(e){
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const rows = await parseCsvFile(file);
            const { items, errors } = parseParticipantsRows(rows);
            this.errors = errors;
            if (items.length) this.setParticipants(items);
            this.$refs.fileInput.value = '';
        },
        addDemo(n){
            const items = generateParticipants(n || 1000);
            this.setParticipants(items);
        },
        openConfirm(msg, fn){ this.confirmMessage = msg; this.confirmAction = fn; this.showConfirm = true; },
        onConfirm(){ const fn = this.confirmAction; this.showConfirm = false; this.confirmAction = null; if (typeof fn === 'function') fn(); },
        onClose(){ this.showConfirm = false; this.confirmAction = null; },
        clearAll(){
            this.openConfirm('確定要清空參與者名單？', () => {
                this.setParticipants([]);
                this.$store.dispatch('saveToStorage');
            });
        },
        openExportOptions(){
            this.showExportModal = true;
            this.exportAnonymizeName = !!this.anonymizeName;
            this.exportAnonymizeNickname = !!this.anonymizeNickname;
        },
        closeExportOptions(){
            this.showExportModal = false;
            this.exportAnonymizeName = false;
            this.exportAnonymizeNickname = false;
        },
        confirmExport(){
            this.exportParticipantsCsv({ maskName: this.exportAnonymizeName, maskNickname: this.exportAnonymizeNickname });
        },
        exportParticipantsCsv({ maskName: maskNameFlag = false, maskNickname: maskNicknameFlag = false } = {}){
            this.showExportModal = false;
            this.exportAnonymizeName = false;
            this.exportAnonymizeNickname = false;
            const lines = (this.participants || []).map((p) => {
                const name = maskNameFlag ? maskName(p.name || '') : (p.name || '');
                const nickname = maskNicknameFlag ? maskName(p.nickname || '') : (p.nickname || '');
                return `${name},${nickname}`;
            });
            if (!lines.length) return;
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'participants.csv';
            a.click();
            URL.revokeObjectURL(url);
        },
    },
};
</script>

<style lang="scss" scoped>
.content-area{ margin-top: 20px; margin-bottom: 20px; }
.page-card{ background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.06); padding: 24px; }
.page-header{ border-bottom: 2px solid #e9ecef; padding-bottom: 12px; margin-bottom: 20px; }
.form-section{ background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; }
.header-actions{ gap: 8px; }
.btn-row{ gap: 8px; }
</style>
