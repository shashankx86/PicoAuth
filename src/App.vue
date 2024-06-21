<template>
  <div>
    <Navbar :time="time" :config="config" :selectedService="selectedService" @toggle-settings="toggleSettings" @update:selectedService="handleServiceChange" />
    <div v-if="showSettings">
      <SettingsPopup @close-settings="closeSettings" />
    </div>
    <OTPDisplay :otp="otp" />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import SettingsPopup from './components/SettingsPopup.vue';
import DropdownBar from './components/DropdownBar.vue';
import OTPDisplay from './components/OTPDisplay.vue';

export default {
  components: { Navbar, SettingsPopup, DropdownBar, OTPDisplay },
  data() {
    return {
      time: '',
      config: null,
      selectedService: '',
      showSettings: false,
      error: null,
      otp: { password: '', expiry: 0, name: '' }
    };
  },
  created() {
    this.updateTime();
    this.fetchConfig();
    this.updateOTP();
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
        this.config = (await response.json()).config;
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
      try {
        const response = await fetch('/api/otp');
        if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
        const data = await response.json();
        this.otp = data;
        console.log(`Password: ${data.password}`);
        console.log(`${data.expiry} seconds remaining`);
      } catch (error) {
        console.error('Error fetching OTP:', error);
      }
    },
    updateOTP() {
      this.fetchOTP();
      setInterval(this.fetchOTP, 1000);
    }
  }
};
</script>
