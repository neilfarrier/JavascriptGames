let gameScene = new Phaser.Scene('Game');

gameScene.init = function () {
    this.stats = {
        health: 100,
        fun: 100
    };

    this.decayRates = {
        health: -5,
        fun: -2
    }
};

gameScene.create = function () {
    let bg = this.add.sprite(0, 0, 'backyard').setInteractive();
    bg.setOrigin(0, 0);

    bg.on('pointerdown', this.placeItem, this);

    this.pet = this.add.sprite(100, 200, 'pet').setInteractive();
    this.pet.depth = 1;
    this.input.setDraggable(this.pet);

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.createUI();

    this.createHUD();
    this.refreshHUD();

    this.timedEventStats = this.time.addEvent({
        delay: 1000,
        repeat: -1, //it will repeat forever
        callback: function () {
            this.updateStats(this.decayRates);
        },
        callbackScope: this
    });
};

gameScene.createUI = function () {
    this.appleBtn = this.add.sprite(72, 570, 'apple').setInteractive();
    this.appleBtn.customStats = {
        health: 20,
        fun: 0
    };
    this.appleBtn.on('pointerdown', this.pickItem);

    this.candyBtn = this.add.sprite(144, 570, 'candy').setInteractive();
    this.candyBtn.customStats = {
        health: -10,
        fun: 10
    };
    this.candyBtn.on('pointerdown', this.pickItem);

    this.toyBtn = this.add.sprite(216, 570, 'toy').setInteractive();
    this.toyBtn.customStats = {
        health: 0,
        fun: 15
    };
    this.toyBtn.on('pointerdown', this.pickItem);

    this.rotateBtn = this.add.sprite(288, 570, 'rotate').setInteractive();
    this.rotateBtn.customStats = {
        health: 0,
        fun: 20
    };
    this.rotateBtn.on('pointerdown', this.rotatePet);

    this.buttons = [this.appleBtn, this.candyBtn, this.toyBtn, this.rotateBtn];

    this.uiBlocked = false;
    this.uiReady();
};

gameScene.rotatePet = function () {
    if (this.scene.uiBlocked) return;

    this.scene.uiReady();
    this.scene.uiBlocked = true;
    this.alpha = 0.5;

    let scene = this.scene;

    let rotateTween = this.scene.tweens.add({
        targets: this.scene.pet,
        duration: 600,
        angle: 360,
        pause = false,
        callbackScope: this,
        onComplete: function (tween, sprites) {
            this.scene.updateStats(this.customStats);
            //this.scene.stats.fun += this.customStats.fun;

            this.scene.uiReady();
        }
    });
};

gameScene.pickItem = function () {
    if (this.scene.uiBlocked) return;

    this.scene.uiReady();
    this.scene.selectedItem = this;
    this.alpha = 0.5;

    console.log("We are picking the item!");
};

gameScene.uiReady = function () {
    this.selectedItem = null;

    for (let i = 0; i < this.buttons.length; i++) {
        this.buttons[i].alpha = 1;
    }

    this.uiBlocked = false;
};

gameScene.placeItem = function (pointer, localX, localY) {
    if (!this.scene.selectedItem) return;

    if (this.uiBlocked) return;

    let newItem = this.add.sprite(localX, localY, this.selectedItem.textture.key);

    this.uiBlocked = true;

    let petTween = this.tweens.add({
        targets: this.pet,
        duration: 500,
        x: newItem.x,
        y: newItem.y,
        paused: false,
        callbackScope: this,
        onComplete: function (tween, sprites) {
            newItem.destroy();

            this.pet.on('animationComplete', function () {
                this.pet.setFrame(0);
                this.uiReady();
            }, this);

            this.pet.play('funnyfaces');
            this.updateStats(this.selectedItem.customStats);
        }
    });
};

gameScene.createHUD = function () {
    this.healthText = this.add.text(20, 20, 'Health: ', {
        font: '24px Arial',
        fill: '#ffffff'
    });
    this.funText = this.add.text(170, 20, 'Fun: ', {
        font: '24px Arial',
        fill: '#ffffff'
    });
};

gameScene.refreshHUD = function () {
    this.healthText.setText('Health: ' + this.stats.health);
    this.funText.setText('Fun: ' + this.stats.fun);
};

gameScene.updateStats = function (statDifference) {
    let isgameOver = false;

    for (stat in statDifference) {
        if (statDifference.hasOwnProperty(stat)) {
            this.stats[stat] += statDifference[stat];

            if (this.stats[stat] < 0) {
                isgameOver = true;
                this.stats[stat] = 0;
            }
        }
    }
    this.refreshHUD();

    if (isgameOver) this.gameOver();
};

gameScene.gameOver = function () {
    this.uiBlocked = true;
    this.pet.setFrame(4);

    this.time.addEvent({
        delay: 2000,
        repeat: 0,
        callback: function () {
            this.scene.start('Home');
        },
        callbackScope = this
    });
};