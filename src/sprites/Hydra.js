import _ from 'underscore';
import Creature from 'creature';

function hasProperties(tile) {
  return tile && tile.properties && tile.properties.type;
}

export default class extends Creature {

  constructor({game, x, y, map}) {
    this.index = 1;
    var imageRef = 'hydra' + this.index;
    var deadRef = 'deadhydra' + this.index;
    Creature.call(this, game, x, y, imageRef, deadRef);
    this.game = game;
    this.map = map;
    this.setName('Hydra');
    this.setHunger(80);
    this.setHealth(300);
    this.setAttack(70);
    this.setDefense(35);
    this.setVisionRange(10);
  }
    
  playAnimation (direction) {
      // this.animations.play(direction);
  }
  
  // withinRange (enemy) {
      
  // }
  
  eat () {
    //if hungry and can eat tile or whatever's on tile, eat
    if (this.getHunger() < this.minHungerLevel) {
      var tile = this.map.getTile(this.getX(), this.getY());
      if (hasProperties(tile)) {
        var isTileFoodOption = _.find(this.foodOptions, function(option) {
          return option.element === tile.properties.type;
        }) ? true : false;
        if (isTileFoodOption) {
          this.changeHunger(20);
          return true;
        }
      }
          
    }
    return false;
  }
}