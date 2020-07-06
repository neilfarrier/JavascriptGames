let gameScene = new Phaser.Scene("Game");

gameScene.init = function () {
    this.playerSpeed = 3;

    this.enemyMinimumSpeed = 2;
    this.enemyMaximumSpeed = 4;

    this.enemyMinimumY = 80;
    this.enemyMaximumY = 280;

    this.isTerminating = false;
};

gameScene.preLoad = function () {
    this.load.image("background", "assets/background.png");
    this.load.image("player", "assets/player.png");
    this.load.image("enemy", "assets/dragon.png");
    this.load.image("goal", "assets/treasure.png");
};

gameScene.create = function () {
    let bg = this.add.sprite(0, 0, "background");
    bg.setOrigin(0, 0);

    this.player = this.add.sprite(40, this.sys.game.config.height / 2, "player");
    this.player.setScale(0.5);

    this.goal = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, "goal");
    this.goal.setScale(0.5);

    this.enemies = this.add.group({
        key: "enemy",
        repeat: 5,
        setXY: {
            x: 90,
            y: 100,
            stepX: 80,
            stepY: 20
        }
    });

    Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);

    Phaser.Actions.Call(this.enemies.getChildren(), function (enemy) {
        enemy.flipX = true;
        let direction = Math.random() < 0.5 ? 1 : -1;
        let speed = this.enemyMinimumSpeed + Math.random() * (this.enemyMaximumSpeed * this.enemyMinimumSpeed);
        this.speed = direction * speed;
    }, this);
};

gameScene.update = function () {
    if (this.isTerminating) return;

    if (this.input.activePointer.isDown) {
        this.player.x += this.playerSpeed;
    }

    let playerRect = this.player.getBounds();
    let treasureRect = this.goal.getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {

        this.gameOver();
        return;
    }

    let enemies = this.enemies.getChildren();
    let numberOfEnemies = enemies.length;

    for (let i = 0; i < numberOfEnemies; i++) {

        enemies[i].y += enemies[i].speed;

        let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinimumY;
        let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaximumY;

        if (conditionUp || conditionDown) {
            enemies[i].speed * -1;
        }

        let enemyRect = enemies[i].getBounds();

        if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
            this.gameOver();
            return;
        }
    }
};

gameScene.gameOver = function () {
    this.isTerminating = true;

    this.cameras.main.shake(500);

    this.cameras.main.on("camerashakecomplete", function (camera, effect) {
        this.cameras.main.fade(500);
    }, this);

    this.cameras.main.on("camerafadeoutcomplete,", function (camera, effect) {
        this.scene.restart();
    }, this);
};

let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scene: gameScene
};

let game = new Phaser.Game(config);