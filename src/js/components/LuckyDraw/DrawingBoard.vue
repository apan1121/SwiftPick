<template>
    <div>
        <LuckyDrawNav />
        <div class="container-fluid content-area">
            <div class="page-card">
                <div class="page-header d-flex justify-content-between align-items-center">
                    <h2><i class="fas fa-play text-warning"></i> 開始抽獎</h2>
                    <div class="small text-muted">虛擬清單已啟用；動畫與隨機邏輯已接上</div>
                </div>

                <div class="control-panel p-3 rounded">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <div class="mr-3 d-flex align-items-center">
                                <label class="mb-0 mr-2">獎項</label>
                                <select class="form-control form-control-sm" style="width:220px" v-model="selectedPrizeId" @change="onPrizeChange">
                                    <option v-for="pr in prizes" :key="pr.id" :value="pr.id" :disabled="prizeRemain(pr) <= 0">
                                        {{ pr.name }}（剩 {{ prizeRemain(pr) }}）
                                    </option>
                                </select>
                            </div>
                            <button class="btn btn-success mr-2" :disabled="isDrawing || !eligibleCount" @click="start"><i class="fas fa-play"></i> 開始抽獎</button>
                            <button class="btn btn-warning mr-2" :disabled="!isDrawing" @click="pause"><i class="fas fa-pause"></i> 暫停</button>
                            <button class="btn btn-info mr-2" :disabled="!isDrawing" @click="speedUp"><i class="fas fa-forward"></i> 加速</button>
                            <button class="btn btn-secondary" @click="restart"><i class="fas fa-redo"></i> 重新開始</button>
                        </div>
                        <div class="text-right small">
                            <div>
                                當前獎項：
                                <strong class="prize-link" @click="openPrizeModal">{{ currentPrize ? currentPrize.name : '未選擇' }}</strong>
                                （剩餘 {{ remainingQuantity }} 名）
                            </div>
                            <div class="mt-1">亮燈次數：{{ lightCount }} | 速度(ms)：{{ tickInterval }}</div>
                        </div>
                    </div>
                    <!-- 設定列：將可調整選項獨立成一排 -->
                    <div class="settings-row d-flex align-items-center justify-content-end mt-2">
                        <div class="d-flex align-items-center mr-3">
                            <label class="mb-0 mr-2 text-white-50">亮燈次數</label>
                            <div class="input-group input-group-sm" style="width: 140px;">
                                <div class="input-group-prepend">
                                    <button class="btn btn-outline-light" type="button" @click="decLights">-</button>
                                </div>
                                <input type="number" class="form-control form-control-sm" v-model.number="stopAfterLights" min="5" max="500" step="5">
                                <div class="input-group-append">
                                    <button class="btn btn-outline-light" type="button" @click="incLights">+</button>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center text-white-50">
                            <label class="mb-0 mr-3"><input type="checkbox" v-model="autoContinue" /> 自動連抽</label>
                            <label class="mb-0"><input type="checkbox" v-model="soundOn" /> 音效</label>
                        </div>
                    </div>
                </div>

                <!-- 抽獎動畫區：顯示目前輪播的人名，停止後提供確認/取消 -->
                <div class="form-section animation-section">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="h5 mb-0">抽獎動畫</div>
                        <div v-if="pendingWinner" class="confirm-actions">
                            <span class="mr-2">候選中獎者：<strong>{{ pendingWinner.name }}</strong> <small class="text-muted">({{ pendingWinner.nickname }})</small></span>
                            <button class="btn btn-success btn-sm mr-2" @click="confirmWinner">確定</button>
                            <button class="btn btn-outline-danger btn-sm" @click="rejectWinner">取消</button>
                        </div>
                    </div>
                    <div class="animation-single mt-3">
                        <div class="anim-name-large" :title="currentAnimName ? (currentAnimNickname ? currentAnimName + ' ' + currentAnimNickname : currentAnimName) : ''">
                            <div class="anim-line name">{{ currentAnimName || '等待開始...' }}</div>
                            <div v-if="currentAnimNickname" class="anim-line nick">{{ currentAnimNickname }}</div>
                        </div>
                    </div>
                </div>

                <!-- 獎項選擇 Modal -->
                <div v-if="showPrizeModal" class="ld-modal-mask" @click.self="closePrizeModal">
                    <div class="ld-modal">
                        <div class="ld-modal-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">選擇獎項</h5>
                            <button class="btn btn-sm btn-outline-secondary" @click="closePrizeModal">關閉</button>
                        </div>
                        <div class="ld-modal-body">
                            <div v-if="!prizes || !prizes.length" class="text-muted">尚未建立獎項</div>
                            <ul class="list-unstyled mb-0">
                                <li v-for="pr in prizes" :key="pr.id" class="d-flex align-items-center ld-prize-item">
                                    <button class="btn btn-sm mr-2" :class="prizeRemain(pr) > 0 ? 'btn-primary' : 'btn-secondary'" :disabled="prizeRemain(pr) <= 0" @click="choosePrize(pr)">
                                        選擇
                                    </button>
                                    <span class="flex-grow-1">{{ pr.name }}</span>
                                    <small class="text-muted">剩 {{ prizeRemain(pr) }} 名</small>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="h5 mb-0">參與者名單（虛擬清單）</div>
                        <div class="d-flex align-items-center">
                            <input class="form-control form-control-sm mr-2" style="width:200px" type="search" placeholder="搜尋姓名/暱稱" v-model="q" @input="onSearch" />
                            <small class="text-muted">共 {{ totalParticipants }} 人</small>
                        </div>
                    </div>

                    <div ref="parentRef" class="virtual-container" :style="{ height: scrollerHeight }">
                        <RecycleScroller
                            :items="rows"
                            :item-size="rowHeight"
                            :key-field="'key'"
                            :items-limit="100000"
                            :buffer="200"
                            style="height: 100%"
                            v-slot="{ item }"
                        >
                            <div class="vrow">
                                <div v-for="p in item.cols" :key="p.id" class="participant-col">
                                    <div class="participant-card" :class="{ winner: p.isWinner, highlighted: isHighlighted(p.id) }">
                                        <div class="name">{{ p.name }}</div>
                                        <div class="nick">{{ p.nickname }}</div>
                                    </div>
                                </div>
                            </div>
                        </RecycleScroller>
                    </div>
                </div>

                <div v-if="showWinnerBanner" class="winner-display">
                    <div>
                        <h4><i class="fas fa-trophy"></i> {{ winnerBannerText }}</h4>
                    </div>
                </div>

                <div class="text-center mt-4">
                    <router-link class="btn btn-primary btn-lg" :to="{ name: 'Results' }">
                        查看結果 <i class="fas fa-arrow-right"></i>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import LuckyDrawNav from './Nav.vue';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { mapGetters, mapActions } from 'vuex';
import { pickRandomDistinct, pickOne } from 'services/random';
import { playStart, playTick, playWinner } from 'services/sound';

export default {
    name: 'DrawingBoard',
    components: { LuckyDrawNav, RecycleScroller },
    setup(){
        const parentRef = ref(null);
        const containerWidth = ref(0);
        const rowHeight = 80; // 每列高度（含間距）
        const minItemWidth = 140; // 每格固定寬
        const columns = ref(1);
        const q = ref('');

        const ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver((entries) => {
            const cr = entries[0].contentRect;
            containerWidth.value = cr.width;
            const cols = Math.max(1, Math.floor(containerWidth.value / minItemWidth));
            columns.value = cols;
        }) : null;

        onMounted(() => {
            if (parentRef.value && ro) ro.observe(parentRef.value);
        });
        onBeforeUnmount(() => {
            if (ro) ro.disconnect();
        });

        return { parentRef, containerWidth, columns, rowHeight, q };
    },
    computed: {
        ...mapGetters([
            'participants',
            'totalParticipants',
            'searchTerm',
            'prizes',
            'currentPrize',
            'isDrawing',
            'lightCount',
        ]),
        participantsMap(){
            const m = new Map();
            (this.participants || []).forEach(p => m.set(p.id, p));
            return m;
        },
        filtered(){
            const term = (this.q || '').trim();
            if (!term) return this.participants;
            const lower = term.toLowerCase();
            return (this.participants || []).filter(p =>
                (p.name || '').toLowerCase().includes(lower) ||
                (p.nickname || '').toLowerCase().includes(lower)
            );
        },
        rowCount(){
            const cols = Math.max(1, this.columns || 1);
            const len = (this.filtered || []).length;
            return Math.ceil(len / cols);
        },
        rows(){
            const cols = Math.max(1, this.columns || 1);
            const list = this.filtered || [];
            const out = [];
            for (let i = 0; i < list.length; i += cols) {
                out.push({ key: i, cols: list.slice(i, i + cols) });
            }
            return out;
        },
        currentAnimParticipant(){
            const id = this.animationCurrentId;
            return id ? this.participantsMap.get(id) : null;
        },
        currentAnimName(){
            const p = this.currentAnimParticipant;
            return p ? (p.name || '') : '';
        },
        currentAnimNickname(){
            const p = this.currentAnimParticipant;
            return p ? (p.nickname || '') : '';
        },
        eligibleCount(){
            return (this.participants || []).filter(p => !p.isWinner).length;
        },
        remainingQuantity(){
            if (!this.currentPrize) return 0;
            const used = (this.currentPrize.winners || []).length;
            return Math.max(0, (this.currentPrize.quantity || 0) - used);
        },
    },
    methods: {
        ...mapActions([
            'setSearchTerm',
            'setCurrentPrizeId',
            'startDrawing',
            'pauseDrawing',
            'setSpeed',
            'incrementLightCount',
            'resetDrawing',
            'addWinnersToPrize',
            'markWinners',
        ]),
        onSearch(){
            this.setSearchTerm(this.q);
        },
        prizeRemain(pr){
            const used = (pr.winners || []).length;
            return Math.max(0, (pr.quantity || 0) - used);
        },
        isHighlighted(id){
            return this.highlightIds.indexOf(id) !== -1;
        },
        ensureCurrentPrize(){
            if (this.currentPrize && this.remainingQuantity > 0) return;
            const firstRemain = (this.prizes || []).find(p => (p.quantity || 0) > (p.winners || []).length);
            if (firstRemain) this.setCurrentPrizeId(firstRemain.id);
        },
        onPrizeChange(){
            if (!this.selectedPrizeId) return;
            this.setCurrentPrizeId(this.selectedPrizeId);
        },
        openPrizeModal(){
            this.showPrizeModal = true;
        },
        closePrizeModal(){
            this.showPrizeModal = false;
        },
        choosePrize(pr){
            if (!pr || this.prizeRemain(pr) <= 0) return;
            this.selectedPrizeId = pr.id;
            this.setCurrentPrizeId(pr.id);
            this.closePrizeModal();
        },
        start(){
            this.ensureCurrentPrize();
            if (!this.currentPrize) return;
            if (this.isDrawing) return;
            this.localLightCount = 0;
            this.highlightIds = [];
            this.startDrawing();
            if (this.soundOn) playStart();
            this.loop();
        },
        pause(){
            this.pauseDrawing();
            if (this._rafId) cancelAnimationFrame(this._rafId);
            this._rafId = null;
        },
        speedUp(){
            this.tickInterval = Math.max(20, Math.floor(this.tickInterval * 0.75));
        },
        restart(){
            this.pause();
            this.resetDrawing();
            this.highlightIds = [];
            this.localLightCount = 0;
        },
        incLights(){
            let v = Number(this.stopAfterLights) || 0;
            v = Math.min(500, v + 5);
            this.stopAfterLights = v;
        },
        decLights(){
            let v = Number(this.stopAfterLights) || 0;
            v = Math.max(5, v - 5);
            this.stopAfterLights = v;
        },
        recalcColumns(){
            const el = this.$refs && this.$refs.parentRef;
            if (!el) return;
            const width = el.clientWidth || 0;
            const minItemWidth = 140;
            const cols = Math.max(1, Math.floor(width / minItemWidth));
            this.columns = cols;
        },
        updateScrollerHeight(){
            // 動態計算可視高度，讓虛擬清單盡量填滿視窗
            try {
                const el = this.$refs && this.$refs.parentRef;
                const dom = el || (this.parentRef && this.parentRef);
                const node = dom && (dom.$el || dom);
                const rect = node && node.getBoundingClientRect ? node.getBoundingClientRect() : null;
                const top = rect ? rect.top : 0;
                const paddingBottom = 24; // 底部留白
                const h = Math.max(240, Math.floor(window.innerHeight - top - paddingBottom));
                this.scrollerHeight = `${h}px`;
            } catch (e) {
                // fallback
                this.scrollerHeight = '60vh';
            }
        },
        loop(){
            let last = performance.now();
            const step = (now) => {
                if (!this.isDrawing) return;
                const dt = now - last;
                if (dt >= this.tickInterval) {
                    last = now;
                    this.tick();
                }
                this._rafId = requestAnimationFrame(step);
            };
            this._rafId = requestAnimationFrame(step);
        },
        tick(){
            const eligible = (this.participants || []).filter(p => !p.isWinner).map(p => p.id);
            if (eligible.length === 0) return;
            const id = pickOne(eligible);
            this.highlightIds = [id];
            this.animationCurrentId = id;
            this.incrementLightCount();
            this.localLightCount += 1;
            if (this.soundOn && this.localLightCount % 5 === 0) playTick();
            if (this.localLightCount >= this.stopAfterLights) {
                this.finalizeWinner();
            }
        },
        finalizeWinner(){
            const excludeSet = new Set(this.excludedIds);
            // 優先取目前動畫顯示者，確保視覺與結果一致
            let winner = this.animationCurrentId ? this.participants.find(p => p.id === this.animationCurrentId) : null;
            if (!winner || winner.isWinner || excludeSet.has(winner.id)) {
                const eligible = (this.participants || []).filter(p => !p.isWinner && !excludeSet.has(p.id));
                winner = pickOne(eligible);
            }
            if (!winner) {
                this.pause();
                return;
            }
            this.pause();
            if (this.soundOn) playWinner();
            // 暫存候選中獎者，等待確認
            this.pendingWinner = winner;
        },
        confirmWinner(){
            if (!this.pendingWinner) return;
            const id = this.pendingWinner.id;
            this.markWinners([id]);
            if (this.currentPrize) {
                this.addWinnersToPrize({ prizeId: this.currentPrize.id, winners: [id] });
            }
            // 橫幅提示
            const p = this.pendingWinner;
            const name = p.nickname ? `${p.name} (${p.nickname})` : p.name;
            this.winnerBannerText = `中獎者：${name}`;
            this.showWinnerBanner = true;
            setTimeout(() => { this.showWinnerBanner = false; }, 2500);
            this.pendingWinner = null;
            if (this.remainingQuantity > 0) {
                if (this.autoContinue) setTimeout(() => this.start(), 400);
            } else {
                const next = (this.prizes || []).find(p => (p.quantity || 0) > (p.winners || []).length);
                if (next) this.setCurrentPrizeId(next.id);
            }
        },
        rejectWinner(){
            if (!this.pendingWinner) return;
            const id = this.pendingWinner.id;
            if (!this.excludedIds.includes(id)) this.excludedIds.push(id);
            this.pendingWinner = null;
            // 重新開始抽一位
            this.start();
        },
    },
    data(){
        return {
            highlightIds: [],
            animationCurrentId: null,
            localLightCount: 0,
            tickInterval: 80, // 起始間隔；speedUp 會降低
            stopAfterLights: 50,
            _rafId: null,
            autoContinue: false,
            soundOn: true,
            isMounted: false,
            pendingWinner: null,
            excludedIds: [],
            showWinnerBanner: false,
            winnerBannerText: '',
            selectedPrizeId: null,
            showPrizeModal: false,
            scrollerHeight: '420px',
        };
    },
    mounted(){
        this.isMounted = true;
        this.recalcColumns();
        this.updateScrollerHeight();
        window.addEventListener('resize', this.recalcColumns);
        window.addEventListener('resize', this.updateScrollerHeight);
        this.ensureCurrentPrize();
        // 初始化下拉選單
        if (this.currentPrize) {
            this.selectedPrizeId = this.currentPrize.id;
        } else {
            const firstRemain = (this.prizes || []).find(p => (p.quantity || 0) > (p.winners || []).length);
            if (firstRemain) this.selectedPrizeId = firstRemain.id;
        }
    },
    unmounted(){
        window.removeEventListener('resize', this.recalcColumns);
        window.removeEventListener('resize', this.updateScrollerHeight);
    },
    unmounted(){
        window.removeEventListener('resize', this.recalcColumns);
    },
};
</script>

<style lang="scss" scoped>
.content-area{ margin-top: 20px; margin-bottom: 20px; }
.page-card{ background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.06); padding: 24px; }
.page-header{ border-bottom: 2px solid #e9ecef; padding-bottom: 12px; margin-bottom: 20px; }
.control-panel{ background: #343a40; color: #fff; }
.control-panel .settings-row{ border-top: 1px solid rgba(255,255,255,.08); padding-top: 8px; }
.control-panel .settings-row{ font-size: 0.85rem; }
.control-panel .settings-row .btn, .control-panel .settings-row .form-control{ font-size: 0.85rem; }
.form-section{ background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; }
.winner-display{ background: linear-gradient(45deg, #ff6b6b, #ee5a52); color:#fff; border-radius: 10px; padding: 24px; text-align:center; }
.virtual-container{ height: 420px; overflow: auto; border: 2px solid #e9ecef; border-radius: 8px; background: #fff; position: relative; }
.participant-col{ padding: 6px; flex: 0 0 140px; max-width: 140px; }
.participant-card{ background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 6px; text-align:center; font-size: 12px; transition: .2s; height: 64px; display: flex; flex-direction: column; justify-content: center; }
.participant-card.highlighted{ background: linear-gradient(45deg, #ffd700, #ffed4e); color:#000; border-color:#ffc107; box-shadow: 0 0 12px rgba(255,193,7,.45); }
.participant-card.winner{ background: linear-gradient(45deg, #ff6b6b, #ee5a52); color: #fff; border-color: #dc3545; box-shadow: 0 0 12px rgba(220,53,69,.35); transform: scale(1.03); }
.participant-card .name{ font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.participant-card .nick{ opacity: .75; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.animation-section{ background: #fff; }
.animation-single{ display: flex; align-items: center; justify-content: center; min-height: 72px; border: 2px dashed #e9ecef; border-radius: 8px; background: #fafafa; }
.anim-name-large{ display:flex; flex-direction:column; align-items:center; max-width:80%; }
.anim-line.name{ font-size: 28px; font-weight: 800; color: #333; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.anim-line.nick{ margin-top: 4px; font-size: 16px; color: #6c757d; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.prize-link{ cursor: pointer; text-decoration: underline; }
.ld-modal-mask{ position: fixed; z-index: 1050; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; }
.ld-modal{ background: #fff; width: 520px; max-width: 92vw; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.2); overflow: hidden; }
.ld-modal-header{ padding: 12px 16px; border-bottom: 1px solid #eee; }
.ld-modal-body{ padding: 12px 16px; max-height: 60vh; overflow: auto; }
.ld-prize-item{ padding: 6px 0; border-bottom: 1px dashed #eee; }
.vrow{ display: flex; flex-wrap: nowrap; width: 100%; height: 80px; }
</style>
