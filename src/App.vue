<template>
  <div>
    <Navbar
      :time="time"
      :config="config"
      :selectedService="selectedService"
      @toggle-settings="toggleSettings"
      @update:selectedService="handleServiceChange"
    />
    <div v-if="showSettings">
      <SettingsPopup @close-settings="closeSettings" />
    </div>
    <OTPDisplay :otp="otp" />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import SettingsPopup from './components/SettingsPopup.vue';
import OTPDisplay from './components/OTPDisplay.vue';

export default {
  components: { Navbar, SettingsPopup, OTPDisplay },
  data() {
    return {
      time: '',
      config: null,
      selectedService: '',
      showSettings: false,
      error: null,
      otp: { password: '', expiry: 0, name: '' },
      otpInterval: null
    };
  },
  created() {
    this.updateTime();
    this.fetchConfig();
  },
  watch: {
    selectedService() {
      this.updateOTP();
    }
  },
  methods: {
    updateTime() {
      const updateCurrentTime = () => {
        this.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).replace(/am|pm/i, match => match.toUpperCase());
      };
      updateCurrentTime();
      setInterval(updateCurrentTime, 1000);
    },
    async fetchConfig() {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
        const configData = await response.json();

        // Extract only the service name and id
        this.config = Object.entries(configData['service-config']).reduce((acc, [key, value]) => {
          acc[key] = { id: value.id };
          return acc;
        }, {});

        // Auto-select the first service from the config
        const firstService = Object.keys(this.config)[0];
        this.selectedService = firstService;
      } catch (error) {
        console.error('Error fetching config:', error);
        this.error = 'Failed to load configuration.';
      }
    },
    handleServiceChange(service) {
      this.selectedService = service;
    },
    toggleSettings() {
      this.showSettings = !this.showSettings;
    },
    closeSettings() {
      this.showSettings = false;
    },
    async fetchOTP() {
      if (!this.selectedService) return;

      try {
        const response = await fetch(`https://firefox.theaddicts.hackclub.app/api/otp?service=${this.selectedService}`);
        if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
        const data = await response.json();
        this.otp = data;
        console.log(`Password: ${data.password}`);
        console.log(`${data.expiry} seconds remaining`);

        // Set expiry time and start countdown
        this.startCountdown(data.expiry);
      } catch (error) {
        console.error('Error fetching OTP:', error);
        this.otp = { password: '', expiry: 0, name: 'error' };
      }
    },
    startCountdown(seconds) {
      if (this.otpInterval) clearInterval(this.otpInterval);

      this.otp.expiry = seconds;

      this.otpInterval = setInterval(() => {
        if (this.otp.expiry > 0) {
          this.otp.expiry--;
        } else {
          clearInterval(this.otpInterval);
          this.fetchOTP();
        }
      }, 1000);
    },
    updateOTP() {
      if (this.otpInterval) clearInterval(this.otpInterval);
      this.fetchOTP();
    }
  },
  beforeDestroy() {
    if (this.otpInterval) clearInterval(this.otpInterval);
  }
};
</script>

<style>
/* Add any necessary styles here */
</style>
