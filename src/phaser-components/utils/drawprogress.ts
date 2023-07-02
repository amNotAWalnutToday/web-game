interface Bar {
    backdrop: Phaser.GameObjects.Graphics,
    bar: Phaser.GameObjects.Graphics,
}

export default function drawProgress(
        bar: Bar,
        sprite: Phaser.Physics.Arcade.Sprite,
        progress: number,
    ) {
        bar.backdrop.clear();
        bar.bar.clear();
        if(progress > 98) return;
        const barArgs = [sprite.x - 8, sprite.y + ((sprite.height) / 4), 18, 2];
        bar.backdrop.fillStyle(0xff0000);
        bar.backdrop.fillRect(barArgs[0], barArgs[1], barArgs[2], barArgs[3]);
        bar.bar.fillStyle(0x00ff00);
        // bar.bar.fillRect(sprite.x - 8, sprite.y + 16, Math.ceil(progress / (sprite.width / 3)), 2);
        bar.bar.fillRect(sprite.x - 8, sprite.y + ((sprite.height) / 4), Math.ceil(((16 + 2) / 100) * progress), 2);
        bar.bar.setDepth(1);
        bar.backdrop.setDepth(1);
}