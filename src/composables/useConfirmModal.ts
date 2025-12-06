import { ref } from 'vue'

/**
 * 共用確認對話框 Composable
 * 用於統一管理確認對話框的邏輯，避免在每個元件中重複實作
 */
export function useConfirmModal() {
    const isOpen = ref(false)
    const title = ref('')
    const message = ref('')
    const showCancel = ref(true)
    const confirmCallback = ref<(() => void) | null>(null)

    /**
     * 開啟純提示對話框（僅有確認按鈕）
     */
    const openAlert = (alertMessage: string) => {
        title.value = '提示'
        message.value = alertMessage
        confirmCallback.value = null
        showCancel.value = false
        isOpen.value = true
    }

    /**
     * 開啟確認對話框（有確認和取消按鈕）
     */
    const open = (confirmTitle: string, confirmMessage: string, callback: () => void) => {
        title.value = confirmTitle
        message.value = confirmMessage
        confirmCallback.value = callback
        showCancel.value = true
        isOpen.value = true
    }

    /**
     * 處理確認動作
     */
    const confirm = () => {
        if (confirmCallback.value) {
            confirmCallback.value()
            confirmCallback.value = null
        }
        isOpen.value = false
    }

    /**
     * 關閉對話框
     */
    const close = () => {
        isOpen.value = false
        confirmCallback.value = null
    }

    return {
        // 狀態
        isOpen,
        title,
        message,
        showCancel,
        // 方法
        openAlert,
        open,
        confirm,
        close
    }
}
