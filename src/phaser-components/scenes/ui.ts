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
            screenX: 125,
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
            screenX: 40,
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
            screenX: 125,
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
            screenX: 125,
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

        this.commandMenu.container.screenY       = height - 130;
        this.actionMenu.container.screenY        = height - 75;
        this.buildMenu.container.screenY         = height - 130;
        this.buildCategoryMenu.container.screenY = height - 156; 
        this.addActionMenu();

        this.characterStatsUI.container.width = width / 4.5;
        this.characterStatsUI.container.height = height / 2;
        this.characterStatsUI.container.screenX = (width / 2) - ((width / 4) / 2);
        this.characterStatsUI.container.screenY = (height / 2) - ((height / 2) / 2);
    }

    create() {
        this.setContainers();
        this.input.keyboard?.on('keydown-L', () => this.characterStatsUI.isOpen ? this.clearCharacterStats() : this.showCharacterStats());
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
            -55, 
            'Commands \n MOVE', 
            this.actionMenu.container, 
            () => {
                (() => {
                    if(!this.commandMenu.toggleBtn) return;
                    const { posX, posY, width, height } = this.commandMenu.toggleBtn.getRect();
                    this.commandMenu.toggleBtn.box.clear();
                    if(!this.commandMenu.isOpen) this.commandMenu.toggleBtn.box.fillStyle(0x1199ff, 0.75);
                    else this.commandMenu.toggleBtn.box.fillStyle(0x121212, 0.75);
                    this.commandMenu.toggleBtn.box.fillRect(posX, posY, width, height);
                })();
                this.toggleMenu(this.commandMenu, this.addCommandMenuItem);
                if(this.buildMenu.isOpen) {
                    const { posX, posY, width, height } = buildBtn.getRect();
                    buildBtn.box.clear();
                    buildBtn.box.fillStyle(0x121212, 0.75);
                    buildBtn.box.fillRect(posX, posY, width, height);
                    this.toggleMenu(this.buildMenu, this.addBuildCategoryItems);
                    this.toggleMenu(this.buildCategoryMenu, this.addBuildCategoryItems);
                }
            }
        );
        const buildBtn = createButton(
            this,
            0,
            -110,
            'Build \n N/A',
            this.actionMenu.container,
            () => { 
                (() => {
                    const { posX, posY, width, height } = buildBtn.getRect();
                    buildBtn.box.clear();
                    if(!this.buildMenu.isOpen) buildBtn.box.fillStyle(0x1199ff, 0.75);
                    else buildBtn.box.fillStyle(0x121212, 0.75);
                    buildBtn.box.fillRect(posX, posY, width, height);
                })();
                this.toggleMenu(this.buildMenu, this.addBuildMenuItem);
                this.toggleMenu(this.buildCategoryMenu, this.addBuildCategoryItems);
                if(this.commandMenu.isOpen) {
                    if(!this.commandMenu.toggleBtn) return;
                    const { posX, posY, width, height } = this.commandMenu.toggleBtn.getRect();
                    this.commandMenu.toggleBtn.box.clear();
                    this.commandMenu.toggleBtn.box.fillStyle(0x121212, 0.75);
                    this.commandMenu.toggleBtn.box.fillRect(posX, posY, width, height);
                    this.toggleMenu(this.commandMenu, this.addCommandMenuItem);
                }
            },
        )
        const stopCommandBtn = createButton(
            this, 
            0, 
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
            const button = createButton(this, ind * 85, 0, item, this.commandMenu.container, () => setCommand(item));
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
        const [screenX, screenY, width, height] = [
            50, 
            50, 
            0, 
            0
        ];
        const current = this.currentCharacter ? this.currentCharacter.cid : -1
        const newBox = this.add.graphics();
        if(character.cid === current) {
            newBox.fillStyle(0xffffff, 0.5);
        } else {
            newBox.fillStyle(0x222222, 0.5);
        }
        const text = this.add.text(screenX, screenY + (character.cid * 60), `${this.currentCharacter?.currentAction ?? 'N/A'}`);
        newBox.fillRoundedRect(screenX, screenY + (character.cid * 60), 50, 50, 5);
        const newSprite = this.add.image(screenX + 25, screenY + (character.cid * 60) + 25, character.race);
        newBox.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(screenX, screenY + (character.cid * 60), 50, 50),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        });
        newBox.on("pointerdown", () => {
            let newCurrent;
            if(this.currentCharacter?.cid === character?.cid) newCurrent = null
            else newCurrent = character; 
            this.registry.set('selectedCharacter', newCurrent);
        });

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
            slot.box.fillRoundedRect(50, 50 + (ind * 60), 50, 50, 5);
        });     
    }

    characterStatsUI: any = {
        container: {
            screenX: 0,
            screenY: 0,
            width: 0,
            height: 0
        },
        border: undefined,
        box: undefined,
        bars: {
            hp: {
                backdrop: undefined,
                bar: undefined,
                text: undefined,
            },
            hunger: {
                backdrop: undefined,
                bar: undefined,
                text: undefined,
            }
        },
        specialStats: {
            rank: undefined,
            race: undefined,
            name: undefined,
            age: undefined,
        },
        generalStats: {
            str: undefined,
            def: undefined,
            will: undefined,
            spd: undefined,
        },
        skills: {
            header: undefined,
            meele: undefined,
            magic: undefined,
            construction: undefined,
            mining: undefined,
            foraging: undefined,
            logging: undefined,
            cooking: undefined,
            crafting: undefined,
            research: undefined,
            medicinal: undefined,
            fishing: undefined,
        },
        traits: [

        ]
    } 

    clearCharacterStats() {
        this.characterStatsUI.box.destroy();
        this.characterStatsUI.border.destroy();
        for(const stat in this.characterStatsUI.specialStats) {
            this.characterStatsUI.specialStats[stat].destroy();
        }
        for(const stat in this.characterStatsUI.generalStats) {
            this.characterStatsUI.generalStats[stat].destroy();
        }
        for(const skill in this.characterStatsUI.skills) {
            this.characterStatsUI.skills[skill].destroy();
        }
        for(const graphic in this.characterStatsUI.bars.hp) { 
            this.characterStatsUI.bars.hp[graphic].destroy();
        }
        for(const graphic in this.characterStatsUI.bars.hunger) {
            this.characterStatsUI.bars.hunger[graphic].destroy();
        }
        this.characterStatsUI.isOpen = false;
    }

    showCharacterStats() {
        const { screenX, screenY, width, height } = this.characterStatsUI.container;
        this.characterStatsUI.border = this.add.graphics({lineStyle: {color: 0xDAA520, width: 4}});
        this.characterStatsUI.box = this.add.graphics();
        this.characterStatsUI.box.fillStyle(0x111111, 0.9);
        this.characterStatsUI.box.fillRect(screenX, screenY, width, height);
        this.characterStatsUI.box.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(screenX, screenY, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains
        });
        console.log(screenX, screenY, width, height);
        this.characterStatsUI.border.strokeRect(screenX, screenY, width + 1, height + 1);
        this.characterStatsUI.specialStats.name = this.add.text(screenX + (screenX / 4.5), screenY + 10, 'Happy', {fontSize: 25, fontFamily: 'monospace'});
        this.characterStatsUI.specialStats.rank = this.add.text(screenX + 25, screenY + 100, "Rank: E");
        this.characterStatsUI.specialStats.race = this.add.text(screenX + 25, screenY + 120, "Race: Harpy");
        this.characterStatsUI.specialStats.age = this.add.text(screenX + 25, screenY + 140, "Age : 15");
        this.characterStatsUI.generalStats.str = this.add.text(screenX + (screenX / 2.5), screenY + 100, "Str : 18");
        this.characterStatsUI.generalStats.def = this.add.text(screenX + (screenX / 2.5), screenY + 120, "Def : 18");
        this.characterStatsUI.generalStats.will = this.add.text(screenX + (screenX / 2.5), screenY + 140, "Will: 18");
        this.characterStatsUI.generalStats.spd = this.add.text(screenX + (screenX / 2.5), screenY + 160, "Spd : 18");
        
        this.characterStatsUI.bars.hp.backdrop = this.add.graphics();
        this.characterStatsUI.bars.hp.backdrop.fillStyle(0xaa1111);
        this.characterStatsUI.bars.hp.backdrop.fillRect(screenX + 25, screenY + 50, screenX - (screenX / 2), 10);
        this.characterStatsUI.bars.hp.bar = this.add.graphics();
        this.characterStatsUI.bars.hp.bar.fillStyle(0x00aa00);
        this.characterStatsUI.bars.hp.bar.fillRect(screenX + 25, screenY + 50, screenX - (screenX / 2), 10);
        this.characterStatsUI.bars.hp.text = this.add.text(screenX + (screenX / 5), screenY + 47.5, 'Hp : 50 / 50', {fontFamily: 'monospace', fontSize: 14, })
        
        this.characterStatsUI.bars.hunger.backdrop = this.add.graphics();
        this.characterStatsUI.bars.hunger.backdrop.fillStyle(0x121212);
        this.characterStatsUI.bars.hunger.backdrop.fillRect(screenX + 25, screenY + 75, screenX - (screenX / 2), 10);
        this.characterStatsUI.bars.hunger.bar = this.add.graphics();
        this.characterStatsUI.bars.hunger.bar.fillStyle(0x663399);
        this.characterStatsUI.bars.hunger.bar.fillRect(screenX + 25, screenY + 75, screenX - (screenX / 2), 10);
        this.characterStatsUI.bars.hunger.text = this.add.text(screenX + (screenX / 5), screenY + 72.5, 'Hun: 50 / 50', {fontFamily: 'monospace', fontSize: 14, })
        
        this.characterStatsUI.skills.header = this.add.text(screenX + 25, screenY + 190, "Skills", { fontSize: 20, fontStyle: 'bold' });
        this.characterStatsUI.skills.meele = this.add.text(screenX + 25, screenY + 220, "Meele   : 1");
        this.characterStatsUI.skills.magic = this.add.text(screenX + 25, screenY + 240, "Magic   : 1");
        this.characterStatsUI.skills.construction = this.add.text(screenX + 25, screenY + 260, "Build   : 1");
        this.characterStatsUI.skills.mining = this.add.text(screenX + 25, screenY + 280, "Mining  : 1");
        this.characterStatsUI.skills.foraging = this.add.text(screenX + 25, screenY + 300, "Forage  : 1");
        this.characterStatsUI.skills.logging = this.add.text(screenX + 25, screenY + 320, "Logging : 1");
        this.characterStatsUI.skills.cooking = this.add.text(screenX + 25, screenY + 340, "Cooking : 1");
        this.characterStatsUI.skills.crafting = this.add.text(screenX + 25, screenY + 360, "Craft   : 1");
        this.characterStatsUI.skills.research = this.add.text(screenX + 25, screenY + 380, "Research: 1");
        this.characterStatsUI.skills.medicinal = this.add.text(screenX + 25, screenY + 400, "Medic   : 1");
        this.characterStatsUI.skills.fishing = this.add.text(screenX + 25, screenY + 420, "Fish    : 1");
        
        this.characterStatsUI.isOpen = true;
    }
} 