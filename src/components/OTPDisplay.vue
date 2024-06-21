<template>
    <div class="otp-display">
      <h1>{{ otp.password }}</h1>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      otp: {
        type: Object,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .otp-display {
    font-size: 3rem;
    text-align: center;
    margin-top: 20px;
  }
  </style>
  