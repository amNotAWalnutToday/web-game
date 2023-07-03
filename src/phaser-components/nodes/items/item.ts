export default class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
        super(scene, x, y, texture, frame);

        const groundItems = this.scene.registry.get("groundItems");
        groundItems.add(this);
        this.scene.registry.set("groundItems", groundItems);
    }
}