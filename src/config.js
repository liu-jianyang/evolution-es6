export default class {

  constructor() {
    this.options = {
      env: 'development',
      parent: 'game-area',
      paths: {
        sprites: '/app/data/images/sprites',
        audio: '/app/data/audio/sprites'
      },
      sfxVolume: 1,
      musicVolume: 0.8,
      tileSize: 32,
      gameSpeed: 1, //max? Update per second
      gameSize: {x: 800, y: 600},
      onLoadUpdate: function() {
      },
      onLoadComplete: function() {
      }
    };
  }
    
  getRelativeGameSize () {
    var x = this.options.gameSize.x / this.options.tileSize;
    var y = this.options.gameSize.y / this.options.tileSize;
    return {x: x, y: y};
  }
  
  doEveryTimeout (fction, timeout, params) {
    var variable;
    return function() {
      if (!variable) {
        console.log('running function');
        fction(params);
        variable = setTimeout(function() {
          variable = undefined;
        }, timeout);
      }
    };
  }

  setMusicVolume (volume) {
      this.options.musicVolume = volume;
  }

  setSfxVolume (volume) {
      this.options.sfxVolume = volume;
  }
}
