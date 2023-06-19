import Phaser from "phaser";

export class Character extends Phaser.Physics.Arcade.Sprite implements Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: Phaser.Textures.Texture, frame: any) {
        super(scene, x, y, texture, frame);

        this.scene.add.existing(this);
    }

    currentAction: any = null;
    actionQueue: string[] = [];
    targetCoords: [number, number] = [0, 0];

    path: any;
    curve: any;
    graphics: any;

    create() {
        this.graphics = this.scene.add.graphics();

        this.path = { t: 0, vec: new Phaser.Math.Vector2() };
        this.curve = new Phaser.Curves.Line(new Phaser.Math.Vector2(100, 100), new Phaser.Math.Vector2(600, 400));
        this.scene.tweens.add({
            targets: this.path,
            t: 1,
            ease: 'Sine.easeInOut',
            duration: 2000,
            yoyo: false,
            repeat: -1
        })
    }

    moveTowardsPoint(tarX: number, tarY: number) {
        const distance = Math.abs(this.x - tarX) + Math.abs(this.y - tarY);

        this.path = { t: 0, vec: new Phaser.Math.Vector2() };
        this.graphics.clear();
        this.graphics = this.scene.add.graphics();
        this.curve = new Phaser.Curves.Line(new Phaser.Math.Vector2(this.x, this.y), new Phaser.Math.Vector2(tarX, tarY));
        this.scene.tweens.add({
            targets: this.path,
            t: 1,
            duration: 1 * distance,
            repeat: 0
        })
    }

    update() {
        if(!this.actionQueue.length && !this.currentAction) return;
        if(!this.currentAction && this.actionQueue.length) {
            const nextAction = this.actionQueue.pop();
            this.currentAction = nextAction;
        }
        if(this.x === this.targetCoords[0]
        && this.y === this.targetCoords[1]
        && this.currentAction === 'MOVE') {
            this.currentAction = null;
            this.graphics.clear();
        }

        if(this.currentAction === 'MOVE') {
            this.graphics.clear();
            // this.graphics.lineStyle(1, 0xffffff, 1);
            // this.graphics.lineTo(100, 100);
    
            this.curve.draw(this.graphics);  
            this.curve.updateArcLengths();
            this.curve.getPoint(this.path.t, this.path.vec);
    
            this.x = this.path.vec.x;
            this.y = this.path.vec.y;
        }
    }
} 