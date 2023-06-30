import Phaser from "phaser";
import { height, width } from '../phaser-config';
import Slime from "../characters/slime";
import Harpy from "../characters/harpy";
import Goblin from "../characters/goblin";

export default class Summon extends Phaser.Scene {
    constructor() {
        super("summon_ui");
    }

    create() {
        const overlay = this.add.graphics();
        overlay.fillStyle(0x111111, 0.8);
        overlay.fillRect(0, 0, 640, 480);
        const closeBtn = this.add.graphics();
        closeBtn.fillStyle(0xff0000);
        closeBtn.fillRoundedRect(575, 0, 25, 25, 5);
        this.add.text(583.5, 4 , 'X');
        closeBtn.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(575, 0, 25, 25),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        });
        closeBtn.on("pointerdown", () => this.scene.stop());

        const menuItems = ["Weak Core"];
        menuItems.forEach((item) => {
            const box = this.add.graphics();
            box.fillStyle(0x666666);
            box.fillRoundedRect(width / 2 - 250 / 2, height / 2 - 100, 250, 50, 5);
            this.add.text(width / 2 - 250 / 2 + 25, height / 2 - 100 + 12, `${item}`);
            box.setInteractive({
                hitArea: new Phaser.Geom.Rectangle(width / 2 - 250 / 2, height / 2 - 100, 250, 50),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains
            });
            box.on("pointerdown", () => this.summon(item));
        }); 
    }

    summon(summonType: string) {
        if(this.registry.get("yourCharacters").length > 7) return;
        const game = this.scene.get("game");
        const ui:any = this.scene.get("ui");
        const randomNum = Phaser.Math.Between(0, 100);
        switch(summonType) {
            case "Weak Core":
                if(randomNum < 33) this.summonSlime(game, ui);
                else if(randomNum < 66) this.summonGoblin(game, ui);
                else if(randomNum < 99) this.summonHarpy(game, ui);
                break;
        }
    }

    summonSlime(game: Phaser.Scene, ui: any) {
        const newSlime = this.physics.add.existing(new Slime(game, 1, 1, 'slime', 0));
        newSlime.create();        
        ui.addSlot(newSlime);
    }

    summonHarpy(game: Phaser.Scene, ui: any) {
        const newHarpy = this.physics.add.existing(new Harpy(game, 1, 1, 'harpy', 0));
        newHarpy.create();        
        ui.addSlot(newHarpy);
    }

    summonGoblin(game: Phaser.Scene, ui: any) {
        const newGoblin = this.physics.add.existing(new Goblin(game, 1, 1, 'goblin_mage', 0));
        newGoblin.create();        
        ui.addSlot(newGoblin);
    }
}