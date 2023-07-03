import Phaser from "phaser";
import buildspot_items from '../data/buildspot_items.json';
import createButton, { Button, Container } from "../utils/createButton";
import { Character } from "../characters/character";

interface FilterBy {
    item?: string,
    scroll?: [number, number, number],
}

interface Menu {
    isOpen: boolean,
    container: Container,
    toggleBtn?: Button,
    buttons: Button[], 
    filterBy?: FilterBy,
}

interface Slot {
    cid: number,
    sprite: Phaser.GameObjects.Image,
    text: Phaser.GameObjects.Text,
    box: Phaser.GameObjects.Graphics,
    button: Button,
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
    escapeCameraBtn?: Button = undefined;

    gameFunctionsMenu:any = {
        box: undefined,
        border: undefined,
        canShow: true,
    };

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
        filterBy: { 
            scroll: [0, 2, 4],
        },
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
        filterBy: { 
            item: 'STRUCTURE',
            scroll: [0, 2, 2]
        },
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

    inspectMenu: Menu = {
        isOpen: false,
        container: {
            screenX: this.screenWidth / 2.25 + 25,
            screenY: this.screenHeight - 126,
            width: 100,
            height: 100,
            box: undefined,
        },
        buttons: [],
    }

    setContainers = () => {
        const { width, height } = this.registry.get("gameSize");
        this.screenHeight = height;
        this.screenWidth = width;

        this.gameFunctionsMenu.canShow = height > 499;

        this.commandMenu.container.screenY       = height - 130;
        this.actionMenu.container.screenY        = height - 75;
        this.buildMenu.container.screenY         = height - 130;
        this.buildCategoryMenu.container.screenY = height - 156; 
        this.inspectMenu.container.screenX       = width / 2.25 + 75;
        this.inspectMenu.container.screenY       = height - 130;
        this.addActionMenu();

        this.mapStatsUI.container.screenX = width - 125;
        this.mapStatsUI.container.screenY = height - 130;

        this.characterStatsUI.container.width = width > 500 ? width / 4.5 : width - 25;
        this.characterStatsUI.container.height = width > 500 ? height / 2 : height - 200;
        this.characterStatsUI.container.screenX = width > 500 ? (width / 2) - ((width / 4) / 2) : 12.5;
        this.characterStatsUI.container.screenY = width > 500 ? (height / 2) - ((height / 2) / 2) : 125;
        
        // this.characterStatsUI.container.width = width > 500 ? width / 4.5 : width - 25;
        // this.characterStatsUI.container.height = width > 500 ? height / 2 : height - 200;
        // this.characterStatsUI.container.screenX = width > 500 ? (width / 2) - ((width / 4) / 2) : 12.5;
        // this.characterStatsUI.container.screenY = width > 500 ? (height / 2) - ((height / 2) / 2) : 125;
    }

    create() {
        this.setContainers();
        this.characters = this.registry.get('yourCharacters');
        this.currentCharacter = this.registry.get('selectedCharacter');
        if(!this.characters.length) return;

        const escapeCamera = () => {
            const isCameraLocked = this.registry.get("isCameraLocked");
            this.registry.set("isCameraLocked", !isCameraLocked);
            !isCameraLocked ? this.escapeCameraBtn?.select() : this.escapeCameraBtn?.deselect();
        }
        this.escapeCameraBtn = createButton(this, 0, 0, '', {width: 25, height: 25, screenX: 15, screenY: 67}, escapeCamera);
        this.escapeCameraBtn.select();
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
                    if(this.commandMenu.isOpen) this.reopenMenu(this.commandMenu, this.addCommandMenuItem);
                    break;
                case 'selectedCommand':
                    if(!this.commandMenu.toggleBtn) break;
                    this.commandMenu.toggleBtn.text.text = `Commands`
                    break;
                case 'selectedBuildItem':
                    if(payload && this.commandMenu.toggleBtn) this.commandMenu.toggleBtn.text.text = `Commands \n Build`; 
                    this.actionMenu.buttons[0].text.setText(`Build \n ${payload ?? 'N/A'}`);
                    break;
                case 'selectedInspection':
                case 'storage': 
                    if(this.inspectMenu.isOpen) this.reopenMenu(this.inspectMenu, this.addInspectItemMenu);
                    else this.toggleMenu(this.inspectMenu, this.addInspectItemMenu);
                    break;
                case 'gameTime':
                    this.mapStatsUI.time.setText(`${payload.hour < 10 ? `0${payload.hour}` : payload.hour}:00, Day: ${payload.day}`);
                    this.characters = this.registry.get("yourCharacters");
                    if(this.characterStatsUI.isOpen) this.drawCharacterStatBars(this.characters[this.characterStatsUI.cid]);
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
        this.addMapStatMenu();
    }

    addActionMenu = () => {
        this.actionMenu.buttons.forEach(button => button.hide());
        this.actionMenu.buttons = [];
        this.commandMenu.toggleBtn?.hide();
        
        if(this.gameFunctionsMenu.canShow) {
            this.gameFunctionsMenu.box?.destroy();
            this.gameFunctionsMenu.border?.destroy();
    
            this.gameFunctionsMenu.box = this.add.graphics();
            this.gameFunctionsMenu.box.fillStyle(0x000000, 0.25);
            this.gameFunctionsMenu.box.fillRect(30, this.screenHeight - 200, this.screenWidth / 2.25, 190);
            this.gameFunctionsMenu.border = this.add.graphics({lineStyle: {width: 2, color: 0xdaa52a}});
            this.gameFunctionsMenu.border.strokeRect(28, this.screenHeight - 200, this.screenWidth / 2.25, 190);
        }

        this.commandMenu.toggleBtn = createButton(
            this, 
            0,
            -55, 
            'Commands', 
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
                    this.registry.set("selectedBuildItem", null);
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
                this.registry.set("selectedBuildItem", null);
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
            this.reopenMenu(this.buildMenu, this.addBuildMenuItem);
        };
        const items: string[] = ['DESTROY'];
        for(const item of buildspot_items.items) {
            if(item.category === this.buildMenu.filterBy?.item) items.push(item.type);
        }

        const scrollLeft =  createButton(this, 0, 0, '<', this.buildMenu.container, () => this.scroll(this.buildMenu, 'left', this.addBuildMenuItem), {width: 15});
        this.buildMenu.buttons.push(scrollLeft);
        items.forEach((item: string, ind: number) => {
            const selectedItem = this.registry.get("selectedBuildItem");
            const color = item.toUpperCase() === selectedItem ? 0xdaa52a : undefined;
            const [placeX, placeY] = item === 'DESTROY' ? [0, 55] : [20 + (ind - 1) * 85, 0]; 
            const button = createButton(this, placeX, placeY, item, this.buildMenu.container, () => buildsomething(item), {color});
            this.buildMenu.buttons.push(button);
        });
        const scrollRight = createButton(this, 20 + ((this.buildMenu.buttons.length - 2) * 85), 0, '>', this.buildMenu.container, () => this.scroll(this.buildMenu, 'right', this.addBuildMenuItem), {width: 15});
        this.buildMenu.buttons.push(scrollRight);
        this.hideScrollButtons(this.buildMenu, [scrollLeft, scrollRight]);
    }

    addBuildCategoryItems = () => {
        const changeCategory = (query: string) => {
            if(this.buildMenu.filterBy?.item === query
            || !this.buildMenu.filterBy?.item) return;
            this.buildMenu.filterBy.item = query;
            this.reopenMenu(this.buildCategoryMenu, this.addBuildCategoryItems);
            this.reopenMenu(this.buildMenu, this.addBuildMenuItem);
        };

        const items: string[] = ['PLANT', 'STRUCTURE'].reverse();
        items.forEach((item: string, ind: number) => {
            const color = item === this.buildMenu.filterBy?.item ? 0xdaa52a : undefined;
            const button = createButton(this, ind * 85, 0, item, this.buildCategoryMenu.container, () => changeCategory(item), {color});
            this.buildCategoryMenu.buttons.push(button);
        });
    }

    addCommandMenuItem = () => {
        const setCommand = (command: string) => {
            const currentCharacter = this.registry.get("selectedCharacter");
            if(!currentCharacter) return;
            currentCharacter.actionQueue.unshift(command);
            this.registry.set("selectedCharacter", currentCharacter);
            this.registry.set("selectedCommand", command);
            this.reopenMenu(this.commandMenu, this.addCommandMenuItem);
        }

        const items: string[] = ['DESTROY', 'CHOP', 'CARRY', 'FISH', 'MINE'];

        const scrollLeft =  createButton(this, 0, 0, '<', this.commandMenu.container, () => this.scroll(this.commandMenu, 'left', this.addCommandMenuItem), {width: 15});
        this.commandMenu.buttons.push(scrollLeft);
        items.forEach((item: string, ind: number) => {
            const filter = this.commandMenu.filterBy?.scroll;
            if(!filter?.length) return;
            if(filter[0] > ind || filter[1] < ind) return;
            const currentCharacter = this.registry.get("selectedCharacter");
            const color = (
                currentCharacter &&
                currentCharacter.getClosestQueueAction(item)
            ) 
                ? 0x1199ff 
                : undefined;
            const button = createButton(this, 20 + (ind * 85) - (Number(filter[0]) * 85), 0, item, this.commandMenu.container, () => setCommand(item), {color});
            this.commandMenu.buttons.push(button);
        });
        const scrollRight = createButton(this, 20 + ((this.commandMenu.buttons.length - 1) * 85), 0, '>', this.commandMenu.container, () => this.scroll(this.commandMenu, 'right', this.addCommandMenuItem), {width: 15});
        this.commandMenu.buttons.push(scrollRight);
        this.hideScrollButtons(this.commandMenu, [scrollLeft, scrollRight]);
    }

    addInspectItemMenu = () => {
        const { screenX, screenY, width, height } = this.inspectMenu.container;
        const target = this.registry.get("selectedInspection");
        if(!target) return;
        this.inspectMenu.container.box = this.add.graphics();
        this.inspectMenu.container.box?.fillStyle(0x121212, 0.75);
        this.inspectMenu.container.box?.fillRect(screenX, screenY, width, height);
        const inventory = target?.inventory ? target.inventory : target.storage;
        inventory.forEach((item: {[key: string]: string}, ind: number) => {
            const text = this.add.text(screenX + 5, screenY + 20 + (ind * 20), `${item.type}: ${item.amount}`);
            const textItem = {
                text,
                box: this.add.graphics(),
                deselect: () => null,
                select: () => null,
                getRect: () => ({ width: 0, height: 0, posX: 0, posY: 0}),
                hide: () => text.destroy()
            }
            this.inspectMenu.buttons.push(textItem);
        });
    }

    hideScrollButtons(menu: Menu, buttons: Button[]) {
        if(!menu.filterBy?.scroll) return;
        if(menu.filterBy?.scroll[0] === 0) buttons[0].hide();
        if(menu.filterBy?.scroll[1] === menu.filterBy?.scroll[2]) {
            buttons[1].hide();
        }
    }
    
    scroll = (menu: Menu, dir: string, openCommand: () => void) => {
        const filter = menu.filterBy?.scroll;
        if(!menu.filterBy || !filter) return;
        if(dir === 'left') {
            if(filter[0] <= 0) return;
            menu.filterBy.scroll = [filter[0] - 1, filter[1] - 1, filter[2]];
        } else if(dir === 'right') {
            if(filter[2] <= filter[1]) return;
            menu.filterBy.scroll = [filter[0] + 1, filter[1] + 1, filter[2]];
        }
        this.reopenMenu(menu, openCommand);
        return menu;
    }

    reopenMenu = (menu: Menu, openCommand: () => void) => {
        this.toggleMenu(menu, openCommand);
        this.time.addEvent({
            delay: 25,
            callback: () => this.toggleMenu(menu, openCommand),
            callbackScope: this,
            loop: false,
        });
    }

    toggleMenu = (menu: Menu, openCommand: () => void) => {
        if(menu.isOpen) {
            if(menu.container.box) menu.container.box.destroy();
            menu.buttons.forEach((button: Button) => button.hide());
            menu.buttons = [];
        } else {
            openCommand();
        }

        menu.isOpen = !menu.isOpen;
    }

    addSlot(character: Character) {
        const container = {
            screenX: 50, 
            screenY: 50,
            width: 50,
            height: 20,
        };
        const { screenX, screenY } = container;
        const current = this.currentCharacter ? this.currentCharacter.cid : -1
        const newBox = this.add.graphics();
        if(character.cid === current) {
            newBox.fillStyle(0xffffff, 0.5);
        } else {
            newBox.fillStyle(0x222222, 0.5);
        }
        const text = this.add.text(screenX + (character.cid * 60), screenY, `${this.currentCharacter?.currentAction ?? 'N/A'}`);
        newBox.fillRoundedRect(screenX + (character.cid * 60), screenY , 50, 50, 5);
        const newSprite = this.add.image(screenX + (character.cid * 60) + 25, screenY + 25, character.race);
        newBox.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(screenX + (character.cid * 60), screenY, 50, 50),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        });
        const openStats = (cid: number) => {
            if(this.characterStatsUI.isOpen
            && this.characterStatsUI.cid === cid) {
                this.clearCharacterStats();
            } else {
                this.clearCharacterStats();
                const chars = this.registry.get("yourCharacters");
                this.time.addEvent({delay: 25, callback: () => this.showCharacterStats(chars[cid]), callbackScope: this})
            }
        }
        const statbutton = createButton(this, (character.cid * 60), 51, 'Stats', container, () => openStats(character.cid));
        newBox.on("pointerdown", () => {
            let newCurrent;
            if(this.currentCharacter?.cid === character?.cid) newCurrent = null
            else newCurrent = character; 
            this.registry.set('selectedCharacter', newCurrent);
        });

        const slot = { cid: character.cid, box: newBox, sprite: newSprite, text, button: statbutton };
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
        this.currentCharacter.pickupTarget = null;
        this.currentCharacter.isDoing = false;
        this.currentCharacter.destroyQueue = [];
        this.registry.set("selectedBuildItem", null);
        this.reopenMenu(this.buildMenu, this.addBuildMenuItem);
        this.registry.set('selectedCharacter', this.currentCharacter);
    }

    changeSelectedCharacterBoxs() {
        if(this.characterSlots.length !== this.characters.length) {
            for(const slot of this.characterSlots) {
                slot.box.destroy();
                slot.sprite.destroy();
                slot.text.destroy();
                slot.button.hide();
            }
            this.characterSlots = [];
            for(const char of this.characters) {
                this.addSlot(char);
            }
            if(this.characterStatsUI.isOpen) this.clearCharacterStats();
            return;
        }

        this.characterSlots.forEach((slot: Slot, ind: number) => {
            slot.box.clear();
            slot.text.text = this.characters[ind].currentAction ?? 'N/A';
            if(slot.cid === this.currentCharacter?.cid) {
                if(this.currentCharacter?.stats.hp < this.currentCharacter?.stats.maxhp) {
                    slot.sprite.setTint(0xaa1122);
                } else {
                    slot.sprite.clearTint();
                }
                slot.box.fillStyle(0xffffff, 0.5);
            } else {
                slot.box.fillStyle(0x222222, 0.5);
            }
            slot.box.fillRoundedRect(50 + (ind * 60), 50, 50, 50, 5);
        });     
    }

    mapStatsUI: any = {
        container: {
            screenX: this.screenWidth - 250,
            screenY: this.screenHeight - 130,
            width: 0,
            height: 0
        },
        time: undefined
    }

    addMapStatMenu() {
        const { screenX, screenY, width, height } = this.mapStatsUI.container;
        const { hour, day } = this.registry.get("gameTime");
        this.mapStatsUI.time = this.add.text(screenX, screenY, `${hour < 10 ? `0${hour}` : hour}:00, Day: ${day}`, {fontFamily: 'monospace'});
    }

    characterStatsUI: any = {
        container: {
            screenX: 0,
            screenY: 0,
            width: 0,
            height: 0
        },
        cid: 0,
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
        if(!this.characterStatsUI.isOpen) return;
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

    drawCharacterStatBars(selectedCharacter: Character) {
        const { screenX, screenY } = this.characterStatsUI.container;
        const { hp, maxhp, hunger, maxHunger } = selectedCharacter.stats;
        this.characterStatsUI.bars.hp.backdrop?.destroy();
        this.characterStatsUI.bars.hp.bar?.destroy();
        this.characterStatsUI.bars.hp.text?.destroy();
        this.characterStatsUI.bars.hunger.backdrop?.destroy();
        this.characterStatsUI.bars.hunger.bar?.destroy();
        this.characterStatsUI.bars.hunger.text?.destroy();

        this.characterStatsUI.bars.hp.backdrop = this.add.graphics();
        this.characterStatsUI.bars.hp.backdrop.fillStyle(0xaa1111);
        this.characterStatsUI.bars.hp.backdrop.fillRect(screenX + 25, screenY + 50, screenX - (screenX / 2), 10);
        this.characterStatsUI.bars.hp.bar = this.add.graphics();
        this.characterStatsUI.bars.hp.bar.fillStyle(0x00aa00);
        this.characterStatsUI.bars.hp.bar.fillRect(screenX + 25, screenY + 50, (((screenX - (screenX / 2))) / maxhp) * (hp), 10);
        this.characterStatsUI.bars.hp.text = this.add.text(screenX + (screenX / 5), screenY + 47.5, `Hp : ${hp} / ${maxhp}`, {fontFamily: 'monospace', fontSize: 14, })
    
        this.characterStatsUI.bars.hunger.backdrop = this.add.graphics();
        this.characterStatsUI.bars.hunger.backdrop.fillStyle(0x121212);
        this.characterStatsUI.bars.hunger.backdrop.fillRect(screenX + 25, screenY + 75, screenX - (screenX / 2), 10);
        this.characterStatsUI.bars.hunger.bar = this.add.graphics();
        this.characterStatsUI.bars.hunger.bar.fillStyle(0x663399);
        this.characterStatsUI.bars.hunger.bar.fillRect(screenX + 25, screenY + 75,(((screenX - (screenX / 2))) / maxHunger) * (hunger), 10);
        this.characterStatsUI.bars.hunger.text = this.add.text(screenX + (screenX / 5), screenY + 72.5, `Hun: ${hunger} / ${maxHunger}`, {fontFamily: 'monospace', fontSize: 14, })
    }

    showCharacterStats(selectedCharacter: Character) {
        const { screenX, screenY, width, height } = this.characterStatsUI.container;
        this.characterStatsUI.cid = selectedCharacter.cid;
        this.characterStatsUI.border = this.add.graphics({lineStyle: {color: 0xDAA520, width: 4}});
        this.characterStatsUI.border.strokeRect(screenX, screenY, width + 1, height + 1);
        this.characterStatsUI.box = this.add.graphics();
        this.characterStatsUI.box.fillStyle(0x111111, 0.9);
        this.characterStatsUI.box.fillRect(screenX, screenY, width, height);
        this.characterStatsUI.box.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(screenX, screenY, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains
        });

        const { name, rank, race } = selectedCharacter;
        const { str, def, will, speed } = selectedCharacter.stats;
        this.characterStatsUI.specialStats.name = this.add.text(screenX + (screenX / 4.5), screenY + 10, name, {fontSize: 25, fontFamily: 'monospace'});
        this.characterStatsUI.specialStats.rank = this.add.text(screenX + 25, screenY + 100, `Rank: ${rank}`);
        this.characterStatsUI.specialStats.race = this.add.text(screenX + 25, screenY + 120, `Race: ${race}`);
        this.characterStatsUI.specialStats.age = this.add.text(screenX + 25, screenY + 140,  "Age : TBA");
        this.characterStatsUI.generalStats.str = this.add.text(screenX + (screenX / 2.5), screenY + 100, `Str : ${str}`);
        this.characterStatsUI.generalStats.def = this.add.text(screenX + (screenX / 2.5), screenY + 120, `Def : ${def}`);
        this.characterStatsUI.generalStats.will = this.add.text(screenX + (screenX / 2.5), screenY + 140, `Will: ${will}`);
        this.characterStatsUI.generalStats.spd = this.add.text(screenX + (screenX / 2.5), screenY + 160, `Spd : ${speed}`);
        
        this.drawCharacterStatBars(selectedCharacter);
        
        const { meele, magic, construction, mining, foraging, logging, cooking, crafting, research, medicinal, fishing } = selectedCharacter.skills;
        this.characterStatsUI.skills.header = this.add.text(screenX + 25, screenY + 190, "Skills", { fontSize: 20, fontStyle: 'bold' });
        this.characterStatsUI.skills.meele = this.add.text(screenX + 25, screenY + 220, `Meele   : ${meele.level} / 20`);
        this.characterStatsUI.skills.magic = this.add.text(screenX + 25, screenY + 240, `Magic   : ${magic.level} / 20`);
        this.characterStatsUI.skills.construction = this.add.text(screenX + 25, screenY + 260, `Build   : ${construction.level} / 20`);
        this.characterStatsUI.skills.mining = this.add.text(screenX + 25, screenY + 280, `Mining  : ${mining.level} / 20`);
        this.characterStatsUI.skills.foraging = this.add.text(screenX + 25, screenY + 300, `Forage  : ${foraging.level} / 20`);
        this.characterStatsUI.skills.logging = this.add.text(screenX + 25, screenY + 320, `Logging : ${logging.level} / 20`);
        this.characterStatsUI.skills.cooking = this.add.text(screenX + 25, screenY + 340, `Cooking : ${cooking.level} / 20`);
        this.characterStatsUI.skills.crafting = this.add.text(screenX + 25, screenY + 360, `Craft   : ${crafting.level} / 20`);
        this.characterStatsUI.skills.research = this.add.text(screenX + 25, screenY + 380, `Research: ${research.level} / 20`);
        this.characterStatsUI.skills.medicinal = this.add.text(screenX + 25, screenY + 400, `Medic   : ${medicinal.level} / 20`);
        this.characterStatsUI.skills.fishing = this.add.text(screenX + 25, screenY + 420, `Fish    : ${fishing.level} / 20`);
        
        this.characterStatsUI.isOpen = true;
    }
} 