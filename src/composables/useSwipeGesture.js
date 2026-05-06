import { ref } from 'vue';

export const useSwipeGesture = (isActive, onDismiss) => {
  const touchStart = ref(0);
  const translateY = ref(0);

  const getTouch = (e) => {
    if (!isActive()) return;
    touchStart.value = e.touches[0].clientY;
  };

  const moveTouch = (e) => {
    if (!isActive()) return;
    const move = e.touches[0].clientY - touchStart.value;
    if (move > 0) {
      translateY.value = move;
    }
  };

  const endTouch = () => {
    if (!isActive()) return;
    if (translateY.value > 120) {
      onDismiss();
    }
    translateY.value = 0;
  };

  return { translateY, getTouch, moveTouch, endTouch };
};
