import { DC } from "../../constants";

class PlyniaReq {
  constructor(amount) {
    this.amount = amount;
  }

  get tier() {
    return Math.min(12, 8 + Plynia.plynias.toNumber());
  }

  get isSatisfied() {
    return ChaosDimension(this.tier).amount.gte(Decimal.floor(this.amount));
  }
}

export class Plynia {
  static get boost() {
    let boost = new Decimal(100);
    return boost;
  }

  static get powBoost() {
    let boost = new Decimal(0.1);
    return boost;
  }

  static get power() {
    const mult = new Decimal(Plynia.powBoost).mul(this.plynias).add(1);
    return mult;
  }

  static get multiplier() {
    const mult = Plynia.boost.pow(this.plynias).clampMin(1);
    return mult;
  }

  static get canBeBought() {
    return true;
  }

  static get requirement() {
    return Plynia.bulkRequirement(Plynia.plynias.add(1));
  }

  static bulkRequirement(bulk) { // add baseReq into it
    if (bulk.lt(5)) return new PlyniaReq(DC.D4);
    let amount = DC.D4.mul(bulk.sub(4));
    return new PlyniaReq(amount);
  }

  static get plynias() {
    return player.celestials.glitch.plynia.floor();
  }

  static resetStuff(){
    if(!Plynia.requirement.isSatisfied) return;
    Currency.chaosCores.reset();
    ChaosDimensions.reset();
    player.celestials.glitch.plynia = player.celestials.glitch.plynia.add(1);
  }

}
