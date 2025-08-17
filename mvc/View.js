import { CONTAINER_KEY } from "../utils/Containers.js";

export class View {

    #containers = null;
    constructor() {
        this.#containers = {
            [CONTAINER_KEY.CAMPAIGN]: document.getElementById(CONTAINER_KEY.CAMPAIGN),
            [CONTAINER_KEY.PLAYER_FACTIONS]: document.getElementById(CONTAINER_KEY.PLAYER_FACTIONS),
            [CONTAINER_KEY.AI_FACTIONS]: document.getElementById(CONTAINER_KEY.AI_FACTIONS),
            [CONTAINER_KEY.PLAYER_UNITS]: document.getElementById(CONTAINER_KEY.PLAYER_UNITS),
            [CONTAINER_KEY.AI_UNITS]: document.getElementById(CONTAINER_KEY.AI_UNITS),
            [CONTAINER_KEY.COMPARISON_TABLE]: document.getElementById(CONTAINER_KEY.COMPARISON_TABLE),
        }
    }


    /** Registers a callback for specified container
     * @param {string} containerKey
     * @param {keyof HTMLElementEventMap} event
     * @param {(event:Event)=>void} callback
     * @param {boolean} initialTrigger 
     */
    registerEvent(containerKey, event, callback, initialTrigger) {
        const container = this.getContainerByKey(containerKey);
        container.addEventListener(event, callback);
        if (initialTrigger) {
            container.dispatchEvent(new Event(event));
        }
    }

    updateCampaigns(campaigns) {
        const container = document.getElementById("campaignSelect");
        container.innerHTML = "";
        for (const campaign of campaigns) {
            const option = document.createElement("option");
            option.value = campaign.campaign_id;
            option.text = campaign.onscreen_name;
            container.appendChild(option);
        }
    }

    updateFactions(factions) {
        const playerFactions = this.#containers[CONTAINER_KEY.PLAYER_FACTIONS];
        const aiFactions = this.#containers[CONTAINER_KEY.AI_FACTIONS];
        playerFactions.innerHTML = "";
        aiFactions.innerHTML = "";

        for (const faction of factions) {
            const option = document.createElement("option");
            option.value = faction.faction_id;
            option.text = faction.text;
            playerFactions.appendChild(option);
            aiFactions.appendChild(option.cloneNode(true));
        }


    }

    updateUnits(containerId, units) {
        let container = null;
        switch (containerId) {
            case CONTAINER_KEY.PLAYER_FACTIONS:
                container = this.#containers[CONTAINER_KEY.PLAYER_UNITS];
                break;
            case CONTAINER_KEY.AI_FACTIONS:
                container = this.#containers[CONTAINER_KEY.AI_UNITS];
                break;
            default: console.error("Container for: ", containerId, " does not exist."); return;
        }
        container.innerHTML = "";

        for (const unit of units) {
            const option = document.createElement("option");
            option.value = unit.unit_id;
            option.text = unit.unit_id;
            container.appendChild(option);
        }
        container.dispatchEvent(new Event("change", { bubbles: true }));
    }

    updateUnitData(containerId, unitData) {
        let preElement = null;
        let h4Element = null;

        switch (containerId) {
            case CONTAINER_KEY.PLAYER_UNITS:
                preElement = document.querySelector('#playerUnitBlock pre');
                h4Element = document.querySelector('#playerUnitBlock h4');
                break;
            case CONTAINER_KEY.AI_UNITS:
                preElement = document.querySelector('#aiUnitBlock pre');
                h4Element = document.querySelector('#aiUnitBlock h4');
                break;
            default: break;
        };
        preElement.textContent = unitData;
        preElement.style.fontSize = "14px";
    }

    updateComparisonTable(data) {
        const table = this.#containers[CONTAINER_KEY.COMPARISON_TABLE];
        table.innerHTML = "";

        const { playerUnit, aiUnit } = data;
        const units = [playerUnit, aiUnit];

        // Orden personalizado con "" como separador de fila vacía
        const statsOrder = [
            "missile_defence_chance",
            "melee_defence_chance",
            "effective_defence_chance",
            "melee_armour_value",
            "expected_melee_defence",
            "",
            "melee_attack_chance",
            "melee_hit_chance",
            "effective_melee_hit_chance",
            "melee_weapon_damage",
            "melee_weapon_ap",
            "expected_melee_damage",
            "melee_combat_score",
            "",
            "effective_range_hit_chance",
            "range_weapon_damage",
            "range_weapon_ap",
            "expected_range_damage",
            "expected_range_defence",
            "range_combat_score"
        ];

        // 1. Cabeceras
        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");

        const thStat = document.createElement("th");
        thStat.textContent = "Stat";
        trHead.appendChild(thStat);

        units.forEach(unit => {
            const th = document.createElement("th");
            th.textContent = unit.onscreen_name;
            trHead.appendChild(th);
        });

        thead.appendChild(trHead);
        table.appendChild(thead);

        // 2. Filas en orden personalizado
        statsOrder.forEach(stat => {
            if (stat === "") {
                // Fila vacía
                const trEmpty = document.createElement("tr");
                const tdEmpty = document.createElement("td");
                tdEmpty.colSpan = units.length + 1;
                tdEmpty.innerHTML = "&nbsp;";
                trEmpty.appendChild(tdEmpty);
                table.appendChild(trEmpty);
                return;
            }

            const tr = document.createElement("tr");
            const tdStat = document.createElement("td");
            tdStat.textContent = stat;
            tr.appendChild(tdStat);

            units.forEach((unit, i) => {
                const td = document.createElement("td");
                td.textContent = unit[stat];

                const otherUnit = units[1 - i];
                const diff = unit[stat] - otherUnit[stat];
                const trend = document.createElement("span");

                if (diff > 0) {
                    trend.textContent = ` ▲ (+${diff.toFixed(2)})`;
                    trend.classList.add("trend-up");
                } else if (diff < 0) {
                    trend.textContent = ` ▼ (${diff.toFixed(2)})`;
                    trend.classList.add("trend-down");
                }

                td.appendChild(trend);
                tr.appendChild(td);
            });

            table.appendChild(tr);
        });
    }

    /** Obtains container for the specified key.
     * @param {string} containerKey
     * @returns {HTMLElement}
     */
    getContainerByKey(containerKey) {
        //console.log("Obtaining container for: ", containerKey);
        return this.#containers[containerKey];
    }

}
