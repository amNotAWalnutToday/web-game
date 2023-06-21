import Phaser from "phaser";
import Tree from "../nodes/tree";

export class Character extends Phaser.Physics.Arcade.Sprite implements Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);

        const yourCharacters = this.scene.registry.get("yourCharacters");
        yourCharacters.push(this);
        this.cid = yourCharacters.length - 1;
        this.speed = 1;
        this.scene.registry.set("yourCharacters", yourCharacters);

        this.scene.add.existing(this);
    }

    race = "slime"; 
    cid: number;
    speed: number;

    currentAction: string | null = null;
    actionQueue: string[] = [];
    targetCoords: [number, number] = [0, 0];
    isMoving = false;
    target: Tree | null = null;

    path: any;
    curve: any;
    graphics: any = this.scene.add.graphics();

    private movePath: Phaser.Math.Vector2[] = [];
    private moveToTarget?: Phaser.Math.Vector2;

    create() {
        this.setCollideWorldBounds(true);
    }

    moveAlong(pathA: Phaser.Math.Vector2[]) {
        this.movePath = pathA;
        this.moveTo(this.movePath.shift()!);
    }

    moveTo(target: Phaser.Math.Vector2) {
        this.moveToTarget = target;
        this.scene.time.addEvent({
            delay: 200,
            callback: this.move,
            callbackScope: this,
            loop: false,
        })
    }

    move() {
        if(this.moveToTarget) {
            if(this.movePath.length > 0) {
                this.isMoving = true;
                this.x = this.moveToTarget.x;
                this.y = this.moveToTarget.y;
                this.moveTo(this.movePath.shift()!);
                return;
            } else {
                this.moveToTarget = undefined;
            }
        } else {
            this.currentAction = null;
            const yourCharacters = this.scene.registry.get("yourCharacters");
            for(const char of yourCharacters) {
                if(this.cid === char.cid) yourCharacters[this.cid] = this;
            }
            this.scene.registry.set("yourCharacters", yourCharacters);
        }
    }

    chopTree(tree: Tree) {
        this.target = tree;
        if(this.currentAction !== 'CHOP') return;
        this.scene.time.addEvent({
            delay: 200,
            callback: this.chopTreeToEnd,
            callbackScope: this,
            repeat: tree.durability + 1,
        });
    }

    chopTreeToEnd() {
        if(!this.target) return;
        this.target.loseDurability();
        console.log(this.target.durability);
        if(this.target.durability - 1 < 0) {
            this.target = null;
            this.currentAction = null;
            this.updateCharacters();
        } 
    }

    moveTowardsPoint(tarX: number, tarY: number, path: Phaser.Math.Vector2[]) {
        const distance = Math.abs(this.x - tarX) > Math.abs(this.y - tarY) ? Math.abs(this.x - tarX) : Math.abs(this.y - tarY);
        if(!path.length) return;
        this.movePath = path;

        this.path = { t: 0, vec: new Phaser.Math.Vector2() };
        this.graphics.clear();
        this.graphics = this.scene.add.graphics();
        //this.curve = new Phaser.Curves.Line(new Phaser.Math.Vector2(this.x, this.y), new Phaser.Math.Vector2(tarX, tarY));
        this.curve = new Phaser.Curves.Spline([...path]);
        this.scene.tweens.add({
            targets: this.path,
            t: 1,
            duration: (60 - (this.speed * 2.5)) * distance,
            repeat: 0
        });
    }

    updateCharacters() {
        const yourCharacters = this.scene.registry.get("yourCharacters");
        for(const char of yourCharacters) {
            if(this.cid === char.cid) yourCharacters[this.cid] = this;
        }
        this.scene.registry.set("yourCharacters", yourCharacters);
    }

    update() {
        if(!this.actionQueue.length && !this.currentAction) return;
        if(!this.currentAction && this.actionQueue.length) {
            const nextAction = this.actionQueue.pop();
            this.currentAction = nextAction ?? null;
            this.updateCharacters();
        }

        if(this.movePath.length) {
            if(Math.ceil(this.x) === this.movePath[this.movePath.length - 1].x 
            && Math.ceil(this.y) === this.movePath[this.movePath.length - 1].y 
            && this.currentAction === 'MOVE') {
                this.currentAction = null;
                this.graphics.clear();
                this.updateCharacters();
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

        if(this.currentAction === 'CHOP'
        && this.target) {
            this.chopTree(this.target);
            this.currentAction = null;
        }
    }
} 