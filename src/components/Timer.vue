<template>
    <div class="timer-bar">
      <div class="timer-fill" :style="{ width: timerWidth + '%' }"></div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        timerWidth: 100,
        timerInterval: null
      };
    },
    mounted() {
      this.startTimer();
    },
    beforeDestroy() {
      if (this.timerInterval) clearInterval(this.timerInterval);
    },
    methods: {
      startTimer() {
        this.timerWidth = 100;
        const duration = 30; // duration in seconds
        const intervalDuration = 1000; // interval in milliseconds
        const decrement = 100 / (duration * 1000 / intervalDuration);
  
        this.timerInterval = setInterval(() => {
          if (this.timerWidth > 0) {
            this.timerWidth -= decrement;
          } else {
            this.resetTimer();
          }
        }, intervalDuration);
      },
      resetTimer() {
        clearInterval(this.timerInterval);
        this.startTimer();
      }
    }
  };
  </script>

  