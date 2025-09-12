<template>
    <Modal
        :show="show"
        :title="title"
        :confirm-text="confirmText"
        :cancel-text="cancelText"
        @close="$emit('close')"
        @confirm="$emit('confirm')"
    >
        <div class="mb-1">{{ message }}</div>
        <slot />
    </Modal>
</template>

<script>
import Modal from './Modal.vue';

export default {
    name: 'ConfirmModal',
    components: { Modal },
    props: {
        show: { type: Boolean, default: false },
        title: { type: String, default: '確認' },
        message: { type: String, default: '' },
        confirmText: { type: String, default: '確定' },
        cancelText: { type: String, default: '取消' },
    },
    emits: ['close', 'confirm'],
};
</script>

<style scoped>
</style>

