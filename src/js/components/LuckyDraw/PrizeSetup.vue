<template>
    <div>
        <LuckyDrawNav />
        <div class="container content-area">
            <div class="page-card">
                <div class="page-header d-flex justify-content-between align-items-center">
                    <h2><i class="fas fa-trophy text-warning"></i> 獎項設定</h2>
                    <div>
                        <button class="btn btn-outline-secondary btn-sm mr-1" @click="manualSave"><i class="fas fa-save"></i> 手動儲存</button>
                        <button class="btn btn-outline-danger btn-sm mr-1" :disabled="!prizes.length" @click="clearAll"><i class="fas fa-trash"></i> 清空全部</button>
                        <button class="btn btn-outline-success btn-sm" :disabled="!prizes.length" @click="exportCsv"><i class="fas fa-download"></i> 匯出CSV</button>
                        <label class="btn btn-outline-primary btn-sm mb-0">
                            <i class="fas fa-upload"></i> 匯入CSV
                            <input ref="fileInput" type="file" accept=".csv" class="d-none" @change="onFileChange" />
                        </label>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-section">
                            <h5>Textarea 輸入</h5>
                            <small class="text-muted">格式：名稱,數量（每行一筆）</small>
                            <textarea v-model="text" class="form-control" rows="8" placeholder="特等獎,1&#10;頭獎,3"></textarea>
                            <div class="mt-2">
                                <button class="btn btn-secondary btn-sm" @click="text=''">清空</button>
                                <button class="btn btn-primary btn-sm" @click="parseFromText">解析</button>
                            </div>
                            <div v-if="errors.length" class="alert alert-warning mt-2 p-2">
                                <div class="small" v-for="(e, idx) in errors" :key="idx">第 {{ e.line }} 行：{{ e.message }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-section">
                            <h5>獎項預覽</h5>
                            <ul class="list-group">
                                <li v-for="p in prizes" :key="p.id" class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>{{ p.name }}</span>
                                    <span class="badge badge-primary badge-pill">數量：{{ p.quantity }}</span>
                                </li>
                            </ul>
                            <div v-if="!prizes.length" class="text-muted">尚無資料</div>
                        </div>
                    </div>
                </div>

                <div class="text-center mt-4">
                    <router-link class="btn btn-primary btn-lg" :to="{ name: 'ParticipantList' }">
                        下一步 <i class="fas fa-arrow-right"></i>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
    
</template>

<script>
import LuckyDrawNav from './Nav.vue';
import { mapActions, mapGetters } from 'vuex';
import { parseText, parseCsvFile, parsePrizesRows } from 'services/csv';

export default {
    name: 'PrizeSetup',
    components: { LuckyDrawNav },
    data(){
        return {
            text: '',
            errors: [],
        };
    },
    computed: {
        ...mapGetters([
            'prizes',
            'totalPrizeQuantity',
        ]),
    },
    methods: {
        ...mapActions([
            'setPrizes',
        ]),
        manualSave(){
            this.$store.dispatch('saveToStorage');
            alert('已儲存到本機');
        },
        parseFromText(){
            const rows = parseText(this.text || '');
            const { items, errors } = parsePrizesRows(rows);
            this.errors = errors;
            if (items.length) this.setPrizes(items);
        },
        clearAll(){
            if (!confirm('確定要清空所有獎項？')) return;
            this.setPrizes([]);
            this.$store.dispatch('saveToStorage');
        },
        async onFileChange(e){
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const rows = await parseCsvFile(file);
            const { items, errors } = parsePrizesRows(rows);
            this.errors = errors;
            if (items.length) this.setPrizes(items);
            this.$refs.fileInput.value = '';
        },
        exportCsv(){
            // 簡單導出（不引入轉換器）：手動組字串
            const lines = (this.prizes || []).map(p => `${p.name},${p.quantity}`);
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'prizes.csv';
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
</style>
