import { IntervaledAutobuyerState } from "./autobuyer";

export class ChaosDimensionAutobuyerState extends IntervaledAutobuyerState {
  get tier() {
    return this.id;
  }

  get interval() {
    return 100;
  }

  get name() {
    return ChaosDimension(this.tier).shortDisplayName;
  }

  get fullName() {
    return `${this.name} Chaos Dimension`;
  }

  get data() {
    return player.auto.chaosDims.all[this.tier - 1];
  }
  
  get isUnlocked() {
    return MetaFabricatorUpgrade(22).isBought;
  }

  get hasUnlimitedBulk() {
    return true;
  }

  tick() {
    super.tick();
    buyMaxChaosDimension(this.tier);
  }

  get resetTickOn() {
    return PRESTIGE_EVENT.META;
  }

  static get entryCount() { return 12; }
  static get autobuyerGroupName() { return "Chaos Dimension"; }

  // These are toggled on and off from the group autobuyer checkbox
  static get isActive() { return player.auto.chaosDims.isActive; }
  static set isActive(value) { player.auto.chaosDims.isActive = value; }

}
