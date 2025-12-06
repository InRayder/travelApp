import { ref, watch, type Ref } from 'vue'

const globalZIndex = ref(10000)

export function useDynamicZIndex(isOpen: Ref<boolean>) {
    const zIndex = ref(globalZIndex.value)

    watch(isOpen, (newVal) => {
        if (newVal) {
            globalZIndex.value++
            zIndex.value = globalZIndex.value
        }
    }, { immediate: true })

    return { zIndex }
}
