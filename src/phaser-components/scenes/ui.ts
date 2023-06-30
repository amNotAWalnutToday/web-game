import Phaser from "phaser";
import buildspot_items from '../data/buildspot_items.json';
import createButton, { Button, Container } from "../utils/createButton";
import { Character } from "../characters/character";

interface Menu {
    isOpen: boolean,
    container: Container,
    toggleBtn?: Button,
    buttons: Button[], 
    filterBy?: string,
}

interface Slot {
    cid: number,
    sprite: Phaser.GameObjects.Image,
    text: Phaser.GameObjects.Text,
    box: Phaser.GameObjects.Graphics
}

export default class Ui extends Phaser.Scene {
    constructor() {
        super('ui');
    }

    screenWidth = 0;
    screenHeight = 0;

    currentCharacter?: Character | null;
    characters: Character[] = [];
    characterSlots: Slot[] = [];

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
        filterBy: 'STRUCTURE',
    };

    buildCategoryMenu: Menu = {
        isOpen: false,
        container: {
            screenX: 81,
            screenY: this.screenHeight - 126,
            width: 80,
            height: 25,
        },
        toggleBtn: undefined,
        buttons: []
    }

    setContainers = () => {
        const { width, height } = this.registry.get("gameSize");
        console.log(height, width);
        this.screenHeight = height;
        this.screenWidth = width;

        this.commandMenu.container.screenY       = height - 100;
        this.actionMenu.container.screenY        = height - 40;
        this.buildMenu.container.screenY         = height - 100;
        this.buildCategoryMenu.container.screenY = height - 126; 
        this.addActionMenu();
    }

    create() {
        this.setContainers();
        this.characters = this.registry.get('yourCharacters');
        this.currentCharacter = this.registry.get('selectedCharacter');
        if(!this.characters.length) return;

        this.characters.forEach((character: Character)=> {
            this.addSlot(character);
        });

        this.registry.events.on('changedata', (a: unknown, key: string, payload: any) => {
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
                    this.actionMenu.buttons[0].text.setText(`Build \n ${payload ?? 'N/A'}`);
                    break;
                case 'gameSize':
                    this.setContainers();
                    break;
                case 'dunnowhattodowiththisaargbutcantcompileso':
                    console.log(a);
                    break;
            }
        });

        const menuBtn = this.add.graphics();
        this.add.text(this.screenWidth - 65, this.screenHeight - 60, 'Menu', {fontSize: "11px"});
        menuBtn.fillStyle(0x1199ff, 0.75);
        menuBtn.fillCircle(this.screenWidth - 50, this.screenHeight - 50, 25);
        menuBtn.setInteractive({
            hitArea: new Phaser.Geom.Circle(this.screenWidth - 50, this.screenHeight - 50, 25),
            hitAreaCallback: Phaser.Geom.Circle.Contains,
        });
        menuBtn.on("pointerdown", () => {
            this.scene.launch("summon_ui");
        });
        this.addActionMenu();
    }

    addActionMenu = () => {
        this.actionMenu.buttons.forEach(button => button.hide());
        this.actionMenu.buttons = [];
        this.commandMenu.toggleBtn?.hide();
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
            () => { 
                this.toggleMenu(this.buildMenu, this.addBuildMenuItem);
                this.toggleMenu(this.buildCategoryMenu, this.addBuildCategoryItems);
            },
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
        const items: string[] = [];
        for(const item of buildspot_items.items) {
            if(item.category === this.buildMenu.filterBy) items.push(item.type);
        }
        items.forEach((item: string, ind: number) => {
            const button = createButton(this, ind * 85, 0, item, this.buildMenu.container, () => buildsomething(item));
            this.buildMenu.buttons.push(button);
        });
    }

    addBuildCategoryItems = () => {
        const changeCategory = (query: string) => {
            if(this.buildMenu.filterBy === query) return;
            this.buildMenu.filterBy = query;
            this.toggleMenu(this.buildCategoryMenu, this.addBuildCategoryItems);
            this.toggleMenu(this.buildMenu, this.addBuildMenuItem);
            this.time.addEvent({
                delay: 25,
                callback: () => { 
                    this.toggleMenu(this.buildCategoryMenu, this.addBuildCategoryItems);
                    this.toggleMenu(this.buildMenu, this.addBuildMenuItem);
                },
                callbackScope: this,
                loop: false,
            })
        };
        const items: string[] = ['PLANT', 'STRUCTURE'].reverse();
        items.forEach((item: string, ind: number) => {
            const color = item === this.buildMenu.filterBy ? 0x00ff00 : undefined;
            const button = createButton(this, ind * 85, 0, item, this.buildCategoryMenu.container, () => changeCategory(item), {color});
            this.buildCategoryMenu.buttons.push(button);
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
            menu.buttons = [];
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
        this.characterSlots.forEach((slot: Slot, ind: number) => {
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