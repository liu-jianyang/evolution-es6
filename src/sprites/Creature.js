import Phaser from 'phaser';
import _ from 'underscore';
import Config from 'config';

var MOVE_DURATION = 150;
var DEFAULT_SPEED = 1;
var DEFAULT_HUNGER_RATE = -1;
var DEFAULT_VISION_RANGE = 10;

function renderMods(game, spritesGroup, mods) {
  var modSize = 20;
  var offset = 5;
  var modsGroup = _.find(spritesGroup.children, function(child) {
    return child.name === 'modsGroup';
  });
  modsGroup = modsGroup ? modsGroup : game.add.group(spritesGroup, 'modsGroup');
  var dialogWindow = _.find(spritesGroup.children, function(child) {
    return child.name === 'dialogWindow';
  });
  _.each(mods, function(mod) {
    var length = modsGroup.children.length;
    var modGroup = game.add.group(modsGroup);
    var statsGroup = _.find(spritesGroup.children, function(child) {
      return child.name === 'statsGroup';
    });
    var profile = statsGroup.children[0];
    if (length === 0) {
      game.add.sprite(profile.x + offset, profile.y + profile.width + offset, mod.type, undefined, modGroup);
      game.add.sprite(profile.x + offset, profile.y + profile.width + offset, mod.key, undefined, modGroup);
    } else {
      var lastSprite = modsGroup.children[modsGroup.children.length - 2].children[0];
      if (lastSprite.x + 2*lastSprite.width + offset > dialogWindow.x + dialogWindow.width) {
        //next row
        game.add.sprite(profile.x + offset, lastSprite.y + lastSprite.height + offset, mod.type, undefined, modGroup);
        game.add.sprite(profile.x + offset, lastSprite.y + lastSprite.height + offset, mod.key, undefined, modGroup);
      } else {
        game.add.sprite(lastSprite.x + lastSprite.width + offset, lastSprite.y, mod.type, undefined, modGroup);
        game.add.sprite(lastSprite.x + lastSprite.width + offset, lastSprite.y, mod.key, undefined, modGroup);
      }
    }
  });
}

export default class extends Phaser.Sprite {

  constructor({game, x, y, imageRef, deadRef}) {
    this.game = game;
    var trueX = x * Config.options.tileSize;
    var trueY = y * Config.options.tileSize;
    super(game, trueX, trueY, imageRef);
    this.type = 'creature';
    var statBars = game.add.group();
    this.addChild(statBars);
    var healthBar = game.add.sprite(0, -5, 'healthBar', undefined, statBars);
    healthBar.width = Config.options.tileSize;
    healthBar.height = 2;

    // this.anchor.setTo(0.5, 0.5);
    this.deadRef = deadRef;
    this.maxHungerLevel = 100;
    this.minHungerLevel = this.maxHungerLevel / 2;
    this.notifyHunger = [false, false, false];
  }
  
  setName (name) {
    this.name = name;
  }
  
  getName () {
    return this.name;
  }
  
  setHealth (health) {
    this.maxHealth = health;
    this.health = health;
  }
  
  setAttack (attack) {
    this.attack = attack;
  }
  
  getAttack () {
    return this.attack;
  }
  
  setDefense (defense) {
    this.defense = defense;
  }
  
  getDefense () {
    return this.defense;
  }
  
  changeHealth (amount) {
    var healthBar = _.find(this.children[0].children, function(child) {
      return child.key === 'healthBar'; 
    });
    this.health = Phaser.Math.min(this.maxHealth, this.health + amount);
    if (this.health <= 0) {
      this.die();
    }
    var percent = this.health / this.maxHealth;
    healthBar.width = percent * Config.options.tileSize;
  }
  
  setHunger (hunger) {
    this.hunger = hunger;
  };
  
  getHunger () {
    return this.hunger;
  }

  changeHunger (num) {
    this.hunger += num;
  }

  setHungerRate (rate) {
    this.hungerRate = rate;
  }
  
  getHungerRate () {
    if (this.hungerRate === undefined) {
      return DEFAULT_HUNGER_RATE;
    }
    return this.hungerRate;
  }
  
  setSpeed (rate) {
    this.speed = rate;
  }
  
  getSpeed () {
    if (this.speed === undefined) {
      return DEFAULT_SPEED;
    }
    return this.speed;
  }

  setX (position) {
    this.x = this.x * Config.options.tileSize;
  }
  
  getX () {
    return this.x / Config.options.tileSize;
  }
  
  setY (position) {
    this.y = this.y * Config.options.tileSize;
  }
  
  getY () {
    return this.y / Config.options.tileSize;
  }
  
  getFoodOptions () {
    return this.foodTypes;
  }
  
  setFoodOptions (food) {
    if (!this.foodTypes) {
      this.foodTypes = [];
    }
    if (typeof(food) === 'string') {
      this.foodTypes.push(food);
    } else {
      this.foodTypes.concat(food);
    }
  }
  
  setVisionRange (range) {
    this.visionRange = range;
  }
  
  getVisionRange () {
    if (this.visionRange === undefined) {
      return DEFAULT_VISION_RANGE;
    }
    return this.visionRange;
  }
  
  getPowerLevel () { //TODO
    return this.powerLevel || 1;
  }
  
  addMod (mod) {
    if (!this.mods) {
      this.mods = [];
    }
    this.mods.push(mod);
    renderMods(this.game, this.spritesGroup, [mod]);
  }
  
  removeMod (removeMod) {
    this.mods = _.reject(this.mods, function(mod) {
      return mod.key === removeMod.key; //TODO: Not just straight ===, but need to match properties
    });
    var modsGroup = _.find(this.spritesGroup.children, function(child) {
      return child.name === 'modsGroup';
    });
    if (modsGroup) {
      modsGroup.destroy(true);
    }
    renderMods(this.game, this.spritesGroup, this.mods);
  }
  
  //creature movement
  move (direction) {
    var distanceCovered = this.getSpeed() * Config.options.tileSize;
    this.playAnimation(direction);
    switch(direction) {
      case 'North':
        this.y += distanceCovered;
        break;
      case 'South':
        this.y -= distanceCovered;
        break;
      case 'East':
        this.x += distanceCovered;
        break;
      case 'West':
        this.x -= distanceCovered;
        break;
      default:
        break;
    }
    this.getHungry();
  }
  
  playAnimation (direction) {
    //to be overridden
  }

  getHungry () {
    if (this.getHunger()) {
      this.changeHunger(this.getHungerRate());
      if (this.getHunger() === 0) {
        console.log('Creature dies');
        this.die();
      } else if (this.getHunger() < 10 && !this.notifyHunger[2]) {
        console.log('Starving to death');
        this.notifyHunger[2] = true;
      } else if (this.getHunger() < (this.minHungerLevel / 2) && !this.notifyHunger[1]) {
        console.log('Near starving');
        this.notifyHunger[1] = true;
      } else if (this.getHunger() < this.minHungerLevel && !this.notifyHunger[0]) {
        console.log('Getting hungry...');
        this.notifyHunger[0] = true;
      }
    }
  }
  
  withinRange (enemy) {
    return ((this.getX() === enemy.getX()) && (Phaser.Math.difference(this.getY(), enemy.getY()) === 1)) || 
           ((this.getY() === enemy.getY()) && (Phaser.Math.difference(this.getX(), enemy.getX()) === 1));
  }
  
  harm (enemy) {
    var damage = (this.attack || 1) - (enemy.defense || 1);
    enemy.changeHealth(-Phaser.Math.max(damage, 1));  
  }
  
  receiveSpell (spell) {
    if (spell.target !== 'creature') {
      throw new Error('Spell should not be able to target creature', spell);
    }
    var self = this;
    _.each(spell.info.effects, function(val, key) {
      if (key === 'speed') {
        self.setSpeed(self.getSpeed() + val);
      }
    });
    self.addMod(spell);
  }
  
  eat () {
    //to be overridden
  }
  
  isAlive () {
    return this.health > 0;
  }
  
  canMove () {
    return true; //TODO
  }
  
  canSearch () {
    return true; //TODO
  }
  
  die () {
    this.loadTexture(this.deadRef);
    this.visible = true;
  }
  
  setBehavior (behavior) {
    this.behavior = behavior;
  }
  
  update () {
    if (this.behavior) {
      if (this.behavior.getState() == null) {
        // hasn't started yet so we start it
        this.behavior.start();
      }
      this.behavior.act(this);
    } else {
      var bt = new BehaviorTree(this.game, {
        root: {
          name: 'Repeat',
          type: 'decorator'
        },
        children: [
          {
            name: 'Selector',
            type: 'composite',
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
                      name: 'AttackEnemy',
                      params: 'EnemyVisible',
                      type: 'action'
                    }
                  ]
                },
                {
                  name: 'Sequence',
                  type: 'composite',
                  children: [
                      {
                        name: 'IsHungry',
                        type: 'Condition'
                      },
                      {
                        name: 'Search',
                        type: 'action',
                        params: 'searchLocations'
                      },
                      {
                        name: 'MoveTo',
                        type: 'action',
                        params: ['searchLocations', 0]
                      }
                    ]
                },
                {
                  name: 'Wander',
                  type: 'action'
                }
              ]
          }
        ]
      });
      this.setBehavior(bt.getRoot());
    }
    
    // var x = this.creatureWindow.x;
    // var y = this.creatureWindow.y + 5;
    // this.modSprites = [];
    // _.each(this.mods, function(mod) {
        
    // })
  }
}