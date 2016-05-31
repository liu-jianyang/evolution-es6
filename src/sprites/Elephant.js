import BehaviorTree from 'behaviortree';
import _ from 'underscore';
import Creature from 'creature';

function hasProperties(tile) {
  return tile && tile.properties && tile.properties.type;
}

export default class extends Creature {

  constructor({game, x, y, map}) {
    var imageRef = 'elephant';
    var deadRef = 'deadelephant';
    super(game, x, y, imageRef, deadRef);
    this.game = game;
    this.map = map;
    this.setName('Elephant');
    this.setHunger(80);
    this.setHealth(500);
    this.setAttack(50);
    this.setDefense(80);
    this.setHungerRate(-2);
    this.setFoodOptions({type: 'tile', element: 'grass'});
    this.setVisionRange(2);
    var bt = new BehaviorTree(game, {
      root: {
        name: 'Search',
        type: 'decorator'
      },
      children: [
          {
            name: 'Sequence',
            type: 'composite',
            children: [
              {
                name: 'EnemyVisible',
                type: 'condition'
              },
              {
                name: 'UntilSucceed',
                type: 'condition',
                children: [
                  {
                    name: 'AttackEnemy',
                    params: 'EnemyVisible',
                    type: 'action'
                  }
                ]
              }
            ]
          }
        ]
    })
    this.setBehavior(bt.getRoot());
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