import Phaser from "phaser";
import createButton, { Button, Container } from "../utils/createButton";
import { Character } from "../characters/character";

interface Menu {
    isOpen: boolean,
    container: Container,
    toggleBtn?: Button,
    buttons: Button[], 
}

export default class Ui extends Phaser.Scene {
    constructor() {
        super('ui');
    }

    screenWidth = 600;
    screenHeight = 480;

    currentCharacter?: Character | null;
    characters: Character[] = [];
    characterSlots: any = [];

    commandMenu: Menu = {
        isOpen: false,
        container: {
            screenX: 0,
            screenY: this.screenHeight - 100,
            width: 80,
            height: 50,
        },
        toggleBtn: undefined,
        buttons: [],
    };

    actionMenu: Menu = {
        isOpen: false,
        container: {
            screenX: 0,
            screenY: this.screenHeight - 40,
            width: 80,
            height: 50,
        },
        toggleBtn: undefined,
        buttons: [],
    };

    buildMenu: Menu = {
        isOpen: false,
        container: {
            screenX: 81,
            screenY: this.screenHeight - 100,
            width: 80,
            height: 50,
        },
        toggleBtn: undefined,
        buttons: [],
    };

    create() {
        this.screenWidth = this.scene.systems.canvas.width;
        this.screenHeight = this.scene.systems.canvas.height;
        this.characters = this.registry.get('yourCharacters');
        this.currentCharacter = this.registry.get('selectedCharacter');
        if(!this.characters.length) return;

        this.characters.forEach((character: Character)=> {
            this.addSlot(character);
        });

        this.registry.events.on('changedata', (a: any, key: string, payload: any) => {
            switch(key) {
                case 'yourCharacters':
                    this.changeSelectedCharacterBoxs();
                    break;
                case 'selectedCharacter':
                    this.currentCharacter = payload;
                    this.changeSelectedCharacterBoxs();
                    break;
                case 'selectedCommand':
                    if(!this.commandMenu.toggleBtn) break;
                    this.commandMenu.toggleBtn.text.text = `Commands \n ${payload}`
                    break;
                case 'selectedBuildItem':
                    if(payload && this.commandMenu.toggleBtn) this.commandMenu.toggleBtn.text.text = `Commands \n Build`; 
                    this.actionMenu.buttons[0].text.text = `Build \n ${payload ?? 'N/A'}`;
                    break;
            }
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

        this.commandMenu.toggleBtn = createButton(
            this, 
            0,
            0, 
            'Commands \n MOVE', 
            this.actionMenu.container, 
            () => this.toggleMenu(this.commandMenu, this.addCommandMenuItem)
        );
        const buildBtn = createButton(
            this,
            85,
            0,
            'Build',
            this.actionMenu.container,
            () => this.toggleMenu(this.buildMenu, this.addBuildMenuItem),
            { color: 0x11af33 },
        )
        const stopCommandBtn = createButton(
            this, 
            170, 
            0, 
            'Cancel', 
            this.actionMenu.container, 
            () => this.cancelActions(),
            { color: 0xff0000 },
        );
        this.actionMenu.buttons.push(buildBtn, stopCommandBtn);
    }

    addBuildMenuItem = () => {
        const buildsomething = (item: string) => {
            this.registry.set("selectedBuildItem", item.toUpperCase());
        };
        const items: string[] = ['Chest', 'Crafting \n Area'];
        items.forEach((item: string, ind: number) => {
            const button = createButton(this, ind * 85, 0, item, this.buildMenu.container, () => buildsomething(item));
            this.buildMenu.buttons.push(button);
        });
    }

    addCommandMenuItem = () => {
        const setCommand = (command: string) => {
            const currentCharacter = this.registry.get("selectedCharacter");
            if(command === 'CARRY') {
                if(!currentCharacter) return;
                currentCharacter.actionQueue.unshift("CARRY");
                this.registry.set("selectedCharacter", currentCharacter);
                return;
            } else if(command === 'CHOP') {
                if(!currentCharacter) return;
                currentCharacter.actionQueue.unshift("CHOP");
                this.registry.set("selectedCharacter", currentCharacter);
                return;
            }
            this.registry.set("selectedCommand", command);
            return;
        }

        const items: string[] = ['MOVE', 'CHOP', 'CARRY'];
        items.forEach((item: string, ind: number) => {
            const button = createButton(this, 0, ind * -55, item, this.commandMenu.container, () => setCommand(item));
            this.commandMenu.buttons.push(button);
        });
    }

    toggleMenu = (menu: Menu, openCommand: () => void) => {
        if(menu.isOpen) {
            menu.buttons.forEach((button: Button) => button.hide());
        } else {
            openCommand();
        }

        menu.isOpen = !menu.isOpen;
    }

    addSlot(character: Character) {
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
            let newCurrent;
            if(this.currentCharacter?.cid === character?.cid) newCurrent = null
            else newCurrent = character; 
            this.registry.set('selectedCharacter', newCurrent);
        });

        this.add.text(0 + (character.cid * 60), 60, `${character.speed}`); 

        const slot = { cid: character.cid, box: newBox, sprite: newSprite, text };
        this.characterSlots.push(slot);
    }

    cancelActions() {
        this.currentCharacter = this.registry.get("selectedCharacter");
        if(!this.currentCharacter) return;
        this.currentCharacter.currentAction = null;
        this.currentCharacter.actionQueue = [];
        this.currentCharacter.graphics.clear();
        this.currentCharacter.cancelBuild();
        this.currentCharacter.target = null;
        this.currentCharacter.isDoing = false;
        this.registry.set('selectedCharacter', this.currentCharacter);
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