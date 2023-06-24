import Phaser from "phaser";

export interface Container {
    screenX: number,
    screenY: number,
    width: number,
    height: number,
}

export interface Button {
    box : Phaser.GameObjects.Graphics,
    text: Phaser.GameObjects.Text,
    hide: () => void,
}

interface Options {
    color?: number,
    alpha?: number, 
}

const createButton = (
        scene: Phaser.Scene, 
        containerX: number, 
        containerY: number,
        text: string,
        container: Container,
        onClick: () => void,
        options: Options = {},
    ) => {
        const { screenX, screenY, width, height } = container;
        const [posX, posY] = [screenX + containerX, screenY + containerY];

        const button = {
            box: scene.add.graphics(),
            text: scene.add.text(posX, posY, text),
            hide,
        } 

        button.box.fillStyle(options.color ?? 0x1199ff, options.alpha ?? 0.75);
        button.box.fillRoundedRect(posX, posY, width, height, 5);
        button.box.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(posX, posY, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        });
        button.box.on("pointerdown", onClick);
        
        function hide() {
            button.box.destroy();
            button.text.destroy();
        }

        return button;
}

export default createButton;
