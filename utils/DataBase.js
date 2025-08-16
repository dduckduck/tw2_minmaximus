import { DataFrame } from "./DataFrame.js";
import { Row } from "./Row.js";

export class DataBase {

    static CSV_FILES = {
        CAMPAIGN: { PATH: "csv/campaigns.csv", PK: "campaign_id", KEY: "CAMPAIGN" }, //OK
        FACTION: { PATH: "csv/factions.csv", PK: "faction_id", KEY: "FACTION" }, //OK
        // Units
        ALL_UNITS: { PATH: "csv/all_units.csv", PK: "unit_id", KEY: "ALL_UNITS" }, //OK
        LAND_UNITS: { PATH: "csv/land_units.csv", PK: "land_unit_id", KEY: "LAND_UNITS" }, //OK
        // NAVAL_UNITS: { PATH:, PK:}, //Pending
        //Weapons&Armours
        MELEE_WEAPON: { PATH: "csv/melee_weapon.csv", PK: "weapon_id", KEY: "MELEE_WEAPON" },//OK
        RANGE_WEAPON: { PATH: "csv/range_weapon.csv", PK: "weapon_id", KEY: "RANGE_WEAPON" },//OK
        PROJECTILES: { PATH: "csv/projectile.csv", PK: "projectile_id", KEY: "PROJECTILES" },//OK
        ARMOUR: { PATH: "csv/armour.csv", PK: "armour_id", KEY: "ARMOUR" }, //OK
        SHIELD: { PATH: "csv/shield.csv", PK: "shield_id", KEY: "SHIELD" }, //OK
        // Relations
        MILITARY_GROUPS: { PATH: "csv/military_groups.csv", PK: "military_group_id", KEY: "MILITARY_GROUPS" }, // Faction -> [Military Group] <- Unit

    };

    /** @type {Map<string,DataFrame>} */
    #dataFrames;
    constructor() {
        this.#dataFrames = new Map();
    }

    // ---------- Initialization ----------

    /**
    * Loads all CSV files asynchronously using fetch
    */
    async loadAllCSVs() {
        const entries = Object.entries(DataBase.CSV_FILES);
        const promises = entries.map(async ([key, { PATH, PK }]) => {
            const data = await this.loadCSV(PATH);
            const df = new DataFrame(PK, data);
            // this.addDataFrame(key, df);
            this.#dataFrames.set(key, df);
        });
        await Promise.all(promises);
    }

    /**
     * Fetches a CSV file and parses it into an array of objects
     * @param {string} path - CSV file path
     * @returns {Promise<Object[]>} - Array of row objects
     */
    async loadCSV(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to fetch ${path}`);
        const text = await response.text();
        return this.parseCSV(text);
    }


    /**
     * Simple CSV parser
     * @param {string} text
     * @returns {Row[]} Array of Row instances
     */
    parseCSV(text) {
        const [headerLine, ...lines] = text.trim().split("\n");
        const headers = headerLine.split(",").map(h => h.trim());
        return lines
            .map(line => line.trim())
            .filter(line => {
                const values = line.split(",");
                return values.some(v => v.trim().length > 0);
            }).map(line => {
                const values = line.split(",");
                const data = Object.fromEntries(headers.map((h, i) => [h, values[i]]));
                return new Row(data);
            });
    }

    // ---------- Basic Operations ----------

    /** Appends a DataFrame to the DataBase.
     * @param {string} dataFrameName
     * @param {DataFrame} dataFrame
     */
    addDataFrame(dataFrameName, dataFrame) {
        if (this.#dataFrames.get(dataFrameName)) {
            throw Error("Table with this name already exists.");
        }
        this.#dataFrames.set(dataFrameName, dataFrame);
    }

    /** Obtain a DataFrame based on name
     * @param {string} dataFrameName
     * @returns {DataFrame} 
     */
    getDataFrame(dataFrameName) {
        console.log("DataBase looking for table: ", dataFrameName);
        if (this.#dataFrames.has(dataFrameName)) console.log("Table for: ", dataFrameName, " found");
        const df = this.#dataFrames.get(dataFrameName);
        return df;
    }

    // ---------- Operations ----------
    getCampaigns() {
        return this.#dataFrames.get(DataBase.CSV_FILES.CAMPAIGN.KEY).getAllRows();
    }

    getFactionsForCampaign(campaign_id) {
        console.log("Fetching factions for campaign: ", campaign_id);
        const df = this.getDataFrame(DataBase.CSV_FILES.FACTION.KEY);
        const rows = df.getAllRows().filter(r => r.campaign_id === campaign_id);
        console.log("Found: ", rows.length, " factions");
        return rows;
    }

    getUnitsForFaction(factionId) {
        console.log("Fetching units for faction: ", factionId);
        const faction_df = this.getDataFrame(DataBase.CSV_FILES.FACTION.KEY);
        const faction = faction_df.getRowsForKey(factionId)[0];
        const military_group_id = faction.military_group_id;
        console.log("Target faction military group: ", military_group_id);

        const mp_df = this.getDataFrame(DataBase.CSV_FILES.MILITARY_GROUPS.KEY);
        const units = mp_df.getRowsForKey(military_group_id);

        // Naval comparison is pointless?
        const onlyLandUnits = units.filter((row) => {
            const unit = this.getUnit(row.unit_id);
            console.log("FILTERING: ", unit);
            return unit.is_naval === "0";
        })
        console.log("Found: ", units.length, " units | Only lands units", onlyLandUnits.length);
        return onlyLandUnits;
    }

    getUnit(unitId) {
        console.log("Fetching unit with id : ", unitId);
        const allUnitsDf = this.getDataFrame(DataBase.CSV_FILES.ALL_UNITS.KEY);
        const unit = allUnitsDf.getRowsForKey(unitId)[0];
        const landUnitDf = this.getDataFrame(DataBase.CSV_FILES.LAND_UNITS.KEY);
        const landUnit = landUnitDf.getRowsForKey(unit.land_unit_id)[0];
        const mergedUnit = {
            ...landUnit,
            is_naval: unit.is_naval,
            upkeep_cost: unit.upkeep_cost,
            recruitment_cost: unit.recruitment_cost,
        };
        return new Row(mergedUnit);
    }

    getArmour(armourId) {
        console.log("Fetching armour with id : ", armourId);
        const armourDf = this.getDataFrame(DataBase.CSV_FILES.ARMOUR.KEY);
        const armour = armourDf.getRowsForKey(armourId)[0];
        return armour;
    }

    getShield(shieldId) {
        console.log("Fetching shield with id : ", shieldId);
        const shieldDf = this.getDataFrame(DataBase.CSV_FILES.SHIELD.KEY);
        const shield = shieldDf.getRowsForKey(shieldId)[0];
        return shield;
    }

    getMeleeWeapon(weaponId) {
        console.log("Fetching melee weapon with id : ", weaponId);
        const weaponDf = this.getDataFrame(DataBase.CSV_FILES.MELEE_WEAPON.KEY);
        const weapon = weaponDf.getRowsForKey(weaponId)[0];
        return weapon;
    }

    getRangeWeapon(weaponId) {
        console.log("Fetching range weapon with id : ", weaponId);
        const weaponDf = this.getDataFrame(DataBase.CSV_FILES.RANGE_WEAPON.KEY);
        const weapon = weaponDf.getRowsForKey(weaponId)[0];
        return weapon;
    }

    getProjectile(projectileId) {
        const projectileDf = this.getDataFrame(DataBase.CSV_FILES.PROJECTILES.KEY);
        const projectile = projectileDf.getRowsForKey(projectileId)[0];
        return projectile;

    }

    // ---------- MISC ----------
    toString() {
        let info = "[DataBase INFO]";
        info += `\nDataFrames: ${this.#dataFrames.size}`;

        for (const [key, df] of this.#dataFrames.entries()) {
            const count = df.size;
            info += `\n- ${key}: ${count}`;
        }

        return info;
    }

}
