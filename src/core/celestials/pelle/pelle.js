import { Currency } from "../../currency";
import { DC } from "../../constants";
import { RebuyableMechanicState } from "../../game-mechanics/rebuyable";
import { SetPurchasableMechanicState } from "../../utils";

import { Quotes } from "../quotes";

import wordShift from "../../word-shift";

import zalgo from "./zalgo";


const disabledMechanicUnlocks = {
  achievements: () => !ChallengerUpgrade(1).isBought,
  IPMults: () => !ChallengerUpgrade(7).isBought,
  EPMults: () => !ChallengerUpgrade(7).isBought,
  InfinitiedMults: () => !ChallengerUpgrade(6).isBought,
  infinitiedGen: () => !ChallengerUpgrade(0).isBought,
  eternityMults: () => !ChallengerUpgrade(6).isBought,
  autoec: () => false,
  replicantiIntervalMult: () => !ChallengerUpgrade(2).isBought,
  tpMults: () => !ChallengerUpgrade(9).isBought,
  glyphs: () => !(PelleRifts.vacuum.milestones[0].canBeApplied || ChallengerUpgrade(19).isBought),
  V: () => !ChallengerUpgrade(15).isBought,
  singularity: () => !ChallengerUpgrade(17).isBought,
  continuum: () => !ChallengerUpgrade(17).isBought,
  alchemy: () =>  !ChallengerUpgrade(11).isBought,
  achievementMult: () => !ChallengerUpgrade(1).isBought,
  blackhole: () => !ChallengerUpgrade(14).isBought,
  effarig: () => !ChallengerUpgrade(13).isBought,
  glyphsac: () => !ChallengerUpgrade(12).isBought,
  antimatterDimAutobuyer1: () => PelleUpgrade.antimatterDimAutobuyers1,
  antimatterDimAutobuyer2: () => PelleUpgrade.antimatterDimAutobuyers1,
  antimatterDimAutobuyer3: () => PelleUpgrade.antimatterDimAutobuyers1,
  antimatterDimAutobuyer4: () => PelleUpgrade.antimatterDimAutobuyers1,
  antimatterDimAutobuyer5: () => PelleUpgrade.antimatterDimAutobuyers2,
  antimatterDimAutobuyer6: () => PelleUpgrade.antimatterDimAutobuyers2,
  antimatterDimAutobuyer7: () => PelleUpgrade.antimatterDimAutobuyers2,
  antimatterDimAutobuyer8: () => PelleUpgrade.antimatterDimAutobuyers2,
  tickspeedAutobuyer: () => PelleUpgrade.tickspeedAutobuyer,
  dimBoostAutobuyer: () => PelleUpgrade.dimBoostAutobuyer,
  galaxyAutobuyer: () => PelleUpgrade.galaxyAutobuyer,
  timeTheoremAutobuyer: () => !ChallengerUpgrade(8).isBought,
  rupg10: () => !ChallengerUpgrade(3).isBought,
  dtMults: () => !ChallengerUpgrade(9).isBought,
  chargedInfinityUpgrades: () => !ChallengerUpgrade(16).isBought,
  alteration: () => !ChallengerUpgrade(16).isBought,
};

export const Pelle = {
  symbol: "♅",
  // Suppress the randomness for this form
  possessiveName: "Pelle's",

  // This is called upon initial Dooming and after every Armageddon when using the modal
  initializeRun() {
    if (this.isDoomed) {
      Pelle.armageddon(true);
      return;
    }

    if (player.pelleResets > 0) Pelle.quotes.pellesChallenger.show();

    player.celestials.glitch.run = false;
    
    if (!Pelle.joined)  {
      Glyphs.harshAutoClean();
      if (!Glyphs.unequipAll()) {
        Modal.hideAll();
        Modal.message.show(`Dooming your Reality will unequip your Glyphs. Some of your
          Glyphs could not be unequipped due to lack of inventory space.`, 1);
        return;
      }
      Glyphs.harshAutoClean();
      if (Glyphs.freeInventorySpace < 5) {
        Modal.hideAll();
        Modal.message.show(`You must have enough empty unprotected Glyph slots for
          ${formatInt(5)} additional Glyphs in order to Doom your Reality.`, 1);
        return;
      }
      for (const type of GlyphInfo.basicGlyphTypes) Glyphs.addToInventory(GlyphGenerator.doomedGlyph(type));
    } else {
      if (!Glyphs.unequipAll()) {
        Modal.hideAll();
        Modal.message.show(`Dooming your Reality will unequip your Glyphs. Some of your
          Glyphs could not be unequipped due to lack of inventory space.`, 1);
        return;
      }
    }
    
    Glyphs.refreshActive();
    player.options.confirmations.glyphReplace = false;
    if (BlackHoles.arePaused) BlackHoles.togglePause();
    player.celestials.pelle.doomed = true;
    Pelle.armageddon(false);
    respecTimeStudies(true);
    Currency.infinityPoints.reset();
    player.IPMultPurchases = DC.D0;
    Autobuyer.bigCrunch.mode = AUTO_CRUNCH_MODE.AMOUNT;
    disChargeAll();
    clearCelestialRuns();

    // Force-enable the group toggle for AD autobuyers to be active; whether or not they can actually tick
    // is still handled through if the autobuyers are unlocked at all. This fixes an odd edge case where the player
    // enters cel7 with AD autobuyers disabled - AD autobuyers need to be reupgraded, but the UI component
    // for the group toggle is hidden until they're all re-upgraded to the max again.
    player.auto.antimatterDims.isActive = true;

    player.buyUntil10 = true;
    player.records.realTimeDoomed = DC.D0;

    // Force-unhide all tabs except for the shop tab, for which we retain the hide state instead
    const shopTab = ~1 & (1 << GameDatabase.tabs.find(t => t.key === "shop").id);
    player.options.hiddenTabBits &= shopTab;

    // Force unhide MOST subtabs, although some of the tabs get ignored since they don't contain any
    // meaningful interactable gameplay elements in Doomed
    const tabsToIgnore = ["statistics", "achievements", "reality", "celestials", "glitch", "meta"];
    const ignoredIDs = GameDatabase.tabs.filter(t => tabsToIgnore.includes(t.key)).map(t => t.id);
    for (let tabIndex = 0; tabIndex < GameDatabase.tabs.length; tabIndex++) {
      player.options.hiddenSubtabBits[tabIndex] &= ignoredIDs.includes(tabIndex) ? -1 : 0;
    }
    Pelle.quotes.initial.show();
    GameStorage.save(true);
  },

  get joined() {
    return player.celestials.pelle.joined;
  },

  get displayName() {
    return Date.now() % 4000 > 500 ? "Pelle" : wordShift.randomCrossWords("Pelle");
  },

  get isUnlocked() {
    return ImaginaryUpgrade(25).isBought;
  },
  // This will check if a specific mechanic is disabled, like old PelleFlag(x).isActive,
  // Initially it will only have isDoomed check but we will have upgrades that let you get stuff back
  isDisabled(mechanic) {
    if (!this.isDoomed) return false;

    if (!mechanic) return true;
    if (!disabledMechanicUnlocks[mechanic]) {
      // eslint-disable-next-line
      console.error(`Mechanic ${mechanic} isn't present in the disabledMechanicUnlocks!`);
      return true;
    }

    const upgrade = disabledMechanicUnlocks[mechanic]();

    if (typeof upgrade === "boolean") {
      return upgrade;
    }

    return Boolean(!upgrade.canBeApplied);
  },

  get canArmageddon() {
    return this.remnantsGain.gte(1) || player.celestials.pelle.records.totalAntimatter.gt(DC.PelleMax);
  },

  armageddon(gainStuff) {
    if (player.celestials.pelle.records.totalAntimatter.gt(DC.PelleMax)) {
      Pelle.reset();
      finishProcessReality({ reset: true, armageddon: true });
      player.celestials.pelle.doomed = false;
      player.dilation.active = false;
      applyRUPG10();
      let gain = DC.D5.timesEffectsOf(
        HardChallengerUpgrade(0),
        HardChallengerUpgrade(3),
        GlitchSpeedUpgrade(6),
        HardChallengerUpgrade(7),
      )
      Currency.challengersEssence.add(gain);
      player.pelleResets++;
      Achievement(188).unlock();
      Glyphs.refreshActive();
      return;
    }
    if (!this.canArmageddon && gainStuff) return;
    EventHub.dispatch(GAME_EVENT.ARMAGEDDON_BEFORE, gainStuff);
    if (gainStuff) {
      this.cel.remnants = this.cel.remnants.add(this.remnantsGain);
    }
    finishProcessReality({ reset: true, armageddon: true });
    disChargeAll();
    player.celestials.enslaved.isStoringReal = false;
    player.celestials.enslaved.autoStoreReal = false;
    if (PelleStrikes.dilation.hasStrike) player.dilation.active = true;
    realityUGs.all[13].isBought ? PelleStrikes.all[5].trigger() : false;
    EventHub.dispatch(GAME_EVENT.ARMAGEDDON_AFTER, gainStuff);
  },

  gameLoop(diff) {
    if (this.isDoomed || this.joined) {
      Currency.realityShards.add(this.realityShardGainPerSecond.times(diff).div(1000));
      if (ChallengerUpgrade(19).isBought) PelleRifts.all.forEach(r => r.rift.active = true);
      PelleRifts.all.forEach(r => r.fill(diff));
      if (ChallengerUpgrade(20).isBought) this.cel.remnants = this.cel.remnants.add(this.remnantsGain);
    }
  },

  get cel() {
    return player.celestials.pelle;
  },

  get isDoomed() {
    return this.cel.doomed;
  },

  get disabledAchievements() {
    if (ChallengerUpgrade(1).isBought) return [];
    return [164, 156, 143, 142, 141, 137, 134, 133, 132, 131, 126, 125, 118, 117, 116, 113, 111, 104, 103, 95, 93, 92,
      91, 87, 85, 78, 76, 74, 65, 55, 54, 37];
  },

  get uselessInfinityUpgrades() {
    if (ChallengerUpgrade(0).isBought) return [];
    return ["passiveGen", "ipMult", "infinitiedGeneration"];
  },

  get uselessTimeStudies() {
    if (ChallengerUpgrade(2).isBought) return [];
    return [32, 33, 41, 51, 61, 62, 121, 122, 123, 141, 142, 143, 192, 213];
  },

  get disabledRUPGs() {
    if (ChallengerUpgrade(3).isBought) return [];
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 19, 20, 22, 23, 24];
  },

  get uselessPerks() {
    if (ChallengerUpgrade(4).isBought) return [];
    return [10, 12, 13, 14, 15, 16, 17, 30, 40, 41, 42, 43, 44, 45, 46, 51, 52,
      53, 60, 61, 62, 80, 81, 82, 83, 100, 103, 104, 105, 106, 201, 202, 203, 204];
  },

  get specialGlyphEffect() {
    const isUnlocked = this.isDoomed && PelleRifts.chaos.milestones[1].canBeApplied;
    const description = this.getSpecialGlyphEffectDescription(this.activeGlyphType);
    const eff = this.activeGlyphType == "effarig";
    const isActive = type => isUnlocked && (this.activeGlyphType === type || eff && ['power', 'time', 'replication', 'infinity', 'dilation'].includes(type));
    return {
      isUnlocked,
      description,
      infinity: (isActive("infinity") && player.challenge.eternity.current <= 8)
        ? Currency.infinityPoints.value.plus(1).pow(eff ? 0.1 : 0.2)
        : DC.D1,
      time: isActive("time")
        ? Currency.eternityPoints.value.plus(1).pow(eff ? 0.1 : 0.3)
        : DC.D1,
      replication: isActive("replication")
        ? 10 ** 55 ** Math.min(1, PelleRifts.vacuum.percentage * (eff ? 0.75 : 1))
        : 1,
      dilation: isActive("dilation")
        ? Decimal.pow(player.dilation.totalTachyonGalaxies, eff ? 1.2 : 1.5).max(1)
        : DC.D1,
      power: isActive("power")
        ? (eff ? 1.01 : 1.02)
        : 1,
      effarig: isActive("effarig"),
      reality: isActive("reality"),
      cursed: isActive("cursed")
        ? 0.5
        : 1,
      companion: isActive("companion")
        ? 1.34
        : 1,
      isScaling: () => ["infinity", "time", "replication", "dilation"].includes(this.activeGlyphType),
    };
  },

  getSpecialGlyphEffectDescription(type) {
    switch (type) {
      case "infinity":
        return `Infinity Point gain ${player.challenge.eternity.current <= 8
          ? formatX(Currency.infinityPoints.value.plus(1).pow(0.2), 2)
          : formatX(DC.D1, 2)} (based on current IP)`;
      case "time":
        return `Eternity Point gain ${formatX(Currency.eternityPoints.value.plus(1).pow(0.3), 2)}
          (based on current EP)`;
      case "replication":
        return `Replication speed ${formatX(10 ** 55 ** Math.min(1, PelleRifts.vacuum.percentage), 2)} \
        (based on ${wordShift.wordCycle(PelleRifts.vacuum.name)})`;
      case "dilation":
        return `Dilated Time gain ${formatX(Decimal.pow(player.dilation.totalTachyonGalaxies, 1.5).max(1), 2)}
          (based on Tachyon Galaxies)`;
      case "power":
        return `Galaxies are ${formatPercents(0.02)} stronger`;
      case "effarig":
        if (ChallengerUpgrade(21).isBought) return `Grants the Pelle specific effects of all basic Glyph types with redused effect`
        return `You cannot equip this Glyph while Doomed!`;
      case "reality":
        if (ChallengerUpgrade(21).isBought) return `You can equip an additional four Glyph`
        return `You cannot equip this Glyph while Doomed!`;
      case "cursed":
        if (ChallengerUpgrade(21).isBought) return `Galaxies are ${formatPercents(0.5)} weaker`
        return `You cannot equip this Glyph while Doomed!`;
      case "companion":
        return `You feel ${formatPercents(0.34)} better`;
      // Undefined means that there is no glyph equipped, needs to be here since this function is used in
      // both Current Glyph Effects and Glyph Tooltip
      case undefined:
        return "No Glyph equipped!";
      default:
        return "You cannot equip this Glyph while Doomed!";
    }
  },

  get remnantRequirementForDilation() {
    return 3.8e7;
  },

  get canDilateInPelle() {
    return this.cel.remnants.gte(this.remnantRequirementForDilation);
  },

  resetResourcesForDilation() {
    this.cel.records.totalAntimatter = new Decimal("1e180000");
    this.cel.records.totalInfinityPoints = new Decimal("1e60000");
    Currency.eternityPoints.reset();
    this.cel.records.totalEternityPoints = new Decimal("1e1100");
  },

  get remnantsGain() {
    let am = this.cel.records.totalAntimatter.plus(1).log10();
    let ip = this.cel.records.totalInfinityPoints.plus(1).log10();
    let ep = this.cel.records.totalEternityPoints.plus(1).log10();

    if (PelleStrikes.dilation.hasStrike) {
      am = am.times(500);
      ip = ip.times(10);
      ep = ep.times(5);
    }

    const gain = am.add(2).log10().add(ip.add(2).log10()).add(ep.add(2).log10()).div(1.64).pow(7.5);

    return gain.lt(1) ? gain : Decimal.floor(gain.minus(this.cel.remnants));
  },

  realityShardGain(remnants) {
    return Decimal.pow(10, Decimal.pow(remnants, (1 / 7.5)).times(4)).minus(1).div(1e3);
  },

  get realityShardGainPerSecond() {
    return this.realityShardGain(this.cel.remnants);
  },

  get nextRealityShardGain() {
    return this.realityShardGain(this.remnantsGain.add(this.cel.remnants));
  },

  // Calculations assume this is in units of proportion per second (eg. 0.03 is 3% drain per second)
  get riftDrainPercent() {
    return 0.1;
  },

  get glyphMaxLevel() {
    return PelleUpgrade.glyphLevels.effectValue;
  },

  get glyphStrength() {
    return DC.D1;
  },

  antimatterDimensionMult(x) {
    return Decimal.pow(10, Decimal.log10(x.add(1)).add(x.pow(5.1).div(1e3)).add(DC.D4.pow(x).div(1e19)));
  },

  get activeGlyphType() {
    return Glyphs.active.filter(Boolean)[0]?.type;
  },

  get hasGalaxyGenerator() {
    if (HardChallengerUpgrade(1).isBought && Pelle.isDoomed) return true;
    return player.celestials.pelle.galaxyGenerator.unlocked;
  },

  // Transition text from "from" to "to", stage is 0-1, 0 is fully "from" and 1 is fully "to"
  // Also adds more zalgo the bigger the stage
  transitionText(from, to, stage = 0) {
    const len = Math.round((from.length * (1 - stage) + to.length * stage) * 1e8) / 1e8;
    const toInterval = len * (1 - stage);
    let req = toInterval;
    let str = "";
    for (let i = 0; i < len; i++) {
      if (i >= req) {
        const idx = Math.floor(i * (to.length / len));
        str += to[idx];
        req += toInterval;
      } else {
        const idx = Math.floor(i * (from.length / len));
        str += from[idx];
      }
    }
    return zalgo(str, Math.floor(stage ** 2 * 7));
  },

  zalgo(text, stage = 1.5) {
    const len = Math.round((text.length * (1 - stage) + text.length * stage) * 1e8) / 1e8;
    const toInterval = len * (1 - stage);
    let req = toInterval;
    let str = "";
    for (let i = 0; i < len; i++) {
      if (i >= req) {
        const idx = Math.floor(i * (text.length / len));
        str += text[idx];
        req += toInterval;
      } else {
        const idx = Math.floor(i * (text.length / len));
        str += text[idx];
      }
    }
    return zalgo(str, Math.floor(stage ** 2 * 7));
  },

  endTabNames: "I Need To Put A Joke Here Just Like The Redemption Mod Um Eh Uh ???".split(" "),

  quotes: Quotes.pelle,
  reset() {
    GameEnd.additionalEnd = 0;
    player.isGameEnd = false;
    player.records.thisMeta.maxAM = DC.D0;

    if (!ChallengerUpgrade(19).isBought) player.celestials.pelle.progressBits = 0;

    player.celestials.pelle.upgrades = new Set();
    player.celestials.pelle.remnants = DC.D0;
    player.celestials.pelle.realityShards = DC.D0;
    player.celestials.pelle.records = {
      totalAntimatter: DC.D0,
      totalInfinityPoints: DC.D0,
      totalEternityPoints: DC.D0,
    }

    player.celestials.pelle.rebuyables = {
      antimatterDimensionMult: DC.D0,
      timeSpeedMult: DC.D0,
      glyphLevels: DC.D0,
      infConversion: DC.D0,
      galaxyPower: DC.D0,
      galaxyGeneratorAdditive: DC.D0,
      galaxyGeneratorMultiplicative: DC.D0,
      galaxyGeneratorAntimatterMult: DC.D0,
      galaxyGeneratorIPMult: DC.D0,
      galaxyGeneratorEPMult: DC.D0,
    }

    player.celestials.pelle.rifts = {
      vacuum: {
          fill: DC.D0,
          active: false,
          reducedTo: 1
      },
      decay: {
          fill: DC.D0,
          active: false,
          percentageSpent: 0,
          reducedTo: 1
      },
      chaos: {
          fill: DC.D0,
          active: false,
          reducedTo: 1
      },
      recursion: {
          fill: DC.D0,
          active: false,
          reducedTo: 1
      },
      paradox: {
          fill: DC.D0,
          active: false,
          reducedTo: 1
      },
      glitch: {
          fill: DC.D0,
          active: false,
          reducedTo: 1
      }
    }

    player.celestials.pelle.galaxyGenerator = {
      unlocked: false,
      spentGalaxies: DC.D0,
      generatedGalaxies: DC.D0,
      phase: 0,
      sacrificeActive: false
    }
    
  },

};

EventHub.logic.on(GAME_EVENT.ARMAGEDDON_AFTER, () => {
  if (Currency.remnants.gte(1)) {
    Pelle.quotes.arm.show();
  }
});

EventHub.logic.on(GAME_EVENT.PELLE_STRIKE_UNLOCKED, () => {
  if (PelleStrikes.infinity.hasStrike) {
    Pelle.quotes.strike1.show();
  }
  if (PelleStrikes.powerGalaxies.hasStrike) {
    Pelle.quotes.strike2.show();
  }
  if (PelleStrikes.eternity.hasStrike) {
    Pelle.quotes.strike3.show();
  }
  if (PelleStrikes.ECs.hasStrike) {
    Pelle.quotes.strike4.show();
  }
  if (PelleStrikes.dilation.hasStrike) {
    Pelle.quotes.strike5.show();
  }
  if (PelleStrikes.glitch.hasStrike) {
    Pelle.quotes.strike6.show();
  }
});

export class RebuyablePelleUpgradeState extends RebuyableMechanicState {
  get currency() {
    return Currency.realityShards;
  }

  get boughtAmount() {
    return player.celestials.pelle.rebuyables[this.id];
  }

  set boughtAmount(value) {
    player.celestials.pelle.rebuyables[this.id] = value;
  }

  get isCapped() {
    return this.boughtAmount.gte(this.config.cap);
  }

  get isCustomEffect() { return true; }

  get effectValue() {
    return this.config.effect(this.boughtAmount);
  }

  onPurchased() {
    if (this.id === "glyphLevels") EventHub.dispatch(GAME_EVENT.GLYPHS_CHANGED);
  }
}

export class PelleUpgradeState extends SetPurchasableMechanicState {

  get set() {
    return player.celestials.pelle.upgrades;
  }

  get currency() {
    return Currency.realityShards;
  }

  get description() {
    return this.config.description;
  }

  get cost() {
    return this.config.cost;
  }

  get isAvailableForPurchase() {
    return Pelle.isDoomed;
  }

}

export const PelleUpgrade = mapGameDataToObject(
  GameDatabase.celestials.pelle.upgrades,
  config => (config.rebuyable
    ? new RebuyablePelleUpgradeState(config)
    : new PelleUpgradeState(config)
  )
);

PelleUpgrade.rebuyables = PelleUpgrade.all.filter(u => u.isRebuyable);
PelleUpgrade.singles = PelleUpgrade.all.filter(u => !u.isRebuyable).sort((a, b) => a.cost - b.cost);