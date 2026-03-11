import { ref } from 'vue'

export function useTabs() {
  const activeValue = ref('')

  function setActive(value: string) {
    activeValue.value = value
  }

  return {
    activeValue,
    setActive
  }
}