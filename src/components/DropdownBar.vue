<template>
  <div class="dropdown-container">
    <select v-if="config" :value="selectedService" @input="handleServiceChange($event.target.value)">
      <option v-for="(service, key) in config" :key="key" :value="key">{{ key.toUpperCase() }}</option>
    </select>
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script>
export default {
  props: {
    config: Object,
    selectedService: String
  },
  methods: {
    handleServiceChange(value) {
      this.$emit('update:selectedService', value);
    },
    setDefaultService() {
      if (this.config && Object.keys(this.config).length > 0 && !this.selectedService) {
        const firstService = Object.keys(this.config)[0];
        console.log(`Auto-selecting first service: ${firstService}`);
        this.$emit('update:selectedService', firstService);
      }
    }
  },
  watch: {
    config: {
      handler() {
        this.setDefaultService();
      },
      immediate: true
    }
  },
  mounted() {
    this.setDefaultService();
    console.log('DropdownBar mounted.');
  }
};
</script>
