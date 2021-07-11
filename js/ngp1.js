function getMergeablesPower(layer,tier){
    switch(layer){
        case "M":
            var basePower = new Decimal(1.1).pow(tier.add(1).pow(2))
            return basePower
    }
}
function getMergeablesTotalPower(layer){
    switch(layer){
        case "M":
            var power = new Decimal(1)
            for(var i in player.M.clickables) if(player.M.clickables[i].gt(0)) power=power.mul(layers.M.clickables[i].power())
            return power
    }
}
addLayer("M", {
    name: "META", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
      return {
        unlocked: true,
        points: new Decimal(0),
        currentMerge: null,
        timeSinceLastAMerge: 0,
        clickables: { 

        [11]: new Decimal(0), [12]: new Decimal(0), [13]: new Decimal(0), 
        [21]: new Decimal(0), [22]: new Decimal(0), [23]: new Decimal(0), 
        [31]: new Decimal(0), [32]: new Decimal(0), [33]: new Decimal(0), 

    } // Optional default Clickable state
      }
    },
    color: "#4BDC13",
    requires: new Decimal(1e18), // Can be a function that takes requirement increases into account
    resource: "META-point", // Name of prestige currency
    baseResource: "Mergeable Score", // Name of resource prestige is based on
    baseAmount() { return player.sc.points }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.33, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
      mult = new Decimal(1)
      //mult = mult.mul(getMergeablesTotalPower(this.layer)) //mergeable boost
      return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
      exp = new Decimal(1)
      return exp
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
      { key: "m", description: "M: Reset for META points", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    passiveGeneration() {return 0},
    layerShown() { return hasMilestone("sc", 14)||player.M.total.gt(0) },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
      if(layers[resettingLayer].row > this.row) {
        layerDataReset(this.layer, ["automation"]) // This is actually the default behavior
        player.seedColor = getRNGSeed()
      }
    },
    tabFormat: {
        Upgrades: {
            buttonStyle() {return  {'color': 'orange'}},
            content:
                ["main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                "h-line",
                ["blank", "5px"],
                 "buyables"],
        },
        Mergeables: {
            buttonStyle() {return {'border-color': 'orange'}},
            content:
                ["main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                "h-line",
                ["blank", "5px"],
                 "clickables",
                ["display-text", function() {return "Your META Mergeables are providing a "+format(getMergeablesTotalPower("M"))+"x multiplier to Mergeable Score gain."}],
                ["blank", "15px"],
                ],
        },

    },
    update(diff) {
      player.timeSinceLastMerge += diff
      /*
      if (player.automation.p.autoMergeOn && hasMilestone("sc", 2)) {
        player.p.timeSinceLastAMerge = player.p.timeSinceLastAMerge + (diff)
        if (player.p.timeSinceLastAMerge >= getImprovedAutoMergeSpeed("p")) {
          let viableClickables = []
          for (var i in player.p.clickables) {
            viableClickables.push(i)
          }
          let moreViableClickables = []
          for (var i in player.p.clickables) {
            if (!moreViableClickables[player.p.clickables[i].toNumber()]) {
              moreViableClickables[player.p.clickables[i].toNumber()] = []
              moreViableClickables[player.p.clickables[i].toNumber()].push(i)
            } else {
              moreViableClickables[player.p.clickables[i].toNumber()].push(i)
            }
            for (var i in moreViableClickables) {
              while (moreViableClickables[i].length > 1) {
                merge(this.layer, moreViableClickables[i][0], moreViableClickables[i][1], true)
                moreViableClickables[i].pop()
                moreViableClickables[i].pop()
              }
            }
            player.p.timeSinceLastAMerge = 0
              //merge
          }
        }
      }
      */
    },
    automation() {
        /*
      if (player.automation.p.autoBuyerOn && hasMilestone("sc", 1)) {
        for (var i in player.p.clickables) {
          if (player.p.clickables[i].eq(0)) {
            if (!layers.p.clickables[i].unlocked || layers.p.clickables[i].unlocked()) buyAMergable("p", i)
          }
        }
      }
      if (player.automation.p.autoUpgradeOn && hasMilestone("sc", 5)) {
        for (var i in player.p.buyables) {
          buyBuyable(this.layer, i)
        }
      } // autoUpgradeOn
      */
    },
    clickables: {
      rows: 3,
      cols: 3,
      11: {
        title() {
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Empty Spot"
          } else {
            return "Tier " + formatWhole(data)
          }
        },
        display() { // Everything else displayed in the buyable button after the title
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" MP"
          }
          return "Giving a " + format(this.power()) + "x MS boost."
        },
        power() {
          return getMergeablesPower(this.layer,getTier(this.layer, this.id))
        },
        unlocked() { return player[this.layer].unlocked },
        canClick() {
          return true
        },
        onClick() {
         clickAFuckingMergeable(this.layer, this.id)
        },
        style() {
          if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
          if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
          return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
        },
      },
      12: {
        title() {
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Empty Spot"
          } else {
            return "Tier " + formatWhole(data)
          }
        },
        display() { // Everything else displayed in the buyable button after the title
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" MP"
          }
          return "Giving a " + format(this.power()) + "x MS boost."
        },
        power() {
          return getMergeablesPower(this.layer,getTier(this.layer, this.id))
        },
        unlocked() { return player[this.layer].unlocked },
        canClick() {
          return true
        },
        onClick() {
         clickAFuckingMergeable(this.layer, this.id)
        },
        style() {
          if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
          if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
          return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
        },
      },
      13: {
        title() {
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Empty Spot"
          } else {
            return "Tier " + formatWhole(data)
          }
        },
        display() { // Everything else displayed in the buyable button after the title
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" MP"
          }
          return "Giving a " + format(this.power()) + "x MS boost."
        },
        power() {
          return getMergeablesPower(this.layer,getTier(this.layer, this.id))
        },
        unlocked() { return player[this.layer].unlocked },
        canClick() {
          return true
        },
        onClick() {
         clickAFuckingMergeable(this.layer, this.id)
        },
        style() {
          if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
          if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
          return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
        },
      },
      21: {
        title() {
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Empty Spot"
          } else {
            return "Tier " + formatWhole(data)
          }
        },
        display() { // Everything else displayed in the buyable button after the title
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" MP"
          }
          return "Giving a " + format(this.power()) + "x MS boost."
        },
        power() {
          return getMergeablesPower(this.layer,getTier(this.layer, this.id))
        },
        unlocked() { return player[this.layer].unlocked },
        canClick() {
          return true
        },
        onClick() {
         clickAFuckingMergeable(this.layer, this.id)
        },
        style() {
          if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
          if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
          return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
        },
      },
      22: {
        title() {
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Empty Spot"
          } else {
            return "Tier " + formatWhole(data)
          }
        },
        display() { // Everything else displayed in the buyable button after the title
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" MP"
          }
          return "Giving a " + format(this.power()) + "x MS boost."
        },
        power() {
          return getMergeablesPower(this.layer,getTier(this.layer, this.id))
        },
        unlocked() { return player[this.layer].unlocked },
        canClick() {
          return true
        },
        onClick() {
         clickAFuckingMergeable(this.layer, this.id)
        },
        style() {
          if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
          if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
          return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
        },
      },
      23: {
        title() {
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Empty Spot"
          } else {
            return "Tier " + formatWhole(data)
          }
        },
        display() { // Everything else displayed in the buyable button after the title
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" MP"
          }
          return "Giving a " + format(this.power()) + "x MS boost."
        },
        power() {
          return getMergeablesPower(this.layer,getTier(this.layer, this.id))
        },
        unlocked() { return player[this.layer].unlocked },
        canClick() {
          return true
        },
        onClick() {
         clickAFuckingMergeable(this.layer, this.id)
        },
        style() {
          if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
          if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
          return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
        },
      },
      31: {
        title() {
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Empty Spot"
          } else {
            return "Tier " + formatWhole(data)
          }
        },
        display() { // Everything else displayed in the buyable button after the title
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" MP"
          }
          return "Giving a " + format(this.power()) + "x MS boost."
        },
        power() {
          return getMergeablesPower(this.layer,getTier(this.layer, this.id))
        },
        unlocked() { return player[this.layer].unlocked },
        canClick() {
          return true
        },
        onClick() {
         clickAFuckingMergeable(this.layer, this.id)
        },
        style() {
          if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
          if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
          return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
        },
      },
      32: {
        title() {
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Empty Spot"
          } else {
            return "Tier " + formatWhole(data)
          }
        },
        display() { // Everything else displayed in the buyable button after the title
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" MP"
          }
          return "Giving a " + format(this.power()) + "x MS boost."
        },
        power() {
          return getMergeablesPower(this.layer,getTier(this.layer, this.id))
        },
        unlocked() { return player[this.layer].unlocked },
        canClick() {
          return true
        },
        onClick() {
         clickAFuckingMergeable(this.layer, this.id)
        },
        style() {
          if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
          if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
          return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
        },
      },
      33: {
        title() {
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Empty Spot"
          } else {
            return "Tier " + formatWhole(data)
          }
        },
        display() { // Everything else displayed in the buyable button after the title
          let data = getTier(this.layer, this.id)
          if (data == 0) {
            return "Buy Mergeable for "+formatWhole(getMergeableCost(this.layer))+" MP"
          }
          return "Giving a " + format(this.power()) + "x MS boost."
        },
        power() {
          return getMergeablesPower(this.layer,getTier(this.layer, this.id))
        },
        unlocked() { return player[this.layer].unlocked },
        canClick() {
          return true
        },
        onClick() {
         clickAFuckingMergeable(this.layer, this.id)
        },
        style() {
          if (player[this.layer].currentMerge == this.id) return { 'background-color': "#ffffff" }
          if (getTier(this.layer, this.id).eq(0)) return { 'background-color': "#525252" }
          return { 'background-color': getRandomMergeableColor(this.layer, this.id) }
        },
      },
    }
})