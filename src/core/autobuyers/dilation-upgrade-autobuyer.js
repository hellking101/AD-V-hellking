import { IntervaledAutobuyerState } from "./autobuyer";

export class DilationUpgradeAutobuyerState extends IntervaledAutobuyerState {
  get _upgradeName() { return ["dtGain", "galaxyThreshold", "tachyonGain", "dtGainPelle",'galaxyMultiplier', "tickspeedPower"][this.id - 1]; }

  get data() {
    return player.auto.dilationUpgrades.all[this.id - 1];
  }

  get name() {
    return [`Dilated Time Multiplier`, `Tachyon Galaxy Threshold`, "Tachyon Particle Multiplier",
      `Pelle DT Multiplier`, `Tachyon Galaxy Multiplier`, "Tickspeed Power"
    ][this.id - 1];
  }

  get interval() {
    return 1000 * Perk.autobuyerFasterDilation.effectOrDefault(1) / PerkShopUpgrade.autoSpeed.effectOrDefault(1);
  }

  get isUnlocked() {
    if (this.id > 3) return (Pelle.isDoomed || Pelle.joined) && ChallengerUpgrade(9).isBought && Perk.autobuyerDilation.isEffectActive;
    if (ChallengerUpgrade(9).isBought) return Perk.autobuyerDilation.isEffectActive;
    return Perk.autobuyerDilation.isEffectActive && !Pelle.isDoomed;
  }

  get resetTickOn() {
    return PRESTIGE_EVENT.REALITY;
  }

  get bulk() {
    if (MetaFabricatorUpgrade(18).isBought) return new Decimal('1ee15');
    return Effects.product(PerkShopUpgrade.bulkDilation, Perk.dilationAutobuyerBulk);
  }

  tick() {
    super.tick();
    const upgradeName = this._upgradeName;
    DilationUpgrade[upgradeName].purchase(this.bulk);
  }

  static get entryCount() { return 6; }
  static get autobuyerGroupName() { return "Dilation Upgrade"; }
  static get isActive() { return player.auto.dilationUpgrades.isActive; }
  static set isActive(value) { player.auto.dilationUpgrades.isActive = value; }
}
