import { DC } from "../constants";

import { DimensionState } from "./dimension";

// Multiplier applied to all Chaos Dimensions, regardless of tier. This is cached using a Lazy
// and invalidated every update.
export function chaosDimensionCommonMultiplier() {
  let multiplier = DC.D1.timesEffectsOf(
    HardChallengerUpgrade(4),
    HardChallengerUpgrade(5),
    GlitchSpeedUpgrade(5),
    MetaFabricatorUpgrade(17),
    MetaFabricatorUpgrade(5),
  ).mul(GlyphInfo.glitch.sacrificeInfo.effect()).mul(Plynia.multiplier);

  return multiplier;
}

export function getChaosDimensionFinalMultiplierUncached(tier) {
  const dimension = ChaosDimension(tier);
  if (tier < 1 || tier > 12) throw new Error(`Invalid Chaos Dimension tier ${tier}`);
  
  let multiplier = GameCache.chaosDimensionCommonMultiplier.value;

  multiplier = multiplier.mul(Decimal.pow(dimension.perPurchase, dimension.bought));
  if (tier == 1) multiplier = multiplier.mul(GlitchSpeedUpgrade(7).effectOrDefault(1));


  multiplier = applyCDPowers(multiplier, tier);

  // if(multiplier.gt("1e1E15")) multiplier = multiplier.pow( multiplier.log10().div(1e15).pow(0.5).recip() );
  
  return multiplier;
}

function applyCDPowers(mult, tier) {
  let multiplier = mult;

  multiplier = multiplier.pow(getAdjustedGlyphEffect("glitchChaosPow"));

  return multiplier;
}

function onBuyChaosDimension(tier) {
  
}

export function maxAllChaos() {

  for (let tier = 1; tier < 13; tier++) {
    buyMaxChaosDimension(tier);
  }

}

export function buyMaxChaosDimension(tier, bulk = Infinity) {
  const dimension = ChaosDimension(tier);
  if (!dimension.isAvailableForPurchase) return;
  
  let bulkLeft = new Decimal(bulk);

  if (bulkLeft.lte(1)) return;

  // This is the bulk-buy math, explicitly ignored if abnormal cost increases are active
  const maxBought = dimension.costScale.getMaxBought(
    Decimal.floor(dimension.bought), dimension.currencyAmount, DC.D1
  );
  if (maxBought === null) {
    return;
  }
  let buying = maxBought.quantity;
  if (buying.gt(bulkLeft)) buying = bulkLeft;
  dimension.amount = dimension.amount.add(buying).round();
  dimension.bought =  dimension.bought.add(buying);
  if(dimension.currencyAmount.lt('ee15')) dimension.currencyAmount = dimension.currencyAmount.sub(Decimal.pow10(maxBought.logPrice));
}

class ChaosDimensionState extends DimensionState {
  constructor(tier) {
    super(() => player.dimensions.chaos, tier);
    const BASE_COSTS = [null, new Decimal(10), new Decimal(100), new Decimal(1e7), new Decimal(1e14), new Decimal(1e23),
      new Decimal(1e33), new Decimal(1e50), new Decimal(1e60), new Decimal("e350"),
      new Decimal("e1000"),new Decimal("e2250"), new Decimal("e15e3")];
    this._baseCost = BASE_COSTS[tier];
    const BASE_COST_MULTIPLIERS = [null, new Decimal(1e4), new Decimal(1e9), new Decimal(1e15),
      new Decimal(1e20), new Decimal(1e30), new Decimal(1e45), new Decimal(1e60), new Decimal(1e80),
     new Decimal(1e80), new Decimal('e200'), new Decimal('e400'), new Decimal('e1000')];
    this._baseCostMultiplier = BASE_COST_MULTIPLIERS[tier];
    const PER_PURCHASE = [null, 10, 25, 50, 100, 200, 350, 700, 1500, 1e5, 1e10, 1e18, 1e200];
    this.perPurchase = PER_PURCHASE[tier];
  }

  /**
   * @returns {ExponentialCostScaling}
   */
  get costScale() {
    return new ExponentialCostScaling({
      baseCost: this._baseCost,
      baseIncrease: this._baseCostMultiplier,
      costScale: DC.E2,
      scalingCostThreshold: new Decimal("e5000")
    });
  }

  /**
   * @returns {Decimal}
   */
  get cost() {
    return this.costScale.calculateCost(this.bought.floor());
  }

  get howManyCanBuy() {
    const ratio = this.currencyAmount.dividedBy(this.cost);
    return Decimal.floor(Decimal.max(Decimal.min(ratio, 0), 0));
  }

  /**
   * @returns {Decimal}
   */
  get rateOfChange() {
    const tier = this.tier;

    let toGain = ChaosDimension(tier + 1).productionPerSecond;
    
    return toGain.times(10).dividedBy(this.amount.max(1));
  }

  /**
   * @returns {boolean}
   */
  get isProducing() {
    return this.totalAmount.gt(0);
  }

  /**
   * @returns {Decimal}
   */
  get currencyAmount() {
    return Currency.chaosCores.value;
  }

  /**
   * @param {Decimal} value
   */
  set currencyAmount(value) {
    Currency.chaosCores.value = value;
  }

  get totalAmount() {
    return this.amount;
  }

  /**
    * @returns {boolean}
    */
  get isAffordable() {
    return this.cost.lte(this.currencyAmount);
  }

  get isAvailableForPurchase() {
    return true;
  }

  reset() {
    this.amount = DC.D0;
    this.bought = DC.D0;
  }

  resetAmount() {
    this.amount = DC.D0;
  }


  get multiplier() {
    return getChaosDimensionFinalMultiplierUncached(this.tier);
  }

  get productionPerSecond() {
    if(this.amount.eq(0)) return DC.D0;
    
    let production = this.multiplier.mul(this.totalAmount);

    return production;
  }

  static get dimensionCount() { return 12; }

}

/**
 * @function
 * @param {number} tier
 * @return {ChaosDimensionState}
 */
export const ChaosDimension = ChaosDimensionState.createAccessor();

export const ChaosDimensions = {
  /**
   * @type {ChaosDimensionState[]}
   */
  all: ChaosDimension.index.compact(),

  reset() {
    for (const dimension of ChaosDimensions.all) {
      dimension.reset();
    }
  },

  get buyTenMultiplier() {
    return this.perPurchase;
  },

  buy(){
    const dimension = ChaosDimension(this.tier);
    if (!dimension.isAvailableForPurchase || !dimension.isAffordable) return false;
  
    const cost = dimension.cost;
  
    dimension.currencyAmount = dimension.currencyAmount.minus(cost);
  
    dimension.amount = dimension.amount.plus(1);
    dimension.bought++;
  
    onBuyChaosDimension(tier);
  
    return true;
  },

  buyMax(){
    const dimension = ChaosDimension(this.tier);
    if (!dimension.isAvailableForPurchase || !dimension.isAffordable) return false;

    const howMany = dimension.howManyCanBuy;
    const cost = dimension.cost.mul(howMany);
    
    if(dimension.currencyAmount.lt('ee15')) dimension.currencyAmount = dimension.currencyAmount.sub(cost);

    dimension.bought = dimension.bought.add(howMany);
    dimension.amount = dimension.amount.add(howMany);

    onBuyChaosDimension(tier);

    return true;
  },

  tick(diff) {

    for (let tier = 12; tier > 1; --tier) {
      ChaosDimension(tier).produceDimensions(ChaosDimension(tier -1), diff.div(10));
    }

    ChaosDimension(1).produceCurrency(Currency.chaosCores, diff);
  }
  
};

export function resetChaosDimensionsAmount() {
  for (const dim of ChaosDimensions.all) dim.amount = new Decimal(dim.bought);
}