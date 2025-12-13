<script>
import CostDisplay from "@/components/CostDisplay";
import DescriptionDisplay from "@/components/DescriptionDisplay";
import EffectDisplay from "@/components/EffectDisplay";
import HintText from "@/components/HintText";
import PrimaryToggleButton from "@/components/PrimaryToggleButton";

export default {
  name: "RemakeUpgrade",
  components: {
    PrimaryToggleButton,
    DescriptionDisplay,
    EffectDisplay,
    CostDisplay,
    HintText
  },
  props: {
    upgrade: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      canBeBought: false,
      isBought: false,
    };
  },
  computed: {
    config() {
      return this.upgrade.config;
    },
    classObject() {
      return {
        "c-reality-upgrade-btn--bought": this.isBought && !this.isUseless,
        "c-reality-upgrade-btn--unavailable": !this.isBought && !this.canBeBought,
        "o-size": true,
      };
    },
  },
  methods: {
    update() {
      const upgrade = this.upgrade;
      this.canBeBought = upgrade.canBeBought;
      this.isBought = !upgrade.isRebuyable && upgrade.isBought;
    },
  }
};
</script>

<template>
    <button
      :class="classObject"
      class="l-reality-upgrade-btn c-reality-upgrade-btn"
      style="width: 18rem; height: 12rem"
      @click.exact="upgrade.purchase()"
    >
      <HintText
        type="realityUpgrades"
        class="l-hint-text--reality-upgrade c-hint-text--reality-upgrade"
      >
        {{ upgrade.name }}
      </HintText>
      <span>
        <DescriptionDisplay :config="config" />
        <template>
          <EffectDisplay
            :config="config"
            br
          />
          <CostDisplay
            v-if="!isBought"
            :config="config"
            br
            name="Challengers Essence"
          />
        </template>
      </span>
    </button>
</template>

<style scoped>

.o-size{
  height: 160px;
}
  
</style>
