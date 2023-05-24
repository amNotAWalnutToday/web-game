# Game - Plan

## Systems 

### Character Statistics

    special
    - **Traits**(see list below)
    - **Skills**(see list below)
    - **Rank**(from *E* - *S*) rank determines level of skills and amount of traits.

    Combat/Travel
    - HP - 0 = dead = unit lost
    - Str - stronger physique
    - DEF - damage mitigation (% undecided)
    - WILL - increase MAG dmg && (((will * 2) + def) / 2) = (mag def) e.g. ***(5(will) * 2(base) = 10 + 5(def)) / 2 = 7.5 MAG def***
    - SPD - how fast unit travels.(Local) || lowest units speed(World)  
    
    Utility
    - AGE - how long they have lived (stats decrease after a certain age by % when % reaches 0 they die)
    - HUN - how hungry they are(stat decrease for every % below 30%).
    - MOOD - how comfortable they are(stat decrease) will breakdown at 0%! 


### Team System 

    - 5 slots per team
    - 5 teams total, unlocked at separate levels.

### Movement System

    - select character and then select grid to move to that area. (Local/World)
    - select world area for that team to enter local area. (World)
    - characters move seperately. (Local)
    - characters move together. (World)

    - grid made from array and overflow: scroll Both;
    - seperated into 3 sizes.
        - large  (NaN)  * (NaN);
        - medium (NaN)  * (NaN);
        - small  (NaN)  * (NaN);

### Weather System

    - Normal   -- No Abnormalities
    - Sunny    -- map temp + 10 degC
    - Rain     -- mood(all) - 1% per 10 seconds,
    - Storm    -- Destroys Weak structures +^
    - Snow     -- map temp - 10 degC 
    - Blizzard -- Destroys Weak Structures +^

### Time System

    - Weather set at the start of Each day;
    - 12 hour days;
    - 4 seasons;
    - temp changes on time of day + season;

### Tech Tree System

    - Research Tree to advance processable resources and facilities


## Interface

### Pages

    - Signup/Login Page
    - Character Settings
    - Summon Area
    - World Map Grid
    - Local Area Grid

### Tech Tree
  Rank E - Wood Structures(Wood walls/floors/chests/campfire)
         - Cloth(Cloth Mat)
         - Magic(Transmutation Circle)
         - Ore(Refinery)

## Indepth Lists 

### Playable Characters

    - Slime     -  Rank E - C   - High Level - Slime Queen - Rank C - S
    - Base HP: 5 - 10;; Base DEF: 8 - 10;; Base WILL: 1 - 3;; Base SPD: 1 - 2;;
    - Base Str: 0 - 1;;
    - Queen Bonus: 1.5X base stats, +1 extra trait;; 
    -------------------------------------------------------------------
    - Goblin    -  Rank E - C   - High Level - Goblin King - Rank C - S
    - Base HP: 3 - 7;; Base DEF: 0 - 10;; Base WILL: 0;; Base SPD: 3 - 6;;
    - Base Str: 0 - 10;;
    - King Bonus: 2 X Base HP and DEF;;
    -------------------------------------------------------------------
    - Harpy     -  Rank D - B   - High Level - Harpy Matriarch Rank B - S
    - Base HP: 2 - 5;; Base DEF 0 - 5;; Base WILL: 4 - 10;; Base SPD: 5 - 18;;
    - Base STR: 0;;
    - Matriarch Bonus: (All base stats increased by 0.5 of speed (except spd)) 
    -------------------------------------------------------------------
    - Demonoid  -  Rank B - S   - High Level - **Named Demon**(random superior demon name) Rank S
    - Base HP: 5 - 15;; Base DEF: 0 - 5;; Base WILL: 7 - 18;; Base SPD: 5 - 10;;
    - Base Str: 0 - 8;;
    - Named Bonus: Base WILL 1.5X && +1 extra trait for each 6 Base points of WILL;
    -------------------------------------------------------------------
    - Dragonoid -  Rank A - S   - High Level - Dragon God - Rank S
    - Base HP 1 - 18;; Base DEF: 0 - 18;; Base Will 0 - 8;; Base SPD: 1 - 15;; 
    - Base STR: 7 - 18;;
    - Dragon God Bonus: All Damage Doubled every 5 attacks in combat(resets if leave combat);;
    -------------------------------------------------------------------

### Traits

#### Elemental Traits (can have 0 - 2 of these per character)

    - Wind(SPD + 5) with Magic level 10 combat(do a double attack every 5 attacks always WILL damage)
    - Fire(STR + 5) with Magic level 10 combat(Burst of damage every 5 attacks ((str + will) / 2))
    - Earth(DEF + 5) with Magic level 10 combat(Allies in the fight gain a shield every 5 attacks you do based on your ((def + will) / 2))
    - Water(WILL + 5) with Magic level 10 combat(heals allies every 5 attacks for WILL)
    - Space(Carry Capacity + 1) with Magic level 15(can swap places with allies on other teams in other locations)
    - Time(Speeds everything up) with Magic level 20(can rewind ore veins back to full)
    - Life(double hp & hp regen + 1) with Magic level 20(Immunity to hunger)
    - Sonic(Ability to fear enemies to run away 50% chance) with Magic level 15(Stun enemy every 5 attacks)

#### Race Traits

    - Slime Storage (Carry Capacity * Rank)
    - Goblin Cartel (for each goblin in the party +2 STR, HP and DEF)
    - Harpy Wings   (Can cross any terrain except the tallest of mountains)
    - Demon Ritual  (Can sacrifice allies of a similiar rank to reroll this demons traits)   
    - Dragon Exile  (When dragon is alone in a party stats * 5)
    - Dragon Echo   (When with allies of the same elemental trait elemental trait base power if twice as effective)

#### Any Traits(50)

##### positive

    - Wise (+ 5 Will)
    - SelfPreserver (+ 5 Def)
    - Endurer (+ 5 hp)
    - Agile(+ 5 Spd)
    - Strongman (+ 5 Str)
    - Malevolent Mage (MAG damage formula changes to (WILL * level) / 2)
    - Magnanimous Magician (can no longer use MAG in combat however magic skill level gain * 2 and transmute speed increased)
    - Meticulous Medic (Medicinal skill level gain * 2)
    - frantic forager (foraging skill level gain * 2)
    - Logging Lord (logging skill level gain * 2)
    - Resourceful Researcher (research skill level gain * 2)
    - Conscientious Crafter (crafting skill level gain * 2) 
    - Mcminerson (mining skill level gain * 2)
    - fishing fanatic (fishing skill level gain * 2)
    - master chef (cooking skill level gain * 2)
    - born to build (construction skill level gain * 2)
    - Insight (can craft things 3 levels higher if combined with skill level gain * 2 skill)
    - Voracious (will eat anything with no reprecussions);
    - Hunger resistant (half hunger drain)
    - Apathy (Mood immunity)
    - Cheerful (Raises mood of allies)
    - Half hot Half cold (temperature immunity)
    - Pack Mule (Carry Capacity + 1)
    - Phoenix (Upon Death revive once trait will deactive afterwards (can be reactivated with an item))
    - Swimmer (can move through water)
    - Night Owl (opposite circadian rhythmn)
    - Self Destruct(deal health to all surrrounding allies/enemies)

##### negative

    - Pacifist(Cannot Attack)
    - Psycopath(May attack allies)
    - Heater(emits 10degC of hot air)
    - Freezer(emits 10degC of cold air)
    - Magic Skeptic(All magic and elemental traits disabled and base will set to 0)
    - Clumsy(Cannot do any skill that requires WILL(not magic) or SPD)
    - Weak Body (Cannot do any skill that Requires Str or Def)
    - Insomnia (never sleeps however max mood is 50% of max)
    - Nihilist (Mood decreases * 2)
    - Insatiable (Hunger decreases * 2 however stat buffs for above 70% hunger)
    - Loner (stats * 3 when alone however when with another ally mood decreases * 4)
    - Small (Carry Capacity - 1, -3 str, -3 def)
    - Battle Scars(All stats halved);
    - Carnivore (Only Eats Meat)
    - Herbivore (Only Eats Plants)
    - Pescitarian (Only Eats Fish)

### Mental Break Effects

    - Suicide
    - Friendly Fire
    - Sabotage

### Skills

  - Meele ((Str * level) / 2) dmg
  - Magic ((WILL * level) / 3) dmg
  - Construction (time - (((Str + Def) / 2) * level) = Speed)
  - Mining (time - (((Str + Def) / 2) * level) = Speed)
  - Foraging (time - WILL * level) = speed
  - Logging (time - (((Str + Def) / 2) * level) = Speed)
  - Cooking  (time - WILL * level) = speed
  - Crafting (time - (((WILL + SPD) / 2) * level) = Speed)
  - Research (time - WILL * level) = speed
  - Medicinal (time - (((WILL + SPD) / 2) * level) = Speed)
  - Fishing (time - SPD * level) = speed

### Enemies 

#### Meat Bearing enemies

    Rat - Rank E
    Base HP: 10;; Base Def: 5;; Base Will 0;; Base Spd: 15;;
    Base Str: 1;;
    ---------------------------------------------------------
    Deer - Rank C
    Base HP: 25;; Base Def: 10;; Base Will 0;; Base Spd: 7;;
    Base Str: 5;;
    ---------------------------------------------------------
    Chimera - Rank A
    Base HP: 250;; Base Def: 50;; Base Will 50;; Base Spd: 5;;
    Base Str: 50;;
    ---------------------------------------------------------

#### Raiders

    Human Bandit - Rank E
    Base HP: 10;; Base Def: 5;; Base Will 0;; Base Spd: 10;;
    Base Str: 1;;
    ---------------------------------------------------------
    Human Knight - Rank C
    Base HP: 50;; Base Def: 50;; Base Will 0;; Base Spd: 3;;
    Base Str: 15;;
    ---------------------------------------------------------
    Human Mage - Rank B
    Base HP: 30;; Base Def: 10;; Base Will 50;; Base Spd: 7;;
    Base Str: 3;;
    ---------------------------------------------------------

#### Other

    Bomb Slime - Rank C
    Base Hp: 100;; Base Def: 0;; Base Will 0;; Base Spd: 3;;
    Base Str: 0;;
    ---------------------------------------------------------

### Resources

#### Food

##### Foragables

  - Mushrooms  - Rank E
  - Berries    - Rank C
  - Coconuts   - Rank A

##### Fish
  
  - Crayfish - Rank E
  - Trout    - Rank C
  - Tuna     - Rank A
  - Whale    - Rank S

##### Meat

  - Rat Meat     - Rank E
  - Deer Meat    - Rank C
  - Chimera Meat - Rank A

### Plants

  - Flax     - Rank E
  - Herb     - Rank D
  - Cotton   - Rank C
  - LifeLily - Rank A

#### Wood

  - Logs - Rank E
  - Planks - Rank D
  - HardWood Logs - Rank C
  - HardWood Planks - Rank B
  - LifeLarch Logs - Rank A
  - LifeLarch Planks - Rank S

#### Ores

##### Elemental Attribute Ore

  - Earth - Rank E
  - Fire - Rank E
  - Wind - Rank D
  - Water - Rank D
  - Sonic - Rank C
  - Life - Rank B
  - Space - Rank A
  - Time - Rank A

##### Refined Ores

each ore required is 10 to refine
  - Earth Crystal    - Rank E  -- Earth Ore
  - Steam Capsule    - Rank D  -- Water Ore && Fire Ore
  - Vibration Stone  - Rank C  -- Sonic Ore && Wind Ore
  - Lightning Shard  - Rank B  -- Water Ore && Wind Ore && Fire Ore && Earth Ore
  - LifeBlood Jewel  - Rank A  -- Life Ore && Corpse
  - SpaceTime Prism  - Rank S  -- Space Ore && Time Ore 

### Craftables

#### Summon Stones

can only some ranks as high as the core & high level only from superior cores
  - Weak Slime  Core      - Rank E -- Earth Crystal + CrayFish(10)
  - Weak Goblin Core      - Rank E -- Earth Crystal + Logs(10)
  - Weak Harpy  Core      - Rank D -- Earth Crystal + (TBA)
  - Weak Core             - Rank D -- Earth Crystal + Weak Slime Core + Weak Goblin Core
  - Slime Core            - Rank C -- Steam Capsule + Weak Slime Core 
  - Goblin Core           - Rank C -- Earth Crystal * 10 + Logs * 10
  - Harpy Core            - Rank B -- Vibration Stone + (TBA)
  - Average Core          - Rank B -- Lightning Shard + (TBA)
  - Demonoid Core         - Rank A -- LifeBlood Jewel + (TBA)
  - Superior Core         - Rank A -- SpaceTime Prism + (TBA) (slime goblin and harpy high levels)
  - Superior Core+        - Rank S -- SpaceTime Prism + Superior Core + (TBA) (^ + Demonoid)
  - Superior Core++       - Rank S -- SpaceTime Prism + Superior Core+ + (TBA) (*);

#### Facilities

##### E Rank

Rank E structures are considered Weak and will  break in storms/blizzards  
    
    Wood Wall - Rank E -- Logs
    Wood Floor - Rank E -- Logs

    Slime Pool - Rank E -- Slime(10) + Earth Crystal(10)
    Stores 10 slimes in a mode where they do not age or change

    Campfire - Rank E -- Logs(10) Light(1 Fire ore)
    Allows Cooking and Resting around

    Cloth Mat - Rank E -- Flax(10)
    Rudimentary Sleeping Place 

    Crafting Area - Rank E -- Logs(10)
    Contains 1 wood chest worth of space.

    Research Table - Rank E -- Logs(20) + Earth Ore(10) + Fire Ore(10)
    Research Techonologies

    Wood Chest(4 Slots) - Rank E -- Logs(10)

    Weak Transmutation Circle - Rank E - Earth Ore(10) + Mushrooms(10)
    can perform Transmutations to craft weak cores

    Rudimentary Ore Refinery -- Logs(10) + Earth Ore(10) + Fire Ore(20)
    Recipes
    -------
    Earth Crystal - Rank E - Earth Ore(10) + fire stone
    -------
  
##### D Rank

    Plank Wall - Rank D -- Plank
    Plank Floor - Rank D -- Plank

    Linen Mat - Rank D -- Linen(10)
    Linen Bed - Rank D -- Linen(10) + Plank(10)

    Goblin Hut - Rank D -- Plank(100) + linen(100) + Crayfish(100) + Mushroom(100)
    Stores 10 goblins where they do not age or change

    Stove - Rank D -- Planks(10) + Steam Capsule
    
    Rudimentary Sewing Machine - Rank D -- Planks(10)
    Allows crafting with flax
    Recipes
    -------
    Linen - Rank D - Flax(10) + thread
    -------

    Rudimentary Plank Maker - Rank D -- Logs(10)
    Allow making of Basic planks
    Recipes
    -------
    Plank - Rank D - Logs(10)
    ------- 

    Rudimentary Medicine Table - Rank D -- Planks(10)
    allow making of basic medicine
    Recipes
    -------
    Healing Potion - Rank D - Herbs(10) + Mushrooms(10)
    Cold Potion    - Rank B - Herbs(10) + Ice(10)
    -------

    Steam Plant - Rank D -- Planks(100) + Earth Crystal(100) + Water Ore(100)
    Recipes
    ------
    Steam Capsule - Rank D - Water Ore(10) + Fire Ore(10)
    ------

    Cooler - Rank D -- Plank(10) + Wind Ore(10)  + Steam Capsule
    Heater - Rank D -- Plank(10) + Earth Crystal + Steam Capsule

##### C Rank

    HardWood Wall - Rank C - HardWood Plank
    HardWood Floor - Rank C - HardWood Plank

    Harpy TreeHouse - Rank C - HardWood Plank(100) + Linen(100) + Trout(100)

    Sonic Saw Plank Maker - Rank C -- HardWood Logs(10) + Vibration Stone(10)
    Allows making of hardwood planks
    Recipes
    -------
    Plank           - Logs(10)
    HardWood Plank  - HardWood Logs(10) + Vibration Stone
    ------- 

    Transmutation Circle - Rank C -- Vibration Stone(10) + Mushrooms(100) + Meat(100)
    Allows Transmutations

    Sonic Power Refinery - Rank C -- HardWood Logs(100) + Steam Capsule(100) + Wind Ore(100) + linen(100)
    Recipes
    --------
    Vibration Stone - Rank C - Sonic Ore(10) + Wind ore(10) + Steam Capsule
    --------

##### B Rank
    LifeLarch Walls - LifeLarch Plank
    LifeLarch Floor - LifeLarch Plank

    Demon Rift - Vibration Stone(100) + Space Ore(10) ?>>?
    Stores 10 demonoids cannot age or change

    Cotton Mat - Cotton Fabric(10)
    Cotton Bed - Cotton Fabric(10) + HardWood Plank(10)

    Electric Powered Stove - Rank B -- LifeLarch Logs(10) + Lightning Shard

    Electric Powered Plank Maker - Rank B -- LifeLarch Logs(10) + Lightning Shard + Vibration Stone(10)
    Allows making advanced planks
    Recipes
    ------- 
    Plank           - Logs(10)
    HardWood Plank  - HardWood Logs + Vibration Stone
    LifeLarch Plank - LifeLarch Logs + Vibration Stone(10)
    -------

    Electric Powered Sewing Machine - Rank B -- LifeLarch Logs(10) + Lightning Shard + linen(100)
    Allows Advanced Sewing
    Recipes
    -------
    Cotton Fabric - Cotton(10) + infused thread
    -------

    Medicine Mixer - Rank B -- LifeLarch Logs(10) + Lightning Shard + linen(100)
    Recipes
    -------
    Strong Healing Potion - Rank B - Herbs(10) + Berries(10) + Flax(10)
    Heat Potion           - Rank B - Herbs(10) + Steam Capsule(10)
    -------

    Lightning Rod Refinery - Rank B -- HardWood Plank(100) + Vibration Stone(100) + linen(100)
    Recipes
    -------
    Lightning Shard - Rank B - Earth ore(10) + Fire ore(10) + Wind Ore(10) + Water Ore(10) + Vibration Stone
    -------


##### A Rank
    Coated LifeLarch Walls - Rank A -- Lightning Infused LifeLarch Plank
    Coated LifeLarch Floors - Rank A -- Lightning Infused LifeLarch Plank

    Dragon Den - Rank A -- LifeBlood Jewel(10) + Tuna(100) + Meat(100)
    Stores a Dragon where they cannot age or change

    Superior Transmutation Circle - Rank A -- (TBA)

    Alchemy Lab - Rank A -- LifeBlood Jewel + LifeLarch Plank(10)
    Allows advanced medicine mixing
    Recipes
    -------
    Superior Healing potion - LifeLily(10) + Coconut(10)
    Trait Potion - Randomly Removes Or Adds a Trait - Rank A - LifeBlood Jewel + Thread of Fate 
    -------

    LifeBlood Jewel Refinery - Rank A -- LifeLarch Planks(100) + Lightning Shard(100) + Cotton Fabric(100)
    Recipes
    -------
    LifeBlood Jewels - Rank A - Life Ore(10) + meat(100)
    ------- 

##### S Rank

    Transportal - Rank S -- SpaceTime Prism(10)

    SpaceTime Prism Refinery - Rank S -- (TBA)
    Recipes
    -------
    SpaceTime Prism - Rank S - Space Ore(10) + Time Ore(10) + LifeBlood Jewel(10)
    -------

#### Transmutations

  - Crayfish + Fire ore               => Slime
  - Water ore(10)                     => ice(1)
  - Wind ore + flax                   => thread
  - Sonic ore + thread                => infused thread 
  - Lightning Shard + LifeBlood Jewel + LifeLarch Plank => lightning infused lifelarch plank 
  - Cotton Fabric(10) + Coconut(10) + Time Ore => Thread Of Fate