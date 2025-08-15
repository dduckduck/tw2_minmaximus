import { DataBase } from "../utils/DataBase.js";
import { DataFrame } from "../utils/DataFrame.js";
import { Row } from "../utils/Row.js";
import { CONTAINER_KEY } from "../utils/Containers.js";

export class Model {

    /** @type {Promise<void>} */
    #loadPromise;
    /** @type {string} */
    currentCampaign;
    /** @type {string} */
    currentPlayerFaction;
    /** @type {string} */
    currentAiFaction;
    /** @type {string} */
    currentPlayerUnit;
    /** @type {string} */
    currentAiUnit;
    /** @type {DataBase} */
    #database;

    constructor() {
        this.#database = new DataBase();
        this.#loadPromise = null;
        this.currentCampaign = this.currentPlayerFaction = this.currentPlayerUnit = this.currentAiFaction = this.currentAiUnit = "";
    }

    async load() {
        if (this.#loadPromise) return this.#loadPromise;
        this.#loadPromise = (async () => {
            if (!this.#database) this.#database = new DataBase();
            await this.#database.loadAllCSVs();
            console.log(this.#database.toString());
        })();
        return this.#loadPromise;
    }

    getCampaigns() {
        return this.#database.getCampaigns();
    }

    /** Obtains DataFrame by it's name
     * @param {string} tableName
     * @returns {DataFrame}
     */
    getDataFrame(tableName) {
        const df = this.#database.getDataFrame(tableName);
        return df;
    }

    setCurrentFactionFor(containerId, factionKey) {
        switch (containerId) {
            case CONTAINER_KEY.PLAYER_FACTIONS:
                this.currentPlayerFaction = factionKey;
                console.log("currentPlayerFaction: ", this.currentPlayerFaction);
                break;
            case CONTAINER_KEY.AI_FACTIONS:
                this.currentAiFaction = factionKey;
                console.log("currentPlayerFaction: ", this.currentAiFaction);
                break;
            default:
                console.error("Not a valid value for faction: ", containerId);
                return;
        }
    }

    /** Obtains factions for currently selected campaign 
     * @returns {Row[]} - Array of rows
     */
    getFactions() {
        if (!this.currentCampaign) {
            console.error("Campaign is not selected");
            return [];
        }
        const rows = this.#database.getFactionsForCampaign(this.currentCampaign);
        return rows;
    }

    setCurrentUnitFor(containerId, unitKey) {
        switch (containerId) {
            case CONTAINER_KEY.PLAYER_UNITS:
                this.currentPlayerUnit = unitKey;
                console.log("currentPlayerUnit: ", this.currentPlayerUnit);
                break;
            case CONTAINER_KEY.AI_UNITS:
                this.currentAiUnit = unitKey;
                console.log("currentAiUnit: ", this.currentAiUnit);
                break;
            default:
                console.error("Not a valid value for unit: ", containerId);
                return;
        }
    }

    getUnits(containerId) {
        let factionKey = "";
        switch (containerId) {
            case CONTAINER_KEY.PLAYER_FACTIONS:
                factionKey = this.currentPlayerFaction;
                break;
            case CONTAINER_KEY.AI_FACTIONS:
                factionKey = this.currentAiFaction;
                break;
            default:
                console.error("Not a valid value for units: ", containerId);
                return;
        }
        const units = this.#database.getUnitsForFaction(factionKey);
        return units;

    }

    getCurrentUnitDataFor(containerId) {
        let unitId = "";
        switch (containerId) {
            case CONTAINER_KEY.PLAYER_UNITS:
                unitId = this.currentPlayerUnit;
                break;
            case CONTAINER_KEY.AI_UNITS:
                unitId = this.currentAiUnit;
                break;
            default:
                console.error("Not a valid value for units: ", containerId);
                return;
        }

        const unit = this.#database.getUnit(unitId);
        const armour = this.#database.getArmour(unit.armour_id);
        const shield = this.#database.getShield(unit.shield_id);
        const meleeWeapon = this.#database.getMeleeWeapon(unit.melee_weapon_id);
        const rangeWeapon = this.#database.getRangeWeapon(unit.range_weapon_id);
        const projectile = (rangeWeapon) ? this.#database.getProjectile(rangeWeapon.projectile_id) : null;

        const unitData = {
            unitStats: unit,
            meleeWeapon: meleeWeapon,
            missileWeapon: rangeWeapon,
            projectile: projectile,
            armour: armour,
            shield: shield,
        }
        return unitData;
    }
    compareUnits(playerUnit, aiUnit) {
        console.log(playerUnit);

        const MIN_HIT_CHANCE = 15;
        const MAX_HIT_CHANCE = 75;
        const BASE_HIT_CHANCE = 40;

        const stats = ["melee_attack_chance", "melee_defence_chance", "missile_defence_chance", "armour", "melee_weapon_damage", "hit_chance", "effective_hit_chance", "effective_defence_chance", "expected_melee_damage",
            "expected_melee_defence",
            "melee_combat_score"
        ];

        //Basic calculations
        const playerData = {
            melee_weapon_damage: Number(playerUnit.meleeWeapon.damage),
            onscreen_name: playerUnit.unitStats.onscreen_name,
            melee_attack_chance: Number(playerUnit.unitStats.melee_attack),
            melee_defence_chance: Number(playerUnit.unitStats.melee_defence ?? 0) + Number(playerUnit.shield.shield_defence_value ?? 0),
            missile_defence_chance: Number(playerUnit.shield.missile_block_chance ?? 0),
            // morale: Number(playerUnit.)
            armour: Number(playerUnit.armour.armour_value ?? 0) + Number(playerUnit.shield.shield_armour_value ?? 0),
        };
        const aiData = {
            melee_weapon_damage: Number(aiUnit.meleeWeapon.damage),
            onscreen_name: aiUnit.unitStats.onscreen_name,
            melee_attack_chance: Number(aiUnit.unitStats.melee_attack),
            melee_defence_chance: Number(aiUnit.unitStats.melee_defence ?? 0) + Number(playerUnit.shield.shield_defence_value ?? 0),
            missile_defence_chance: Number(aiUnit.shield.missile_block_chance ?? 0),
            armour: Number(aiUnit.armour.armour_value ?? 0) + Number(playerUnit.shield.shield_armour_value ?? 0)
        };

        //Aggregated data
        //Hit chance: Base + Melee attack - Defence
        playerData.hit_chance = Number(BASE_HIT_CHANCE + playerData.melee_attack_chance - aiData.melee_defence_chance);
        aiData.hit_chance = Number(BASE_HIT_CHANCE + aiData.melee_attack_chance - playerData.melee_defence_chance);

        //Effective hit chance: 15<= Hit chance <= 75
        playerData.effective_hit_chance = Math.max(MIN_HIT_CHANCE, Math.min(MAX_HIT_CHANCE, playerData.hit_chance));
        aiData.effective_hit_chance = Math.max(MIN_HIT_CHANCE, Math.min(MAX_HIT_CHANCE, aiData.hit_chance));

        //Effective defence: 100 - effective_hit_chance
        playerData.effective_defence_chance = Number(100 - aiData.effective_hit_chance ?? 0);
        aiData.effective_defence_chance = Number(100 - playerData.effective_hit_chance ?? 0);

        //Expected damage: weapon_damage * effective_hit_chance
        playerData.expected_melee_damage = Number((playerData.melee_weapon_damage * (playerData.effective_hit_chance / 100)).toFixed(2));
        aiData.expected_melee_damage = Number((aiData.melee_weapon_damage * (aiData.effective_hit_chance / 100)).toFixed(2));

        //Expected defence: armour * effective_defence_chance
        playerData.expected_melee_defence = Number((playerData.armour * (playerData.effective_defence_chance / 100)).toFixed(2));
        aiData.expected_melee_defence = Number((aiData.armour * (aiData.effective_defence_chance / 100)).toFixed(2));

        playerData.melee_combat_score = Number(((playerData.expected_melee_damage / 100) * (playerData.expected_melee_defence)).toFixed(2));
        aiData.melee_combat_score = Number(((aiData.expected_melee_damage / 100) * (aiData.expected_melee_defence)).toFixed(2));

        return { playerUnit: playerData, aiUnit: aiData, stats: stats };
    }
}
