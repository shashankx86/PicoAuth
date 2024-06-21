<template>
  <div class="navbar">
    <div id="local-time">{{ time }}</div>
    <div v-if="config" class="navbar-center">
      <div class="dropdown-container">
        <select :value="selectedService" @change="updateSelectedService">
          <option v-for="(service, key) in config" :key="key" :value="key">
            {{ key.toUpperCase() }} - {{ service.id }}
          </option>
        </select>
      </div>
    </div>
    <p v-else>Loading configuration...</p>
    <div class="settings" @click="$emit('toggle-settings')">
      <i class="settings-icon">⚙️</i> Settings
    </div>
  </div>
</template>

<script>
export default {
  props: {
    time: String,
    config: Object,
    selectedService: String
  },
  methods: {
    updateSelectedService(event) {
      this.$emit('update:selectedService', event.target.value);
    }
  }
};
</script>