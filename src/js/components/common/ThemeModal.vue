<template>
    <div v-if="show" class="m-mask" @click="onMask">
        <div class="m-container" @click.stop>
            <div class="m-header d-flex align-items-center justify-content-between">
                <h5 class="mb-0"><i class="fas fa-palette"></i> 色調設定</h5>
                <button type="button" class="close" aria-label="Close" @click="$emit('close')">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="m-body">
                <div class="legend mb-2">
                    <div class="small text-muted mb-1"><strong>顏色用途說明</strong></div>
                    <ul class="small text-muted pl-3 mb-2">
                        <li>
                            <span class="swatch" :style="{ background: form.start }"></span>
                            導覽背景（漸層）起始色 →
                            <span class="swatch" :style="{ background: form.end }"></span>
                            結束色
                        </li>
                        <li>
                            <span class="swatch" :style="{ background: form.primary }"></span>
                            主要操作色：套用於 <code>.btn-primary</code>、連結顏色與部分徽章
                        </li>
                    </ul>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label>品牌漸層起始色</label>
                        <input type="color" class="form-control" v-model="form.start">
                    </div>
                    <div class="form-group col-md-6">
                        <label>品牌漸層結束色</label>
                        <input type="color" class="form-control" v-model="form.end">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label>主要按鈕顏色</label>
                        <input type="color" class="form-control" v-model="form.primary">
                    </div>
                </div>

                <div class="preview mt-3">
                    <div class="preview-bar" :style="previewStyle"></div>
                    <button class="btn btn-primary btn-sm mt-2" type="button">按鈕預覽</button>
                </div>
            </div>
            <div class="m-footer text-right">
                <button class="btn btn-sm btn-secondary mr-2" @click="reset">還原預設</button>
                <button class="btn btn-sm btn-primary" @click="save">套用並儲存</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ThemeModal',
    props: { show: { type: Boolean, default: false } },
    data(){
        const root = getComputedStyle(document.documentElement);
        const current = {
            start: root.getPropertyValue('--brand-start').trim() || '#0ea5e9',
            end: root.getPropertyValue('--brand-end').trim() || '#14b8a6',
            primary: root.getPropertyValue('--primary').trim() || '#0ea5e9',
        };
        return {
            form: { ...current },
            original: { ...current },
            defaults: { start: '#0ea5e9', end: '#14b8a6', primary: '#0ea5e9' },
            saved: false,
        };
    },
    computed: {
        previewStyle(){
            return { background: `linear-gradient(135deg, ${this.form.start} 0%, ${this.form.end} 100%)` };
        },
    },
    methods: {
        onMask(){ this.cancel(); },
        onClose(){ this.cancel(); },
        apply(theme){
            const t = theme || this.form;
            const root = document.documentElement.style;
            root.setProperty('--brand-start', t.start);
            root.setProperty('--brand-end', t.end);
            root.setProperty('--primary', t.primary);
        },
        save(){
            this.apply();
            try { localStorage.setItem('theme', JSON.stringify(this.form)); } catch (e) {}
            this.saved = true;
            this.$emit('close');
        },
        reset(){
            this.form = { ...this.defaults };
            this.apply(this.defaults);
            try { localStorage.removeItem('theme'); } catch (e) {}
        },
        cancel(){
            // 若未儲存則還原到打開時的樣子
            if (!this.saved) this.apply(this.original);
            this.$emit('close');
        },
    },
    watch: {
        show(v){
            if (v) {
                // 開啟時，抓取當前主題作為 original 與初始表單
                const root = getComputedStyle(document.documentElement);
                const cur = {
                    start: root.getPropertyValue('--brand-start').trim() || this.defaults.start,
                    end: root.getPropertyValue('--brand-end').trim() || this.defaults.end,
                    primary: root.getPropertyValue('--primary').trim() || this.defaults.primary,
                };
                this.original = { ...cur };
                this.form = { ...cur };
                this.saved = false;
            }
        },
        'form.start': function(){ this.apply(); },
        'form.end': function(){ this.apply(); },
        'form.primary': function(){ this.apply(); },
    },
};
</script>

<style scoped>
.m-mask{ position: fixed; inset: 0; background: rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index: 2050; }
.m-container{ background: #fff; width: 560px; max-width: 92vw; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.25); overflow: hidden; }
.m-header{ padding: 12px 14px; border-bottom: 1px solid #eee; color: #212529; }
.m-body{ padding: 14px; }
.m-footer{ padding: 10px 14px; border-top: 1px solid #eee; }
.preview-bar{ height: 36px; border-radius: 6px; }
.swatch{ display:inline-block; width: 12px; height: 12px; border-radius: 3px; border: 1px solid #e1e4e8; vertical-align: middle; margin-right: 4px; }
</style>
