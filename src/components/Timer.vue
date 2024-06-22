<template>
  <div class="timer-bar">
    <div class="timer-fill" :style="{ width: timerWidth + '%' }"></div>
  </div>
</template>

<script>
export default {
  props: {
    expiry: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      timeLeft: this.expiry,
      intervalId: null,
      initialTime: this.expiry
    };
  },
  computed: {
    timerWidth() {
      return (this.timeLeft / this.initialTime) * 100;
    }
  },
  watch: {
    expiry(newExpiry) {
      this.initialTime = newExpiry;
      this.timeLeft = newExpiry;
      this.startCountdown();
    }
  },
  created() {
    this.startCountdown();
  },
  methods: {
    startCountdown() {
      if (this.intervalId) clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.intervalId);
          this.$emit('timer-finished');
        }
      }, 1000);
    }
  },
  beforeDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
};
</script>
