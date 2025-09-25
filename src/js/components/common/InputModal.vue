<template>
    <Modal
        :show="show"
        :title="title"
        :confirm-text="confirmText"
        :cancel-text="cancelText"
        :confirm-disabled="disabled"
        @close="$emit('close')"
        @confirm="onConfirm"
    >
        <div class="form-group mb-1">
            <label v-if="label" class="small text-muted">{{ label }}</label>
            <input
                type="text"
                class="form-control"
                :placeholder="placeholder"
                v-model.trim="valueLocal"
                @keyup.enter.prevent
            />
        </div>
        <div v-if="hint" class="small text-muted">{{ hint }}</div>
    </Modal>
</template>

<script>
import Modal from './Modal.vue';

export default {
    name: 'InputModal',
    components: { Modal },
    props: {
        show: { type: Boolean, default: false },
        title: { type: String, default: '輸入' },
        label: { type: String, default: '' },
        placeholder: { type: String, default: '' },
        modelValue: { type: String, default: '' },
        confirmText: { type: String, default: '確認' },
        cancelText: { type: String, default: '取消' },
        hint: { type: String, default: '' },
        minLength: { type: Number, default: 1 },
    },
    emits: ['close', 'confirm', 'update:modelValue'],
    data(){
        return { valueLocal: this.modelValue };
    },
    watch: {
        modelValue(v){ this.valueLocal = v; },
        valueLocal(v){ this.$emit('update:modelValue', v); },
    },
    computed: {
        disabled(){ return !this.valueLocal || this.valueLocal.length < this.minLength; },
    },
    methods: {
        onConfirm(){ if (!this.disabled) this.$emit('confirm', this.valueLocal); },
    },
};
</script>

<style scoped>
</style>
