<template>
  <div class="otp-display">
    <h1>{{ otp.password }}</h1>
    <button @click="copyOTP" class="copy-button">Copy</button>
  </div>
</template>

<script>
export default {
  props: {
    otp: {
      type: Object,
      required: true
    }
  },
  methods: {
    copyOTP() {
      navigator.clipboard.writeText(this.otp.password)
        .then(() => {
          alert('OTP copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy OTP:', err);
          alert('Failed to copy OTP. Please try again.');
        });
    }
  }
};
</script>

<style scoped>
.otp-display {
  font-size: 3rem;
  text-align: center;
}

.copy-button {
  padding: 8px 16px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
