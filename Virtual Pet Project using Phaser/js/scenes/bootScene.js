let bootScene = new Phaser.Scene('Boot');

bootScene.preload = function () {
    this.load.image('logo', 'assets/images/rubber_duck.png');
};

bootScene.create = function () {
    this.start.scene('Loading');
};