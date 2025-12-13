import { DC } from "../../constants";

const rebuyableMul = props => {
  props.cost = () => getHybridCostScaling(
    player.meta.upgrades.rebuyable[props.id],
    DC.E50,
    new Decimal(props.initialCost),
    new Decimal(props.costMult),
    new Decimal(props.costMult / 10),
    DC.E309,
    DC.E3,
    new Decimal(props.initialCost * props.costMult)
  );
  const { effect } = props;
  props.effect = () => Decimal.pow(effect, player.meta.upgrades.rebuyable[props.id]);
  props.description = () => props.textTemplate.replace("{value}", format(effect, 2, 2));
  props.formatEffect = value => formatX(value, 2, 1);
  props.formatCost = value => format(value, 2, 1);
  return props;
};

const rebuyableAdd = props => {
  props.cost = () => getHybridCostScaling(
    player.meta.upgrades.rebuyable[props.id],
    DC.E50,
    new Decimal(props.initialCost),
    new Decimal(props.costMult),
    new Decimal(props.costMult / 10),
    DC.E309,
    DC.E3,
    new Decimal(props.initialCost * props.costMult)
  );
  const { effect } = props;
  props.effect = () => Decimal.pow(effect, player.meta.upgrades.rebuyable[props.id]).add(1).max(1);
  props.description = () => props.textTemplate.replace("{value}", format(effect, 2, 2));
  props.formatEffect = value => formatX(value, 2, 1);
  props.formatCost = value => format(value, 2, 1);
  return props;
};

export const metaFabricatorUpgrades = [
  rebuyableMul({
    name: "Amplifiers Charger",
    id: 1,
    initialCost: 1,
    costMult: 60,
    textTemplate: "All Reality Aplifiers are {value} times higher per purchase",
    effect: 1.5
  }),
  rebuyableMul({
    name: "Dimensional Overclock",
    id: 2,
    initialCost: 1,
    costMult: 9,
    textTemplate: "ADs, IDs and TDs gain a x{value} power",
    effect: 1.25
  }),
  rebuyableMul({
    name: "Singularity Shifter",
    id: 3,
    initialCost: 1,
    costMult: 30,
    textTemplate: "You gain a {value} power to gamespeed",
    effect: 1.5
  }),
  rebuyableMul({
    name: "Maxium Overdue",
    id: 4,
    initialCost: 1,
    costMult: 120,
    textTemplate: "The Singularity cap is {value} times higher",
    effect: 2
  }),
  rebuyableAdd({
    name: "Outer Force",
    id: 5,
    initialCost: 1,
    costMult: 20,
    textTemplate: "Chaos Dimension gain a x{value} power",
    effect: 1e25
  }),
  {
    name: "Acomplate",
    id: 6,
    cost: 1,
    description: "Rift Force is generated outside of Glitch's Reality",
  },
  {
    name: "Pasinacomplo",
    id: 7,
    cost: 2,
    description: "Always passively generate IP, EP and RM, Infinities and Eternities",
  },
  {
    name: "Sanctum",
    id: 8,
    cost: 2,
    description: "Teresa does not reset except for best AM which updates outside of thier Reality",
  },
  {
    name: "Memory Overflow",
    id: 9,
    cost: 2,
    description: "Increase Ra memory caps by 100 (cost scales more) and unlock autobuyers for them",
    effect: () => 100,
    noLabel: true
  },
  {
    name: "Post singularity",
    id: 10,
    cost: 3,
    description: "Start Metas with Lai'tela's Reality fully disablized",
    effect: () => 1,
    noLabel: true
  },
  {
    name: "Timeless",
    id: 11,
    cost: 3,
    description: "Nameless do not reset and gain bonus Tesseracts based on Metas. You also get a autobuyer for Tesseracts",
    effect: () => Currency.metas.value.div(25).pow(0.8),
    formatEffect: value => "+" + format(value,2,2)
  },
  {
    name: "Glitch-lite",
    id: 12,
    cost: 3,
    description: "Glitch Upgrades do not have there requirements reset",
  },
  {
    name: "Rise And Fall",
    id: 13,
    cost: 4,
    description: "Metas boost Meta Relay gain",
    effect: () => Currency.metas.value.pow(1.44).div(15).add(1),
    formatEffect: value => formatX(value, 2, 2)
  },
  {
    name: "Insert Meme Here",
    id: 14,
    cost: 4,
    description: "V Achievements do not reset and remove extreme nerf",
  },
  {
    name: "The Challenger",
    id: 15,
    cost: 6,
    description: "All Challenger upgrades are keeped on meta",
  },
  {
    name: "Automagicly",
    id: 16,
    cost: 8,
    description: "Unlock autobuyers for single purchase Reality and Imaginary upgrades",
  },
  {
    name: "Alchemicaly",
    id: 17,
    cost: 8,
    description: "All Alchemy resorces are always caped and Shifter effects Chaos Dimensions",
    effect: () => AlchemyResource.shifter.effectOrDefault(1),
    formatEffect: value => formatX(value, 2),
  },
  {
    name: "Perky",
    id: 18,
    cost: 12,
    description: "Keep all perks and Dilation autbuyer buy max",
  },
  {
    name: "Glitchy",
    id: 19,
    cost: 25,
    description: "Unlock Glitch upgrade autobuyers",
  },
  {
    name: "Spacous Generator",
    id: 20,
    cost: 80,
    description: "Generate Space Theorems based on Metas (caps at 1000)",
    effect: () => Currency.metas.value.pow(0.75).div(60),
    formatEffect: value => format(value, 2, 2) + "/s"
  },
  {
    name: "Meta Charger",
    id: 21,
    cost: 1e6,
    description: "Gain more Metas based on Metas",
    effect: () => Currency.metas.value.div(60).pow(0.5).add(1),
    formatEffect: value => format(value, 2, 2)
  },
  {
    name: "Nu uh",
    id: 22,
    cost: 5e6,
    description: "Unlock Chaos Dimensions autobuyers and Plynias dont reset",
  },
  {
    name: "Be gone Hardcap",
    id: 23,
    cost: 2e9,
    description: "Increase the Antimatter hardcap based on Metas",
    effect: () => Currency.metas.value.div(15).pow(2.5).add(1).min(1e50),
    formatEffect: value => formatPow(value,2,2),
  },
  {
    name: "Some pointless stuff",
    id: 24,
    cost: 1e12,
    description: "Unlock autobuyers for Singularity cap, Keep Charged Infinity upgrades and Ra memory levels",
  },
  {
    name: "Forgeting someone?",
    id: 25,
    cost: 1e18,
    description: "Unlock 2 Ra memories for Cante and Null",
  },
];
