import { createApp, defineAsyncComponent } from 'vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import './app.js';
import { createRoutes } from 'router';
import { createStores } from 'lib/store/index';
import 'jquery';
import 'bootstrap';

import { createI18ns, mixinsI18ns } from 'lib/i18n';

const store = createStores([
    'common',
    'luckyDraw',
]);
const router = createRoutes(store);
const i18n = createI18ns();

const app = createApp({
    components: {
        MainPage: defineAsyncComponent(() => import('components/MainPage/main.vue')),
    },
    filters: {},
    data(){
        return {
            SITE_TITLE: 'SwiftPick 瞬選抽籤｜跨活動即時抽獎、智能過濾與成果匯出',
            SITE_DESC: 'SwiftPick 瞬選抽籤支援大規模名單管理，提供搜尋篩選、候選確認與抽獎結果匯出，適合現場或線上抽獎活動即時運作。',
            SITE_KEYWORDS: 'SwiftPick, 瞬選抽籤, 即時抽獎系統, 名單搜尋篩選, 候選確認流程, 抽獎結果匯出',
        };
    },
    computed: {
        ...mapGetters([
            'currentCampaignName',
        ]),
    },
    watch: {
        currentCampaignName(){
            this.setTitle();
        },
    },
    created(){
    },
    mounted(){
        const that = this;
        that.int();
    },
    methods: {
        int(){
            // 載入活動清單與當前活動；若無則於 CampaignPicker 選擇/新增
            this.$store.dispatch('initCampaigns').finally(() => {
                this.setTitle();
                this.loadTheme();
            });
        },
        setTitle(){
            try {
                const name = this.currentCampaignName;
                const base = this.SITE_TITLE || 'SwiftPick 瞬選抽籤｜跨活動即時抽獎、智能過濾與成果匯出';
                const baseDesc = this.SITE_DESC || '';
                const title = name ? `${name} - ${base}` : base;
                const desc = name ? `${name}｜${baseDesc}` : baseDesc;
                document.title = title;
                this.setMeta('description', desc);
                this.setMeta('keywords', this.SITE_KEYWORDS || '');
                this.setOG('og:title', title);
                this.setOG('og:description', desc);
            } catch (e) {}
        },
        loadTheme(){
            try {
                const raw = localStorage.getItem('theme');
                if (!raw) return;
                const t = JSON.parse(raw);
                const root = document.documentElement.style;
                if (t.start) root.setProperty('--brand-start', t.start);
                if (t.end) root.setProperty('--brand-end', t.end);
                if (t.primary) root.setProperty('--primary', t.primary);
            } catch (e) {}
        },
        setMeta(name, content){
            try {
                let tag = document.querySelector(`meta[name="${name}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('name', name);
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content || '');
            } catch (e) {}
        },
        setOG(property, content){
            try {
                let tag = document.querySelector(`meta[property="${property}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('property', property);
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content || '');
            } catch (e) {}
        },
        ...mapActions([]),
        ...mapMutations([]),
    },
    store,
});

app.use(store);
app.use(i18n);
app.mixin(mixinsI18ns);
app.use(router);
app.mount('#appBox');
