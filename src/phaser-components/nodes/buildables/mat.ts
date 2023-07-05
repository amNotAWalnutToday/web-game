import createButton, { Button } from "../../utils/createButton";
import Buildable from "./buildable";

export default class Mat extends Buildable {
    constructor(scene: Phaser.Scene, x: number, y: number, texture = 'mat', frame = 0) {
        super(scene, x, y, texture, frame);
        this.setInteractive();
        this.on("pointerdown", () => {
            console.log(this.assignBox.isOpen);
            !this.assignBox.isOpen 
                ? this.showAssignBox()
                : this.clearAssignBox()
        });
        this.setScale(0.5);
        this.setDepth(-1);
    }

    owner: string | null = null;

    private assignBox: {[key: string]: any} = {
        box: this.scene.add.graphics(),
        button: undefined,
        isOpen: false,
    }

    showAssignBox() {
        const assignBed = () => {
            const selectedCharacter = this.scene.registry.get("selectedCharacter");
            if(!selectedCharacter) return this.clearAssignBox();
            selectedCharacter.sleepingArea = this;
            this.owner = selectedCharacter?.name ?? 'N/A';
            this.clearAssignBox();
        }

        this.assignBox.button = createButton(
            this.scene,
            0,
            0,
            `Set Owner \n ${this.owner}`,
            { screenX: this.x, screenY: this.y, width: 100, height: 50 },
            () => assignBed(),
        );
        this.assignBox.isOpen = true;
    }

    clearAssignBox() {
        this.assignBox.box?.destroy();
        this.assignBox.button?.hide();
        this.assignBox.isOpen = false;
    }
}