import mitt from "mitt";
import { computed, ComputedRef, reactive, ref, watch } from "vue";

interface ModalInfo {
  id: number
}

export type ModalEvents = {
  modal_opened: ModalInfo & { isGenerated: boolean }
  modal_closed: ModalInfo
  modal_manual_close: ModalInfo
}

export const events: Record<string, keyof ModalEvents> = {
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  MODAL_MANUAL_CLOSE: 'modal_manual_close',
} as const;

export const modalEventBus = mitt<ModalEvents>();

export const currentModalId = ref(0);

export function useModalManager() {
  const modalStack = ref<number[]>([]);
  const modalCount = computed(() => modalStack.value.length);
  const closeModal = (id: number) => {
    modalEventBus.emit('modal_manual_close', { id });
  } 

  const closeLastModal = () => {
    const lastId = modalStack.value.pop();
    if (!lastId) return;
    closeModal(lastId);
  }

  const handleModalOpened = ({ id, isGenerated }) => {
    modalStack.value.push(id);
    if (isGenerated) {
      currentModalId.value++;
    }
  }

  const handleModalClosed = ({ id }) => {
    const idIndex = modalStack.value.indexOf(id);
    if (idIndex !== -1) {
      modalStack.value.splice(idIndex, 1);
    }
  }

  const subscribeModalChange = () => {
    modalEventBus.on('modal_opened', handleModalOpened);
    modalEventBus.on('modal_closed', handleModalClosed);
    const unsubscribe = watch(modalCount, (newVal, oldVal) => {
      if (import.meta.env.DEV) {
        console.log('Modal Count', newVal);
      }
  
      if (newVal > 0) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }, {
      immediate: true
    });
    
    return () => {
      modalEventBus.off('modal_opened', handleModalOpened);
      modalEventBus.off('modal_closed', handleModalClosed);
      unsubscribe();
    }
  }

  return {
    modalStack,
    modalCount,
    closeModal,
    closeLastModal,
    subscribeModalChange
  }
}

export const useModal = (isOpen: ComputedRef<boolean>, updateFn: (state: boolean) => void, modalId?: number) => {
  const state = reactive<ModalInfo>({ id: modalId ?? currentModalId.value });
  const closeModal = () => {
    updateFn(false);
  }

  const handleManualClose = ({ id: gotId }: ModalInfo) => {
    if (gotId === state.id) {
      closeModal();
    }
  }

  modalEventBus.on('modal_manual_close', handleManualClose);

  const unwatchOpen = watch(isOpen, (newVal, oldVal) => {
    if (newVal === oldVal || typeof oldVal === 'undefined') return;
    if (newVal) {
      modalEventBus.emit('modal_opened', { ...state, isGenerated: typeof modalId === 'undefined' });
    } else {
      modalEventBus.emit('modal_closed', state);
    }
  }, { immediate: true });
  
  return {
    unsubscribe: () => {
      if (isOpen.value) {
        closeModal();
      }
      modalEventBus.off('modal_manual_close', handleManualClose);
      unwatchOpen();
    },
    closeModal,
    state
  }
}

// Dialog
export interface DialogAction {
  label: string
  class?: string
  onClick: () => string
}

export interface Dialog {
  title: string
  content: string
  actions: DialogAction[]
  onResult: (val: string) => boolean
}

export interface DialogModal extends Dialog, ModalInfo {
  isOpen: boolean
}

export const dialogs = ref<DialogModal[]>([]);

export function showDialog(d: Dialog): number {
  const newDialog: DialogModal = {
    ...d,
    id: currentModalId.value,
    isOpen: true
  };

  dialogs.value.push(newDialog);
  currentModalId.value++;
  return newDialog.id;
};