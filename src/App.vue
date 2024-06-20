<template>
  <div>
    <Navbar :time="time" :config="config" :selectedService="selectedService" @toggle-settings="toggleSettings" @update:selectedService="handleServiceChange" />
    <div v-if="showSettings">
      <SettingsPopup @close-settings="closeSettings" />
    </div>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import SettingsPopup from './components/SettingsPopup.vue';
import DropdownBar from './components/DropdownBar.vue';

export default {
  components: { Navbar, SettingsPopup, DropdownBar },
  data() {
    return { time: '', config: null, selectedService: '', showSettings: false, error: null };
  },
  created() { this.updateTime(); this.fetchConfig(); },
  methods: {
    updateTime() {
      const updateCurrentTime = () => {
        this.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).replace(/am|pm/i, match => match.toUpperCase());
      };
      updateCurrentTime();
      setInterval(updateCurrentTime, 1e3);
    },
    async fetchConfig() {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
        this.config = (await response.json()).config;
      } catch (error) { console.error('Error fetching config:', error); this.error = 'Failed to load configuration.'; }
    },
    handleServiceChange(service) { this.selectedService = service; },
    toggleSettings() { this.showSettings = !this.showSettings; },
    closeSettings() { this.showSettings = !1; }
  }
};
</script>
