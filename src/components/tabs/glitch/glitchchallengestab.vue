<script>
import preinfinityupgradebutton from "./preinfinityupgrade";
  
export default {
  name: "GlitchChallengesTab",
  components: {
    preinfinityupgradebutton
  },
  methods: {
    id1(row, column) {
      return (row - 1) * 4 + column - 1;
    },
    id2(row, column) {
      return (row - 1) * 3 + column - 1;
    },
    id3(row, column) {
      return (row - 1) * 3 + column - 1;
    },
    id4(row, column) {
      return (row - 1) * 7 + column - 1;
    }
  },
  computed: {
    upgrades1: () => preInfinityUGs.all,
    upgrades2: () => breakInfinityUGs.all,
    upgrades3: () => eternityUGs.all,
    upgrades4: () => realityUGs.all,
  }
};
  
</script>

<template>
  <div class="l-reality-upgrade-grid">
    <div class="c-preinfinity-infotext">
      Completing one of Glitch's Challenges give a reward to make progression easier.<br>
      If one is missed you can complete it later for a small price.
    </div>
  
      <div
      v-for="row in 2"
      :key="row"
      class="l-reality-upgrade-grid__row">
          <preinfinityupgradebutton
            v-for="column in 4"
            :key="id1(row, column)"
            :upgrade="upgrades1[id1(row, column)]"/>
    </div>

    <div style="display: flex; flex-wrap: wrap; justify-content: center">
      <div
      v-for="row in 2"
        :key="row + 2"
        class="l-reality-upgrade-grid__row">
          <preinfinityupgradebutton
            v-for="column in 3"
            :key="id2(row, column)"
            :upgrade="upgrades2[id2(row, column)]"/>
      </div>
  
      <div
      v-for="row in 2"
        :key="row + 4"
        class="l-reality-upgrade-grid__row">
          <preinfinityupgradebutton
            v-for="column in 3"
            :key="id3(row, column)"
            :upgrade="upgrades3[id3(row, column)]"/>
      </div>
    </div>

    <div
    v-for="row in 2"
      :key="row + 6"
      class="l-reality-upgrade-grid__row">
        <preinfinityupgradebutton
          v-for="column in 7"
          :key="id4(row, column)"
          :upgrade="upgrades4[id4(row, column)]"/>
    </div>
    
  </div>
</template>

<style scoped>
.c-preinfinity-infotext {
  color: var(--color-text);
  margin: 1.5rem 0 1.5rem;
}
</style>
