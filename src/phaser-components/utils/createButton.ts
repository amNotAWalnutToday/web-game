import Phaser from "phaser";

export interface Container {
    screenX: number,
    screenY: number,
    width: number,
    height: number,
    box?: Phaser.GameObjects.Graphics,
}

export interface Button {
    box : Phaser.GameObjects.Graphics,
    text: Phaser.GameObjects.Text,
    hide: () => void,
    getRect: () => Rect,
    select: () => void,
    deselect: () => void,
}

interface Rect {
    posX: number,
    posY: number,
    width: number,
    height: number,
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
            text: scene.add.text(posX, posY, text, {fontFamily: 'monospace', padding: {top: height/7, right: width / 10}}),
            hide,
            getRect,
            select,
            deselect
        } 

        button.box.fillStyle(options.color ?? 0x121212, options.alpha ?? 0.75);
        button.box.fillRoundedRect(posX, posY, width, height, 5);
        button.box.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(posX, posY, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        });
        button.box.on("pointerdown", onClick);

        function getRect() {
            return { posX, posY, width, height };
        }

        function select() {
            button.box.clear();
            button.box.fillStyle(0x1199ff, 0.75);
            button.box.fillRoundedRect(posX, posY, width, height, 5);
        }

        function deselect() {
            button.box.clear();   
            button.box.fillStyle(options.color ?? 0x121212, options.alpha ?? 0.75);
            button.box.fillRoundedRect(posX, posY, width, height, 5);
        }

        function hide() {
            button.box.destroy();
            button.text.destroy();
        }

        return button;
}

export default createButton;
