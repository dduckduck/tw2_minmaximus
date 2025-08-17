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


    buildUnitData(unit) {
        return {
            onscreen_name: unit.unitStats.onscreen_name,
            melee_weapon_damage: Number(unit.meleeWeapon?.damage ?? 0),
            melee_weapon_ap: Number(unit.meleeWeapon?.ap_damage ?? 0),
            melee_attack_chance: Number(unit.unitStats?.melee_attack ?? 0),
            melee_defence_chance: Number(unit.unitStats?.melee_defence ?? 0) + Number(unit.shield.shield_defence_value ?? 0),
            missile_defence_chance: Number(unit.shield?.missile_block_chance ?? 0),
            melee_armour_value: Number(unit.armour?.armour_value ?? 0) + Number(unit.shield.shield_armour_value ?? 0),
            range_weapon_damage: Number(unit.projectile?.damage ?? 0),
            range_weapon_ap: Number(unit.projectile?.ap_damage ?? 0)
        };
    }

    compareUnits(playerUnit, aiUnit) {
        console.log(playerUnit);
        const MIN_HIT_CHANCE = 15;
        const MAX_HIT_CHANCE = 75;
        const BASE_HIT_CHANCE = 40;

        const statCalculators = {
            melee_hit_chance: (self, enemy) => BASE_HIT_CHANCE + self.melee_attack_chance - enemy.melee_defence_chance,
            effective_melee_hit_chance: (self, enemy) => Math.max(MIN_HIT_CHANCE, Math.min(MAX_HIT_CHANCE, self.melee_hit_chance)),
            effective_defence_chance: (self, enemy) => 100 - enemy.effective_melee_hit_chance,
            expected_melee_damage: (self, enemy) => (self.melee_weapon_damage + (self.melee_weapon_ap || 0)) * (self.effective_melee_hit_chance / 100),
            expected_melee_defence: (self, enemy) => (self.melee_armour_value - (enemy.melee_weapon_ap || 0)) * (self.effective_defence_chance / 100),
            melee_combat_score: (self, enemy) => (self.expected_melee_damage) / Math.max(1, self.expected_melee_defence),
            effective_range_hit_chance: (self, enemy) => 100 - enemy.missile_defence_chance,
            expected_range_damage: (self, enemy) => (self.range_weapon_damage + (self.range_weapon_ap || 0)) * (self.effective_range_hit_chance / 100),
            expected_range_defence: (self, enemy) => (self.melee_armour_value - (enemy.range_weapon_ap || 0)) * (self.missile_defence_chance / 100),
            range_combat_score: (self, enemy) => (self.expected_range_damage) / Math.max(1, self.expected_melee_defence),
        };
        const playerData = this.buildUnitData(playerUnit);
        const aiData = this.buildUnitData(aiUnit);

        Object.keys(statCalculators).forEach(stat => {
            playerData[stat] = Math.round(statCalculators[stat](playerData, aiData) * 100) / 100;
            aiData[stat] = Math.round(statCalculators[stat](aiData, playerData) * 100) / 100;
        });

        return { playerUnit: playerData, aiUnit: aiData };
    }
}
