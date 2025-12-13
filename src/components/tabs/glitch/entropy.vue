<script>
  
import GlitchRift from "./glitchrift";
  
export default {
  name: "entropy",
  components: {
    GlitchRift
  },
  computed: {
    rifts() {
      return GlitchRifts.all;
    },
  },
  methods: {
    totalrifts() {
      return GlitchRifts.all.length;
    }
  },
};
</script>

<template>
    <div class="c-entropy-infotext">
      These Rifts are fill by completing Glitch's challenges.

      <div>
      <GlitchRift
          v-for="rift in rifts"
          :key="rift.config.id"
          :rift="rift"
        />
        </div>
    </div>
  
</template>

<style scoped>
.c-entropy-upgrade-infotext {
  color: var(--color-text);
  margin: -1rem 0 1.5rem;
}
</style>
