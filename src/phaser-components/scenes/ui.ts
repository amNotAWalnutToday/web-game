import Phaser from "phaser";

export default class Ui extends Phaser.Scene {
    constructor() {
        super('ui');
    }

    currentCharacter: any;
    characters:any = [];
    characterSlots: any = [];

    create() {
        this.characters = this.registry.get('yourCharacters');
        this.currentCharacter = this.registry.get('selectedCharacter');
        if(!this.characters.length) return;

        this.characters.forEach((character: any)=> {
            this.addSlot(character);
        });

        this.registry.events.on('changedata', (a: any, key: string) => {
            this.currentCharacter = this.registry.get('selectedCharacter');
            this.changeSelectedCharacterBoxs();
        });

        const menuBtn = this.add.graphics();
        const menuText = this.add.text(570, 465, 'Menu', {fontSize: "11px"});
        menuBtn.fillStyle(0x1199ff, 0.75);
        menuBtn.fillCircle(590, 475, 25);
        menuBtn.setInteractive({
            hitArea: new Phaser.Geom.Circle(590, 475, 25),
            hitAreaCallback: Phaser.Geom.Circle.Contains,
        });
        menuBtn.on("pointerdown", () => {
            this.scene.launch("summon_ui");
        });
    }

    addSlot(character) {
        const current = this.currentCharacter ? this.currentCharacter.cid : -1
        const newBox = this.add.graphics();
        if(character.cid === current) {
            newBox.fillStyle(0xffffff, 0.5);
        } else {
            newBox.fillStyle(0x222222, 0.5);
        }
        const text = this.add.text(0 + (character.cid * 60), 0, `${this.currentCharacter?.currentAction ?? 'N/A'}`);
        newBox.fillRoundedRect(0 + (character.cid * 60), 0, 50, 50, 5);
        const newSprite = this.add.image(25 + (character.cid * 60), 25, character.race);
        newBox.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0 + (character.cid * 60), 0, 50, 50),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        });
        newBox.on("pointerdown", () => {
            this.registry.set('selectedCharacter', character);
        });

        const slot = { cid: character.cid,  box: newBox, sprite: newSprite, text };
        this.characterSlots.push(slot);
    }

    changeSelectedCharacterBoxs() {
        this.characterSlots.forEach((slot: any, ind: number) => {
            slot.box.clear();
            slot.text.text = this.characters[ind].currentAction ?? 'N/A';
            if(slot.cid === this.currentCharacter?.cid) {
                slot.box.fillStyle(0xffffff, 0.5);
            } else {
                slot.box.fillStyle(0x222222, 0.5);
            }
            slot.box.fillRoundedRect(0 + (ind * 60), 0, 50, 50, 5);
        });     
    }
} 