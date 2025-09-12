<template>
    <div v-if="show" class="m-mask" @click="onMask">
        <div class="m-container" :style="containerStyle" @click.stop>
            <div class="m-header d-flex align-items-center justify-content-between">
                <h5 class="mb-0">{{ title }}</h5>
                <button type="button" class="close" aria-label="Close" @click="$emit('close')">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="m-body">
                <slot />
            </div>
            <div class="m-footer text-right">
                <button class="btn btn-sm btn-secondary mr-2" @click="$emit('close')">{{ cancelText }}</button>
                <button class="btn btn-sm btn-primary" :disabled="confirmDisabled" @click="$emit('confirm')">{{ confirmText }}</button>
            </div>
        </div>
    </div>
    
</template>

<script>
export default {
    name: 'Modal',
    props: {
        show: { type: Boolean, default: false },
        title: { type: String, default: '' },
        width: { type: [String, Number], default: 520 },
        cancelText: { type: String, default: '取消' },
        confirmText: { type: String, default: '確認' },
        closeOnClickMask: { type: Boolean, default: false },
        confirmDisabled: { type: Boolean, default: false },
    },
    computed: {
        containerStyle(){
            const w = typeof this.width === 'number' ? `${this.width}px` : String(this.width);
            return { width: w, maxWidth: '92vw' };
        },
    },
    methods: {
        onMask(){ if (this.closeOnClickMask) this.$emit('close'); },
    },
};
</script>

<style scoped>
.m-mask{ position: fixed; inset: 0; background: rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index: 2050; }
.m-container{ background: #fff; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.25); overflow: hidden; color: #212529; }
.m-header{ padding: 12px 14px; border-bottom: 1px solid #eee; }
.m-header h5{ color: #212529; font-weight: 600; }
.m-body{ padding: 14px; max-height: 60vh; overflow: auto; }
.m-footer{ padding: 10px 14px; border-top: 1px solid #eee; }
</style>
