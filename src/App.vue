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
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import SettingsPopup from './components/SettingsPopup.vue';

export default {
  components: {
    Navbar,
    SettingsPopup
  },
  data() {
    return {
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(/am|pm/i, (match) => match.toUpperCase()),
      config: null,
      selectedService: '',
      showSettings: false,
      error: null,
    };
  },
  created() {
    this.updateTime();
    this.fetchConfig();
  },
  methods: {
    updateTime() {
      setInterval(() => {
        this.time = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).replace(/am|pm/i, (match) => match.toUpperCase());
      }, 1000);
    },
    async fetchConfig() {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) {
          throw new Error(`HTTP error status: ${response.status}`);
        }
        const data = await response.json();
        this.config = data.config;
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
    }
  }
};
</script>
