import { View } from "./View.js";
import { Model } from "./Model.js";
import { CONTAINER_KEY } from "../utils/Containers.js";
import { formatInfo } from "../utils/UnitFormatter.js";

export class Controller {

    /**
    * @param {View} view 
    * @param {Model} model 
    */
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }

    async init() {
        await this.model.load();
        const campaigns = this.model.getCampaigns().sort((a, b) => Number(a.campaign_order - b.campaign_order));
        this.view.updateCampaigns(campaigns);
        this.view.registerEvent(CONTAINER_KEY.CAMPAIGN, "change", this.onCampaignChange.bind(this), true);
        // Player
        this.view.registerEvent(CONTAINER_KEY.PLAYER_FACTIONS, "change", this.onFactionChange.bind(this), true);
        this.view.registerEvent(CONTAINER_KEY.PLAYER_UNITS, "change", this.onUnitChange.bind(this), true);
        // AI
        this.view.registerEvent(CONTAINER_KEY.AI_FACTIONS, "change", this.onFactionChange.bind(this), true);
        this.view.registerEvent(CONTAINER_KEY.AI_UNITS, "change", this.onUnitChange.bind(this), true);
    }

    /** 
    * Updates model state and fills factions
    * @param {Event} e
    */
    onCampaignChange(e) {
        const select = /** @type {HTMLSelectElement} */ (e.target);
        const campaignId = select.value;
        this.model.currentCampaign = campaignId;
        const factions = this.model.getFactions();
        this.view.updateFactions(factions);
    }

    /**
     * Updates model state and fills Units
     * @param {Event} e 
     */
    onFactionChange(e) {
        const select = /** @type {HTMLSelectElement} */ (e.target);
        const containerId = select.id;
        const factionKey = select.value;
        console.log("Faction changed to -> ", factionKey, " on: ", select.id);

        this.model.setCurrentFactionFor(containerId, factionKey);
        const unitRows = this.model.getUnits(containerId);
        this.view.updateUnits(containerId, unitRows);
    }

    /**
     * Updates model state and fills Unit data
     * @param {Event} e 
     */
    onUnitChange(e) {
        const select = /** @type {HTMLSelectElement} */ (e.target);
        const unitKey = select.value;
        const containerId = select.id;
        console.log("Unit changed to -> ", unitKey, " on: ", select.id);

        this.model.setCurrentUnitFor(containerId, unitKey);
        const unitData = this.model.getCurrentUnitDataFor(containerId);
        const dataRows = formatInfo(unitData);

        if(this.bothUnitSelected()){
            console.log("Both units selected. Updating comparison table");
            const playerUnit = this.model.getCurrentUnitDataFor(CONTAINER_KEY.PLAYER_UNITS);
            const aiUnit = this.model.getCurrentUnitDataFor(CONTAINER_KEY.AI_UNITS);

            const comparisondata = this.model.compareUnits(playerUnit,aiUnit);
            
            this.view.updateComparisonTable(comparisondata);
        }
        this.view.updateUnitData(containerId, dataRows);
    }

    bothUnitSelected() {
        const playUnitsContainer = this.view.getContainerByKey(CONTAINER_KEY.PLAYER_UNITS);
        const aiUnitsContainer = this.view.getContainerByKey(CONTAINER_KEY.AI_UNITS);
        return playUnitsContainer.value && aiUnitsContainer.value;
    }
}
