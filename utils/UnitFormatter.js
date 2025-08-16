
/**
 *Builds basic data
*/
function prepareBasicStats(unitData, defaultValue = "N/A") {
    const stats = unitData.unitStats || {};
    return [
        ["Category", `${stats.category ?? defaultValue}`],
        ["Morale", stats.morale ?? defaultValue],
        ["Bonus HP", stats.bonus_hit_points ?? defaultValue],
        ["Melee attack", `${stats.melee_attack ?? defaultValue}%`],
        ["Charge bonus", stats.charge_bonus ?? defaultValue],
        ["Cost", stats.recruitment_cost ?? defaultValue],
        ["Upkeep", stats.upkeep_cost ?? defaultValue],

    ];
}

function prepareDefense(unitData, defaultValue = "N/A") {
    const basicStats = unitData.unitStats || {};
    const armour = unitData.armour || {};
    const shield = unitData.shield || {};
    return [
        ["Melee defence", `${basicStats.melee_defence ?? defaultValue}%`],
        ["Armour value", `${armour.armour_value ?? defaultValue} (${basicStats.armour_id ?? defaultValue})`],
        ["Bonus vs Missile", ((armour.bonus_v_missiles??0 === 0) ? "False" : "True")],
        ["Weak vs Missile", ((armour.weak_v_missiles??0 === 0) ? "False" : "True")],
        ["Shield", shield.shield_id ?? defaultValue],
        ["│ Armour", shield.shield_armour_value ?? defaultValue],
        ["│ Defense", `${shield.shield_defence_value ?? defaultValue}%`],
        ["│ Missile block", `${shield.missile_block_chance ?? defaultValue}%`],
    ];
}

function prepareMeleeWeapon(unitData, defaultValue = "N/A") {
    const stats = unitData.unitStats || {};
    const weapon = unitData.meleeWeapon || {};
    return [
        ["Weapon", stats.melee_weapon_id ?? defaultValue],
        ["Type", weapon.melee_weapon_type ?? defaultValue],
        ["Armour piercing", weapon.armour_piercing ?? defaultValue],
        ["Armour penetrating", weapon.armour_penetrating ?? defaultValue],
        ["Shield piercing", weapon.shield_piercing ?? defaultValue],
        ["Base damage", weapon.damage ?? defaultValue],
        ["AP damage", weapon.ap_damage ?? defaultValue],
        ["Bonus vs Cavalry", weapon.bonus_v_cavalry ?? 0],
        ["Bonus vs Elephants", weapon.bonus_v_elephants ?? 0],
        ["Bonus vs Infantry", weapon.bonus_v_infantry ?? 0],
        ["Bonus vs Missiles", weapon.bonus_v_missiles ?? 0],
        ["Weak vs Missiles", weapon.weak_v_missiles ?? 0],
    ];
}

function prepareMissileWeapon(unitData, defaultValue = "N/A") {
    const stats = unitData.unitStats || {};
    const missile = unitData.missileWeapon || {};
    const projectile = unitData.projectile || {};

    return [
        ["Weapon", missile.weapon_id ?? defaultValue],
        ["Precursor", (missile.precursor == 1) ? "True" : "False"],
        ["Projectile", missile.projectile_id ?? defaultValue],
        ["Damage", projectile.damage ?? defaultValue],
        ["AP Damage", projectile.ap_damage ?? defaultValue],
        ["Bonus vs Cavalry", projectile.bonus_v_cavalry ?? defaultValue],
        ["Bonus vs Elephants", projectile.bonus_v_elephant ?? defaultValue],
        ["Bonus vs Infantry", projectile.bonus_v_infantry ?? defaultValue],
        ["Marksmanship Bonus", projectile.marksmanship_bonus ?? defaultValue],
        ["Effective Range", projectile.effective_range ?? defaultValue],
        ["Base Reload Time", projectile.base_reload_time ?? defaultValue],
        ["Ammunition", stats.ammo ?? defaultValue],
        ["Accuracy", stats.accuracy ?? defaultValue],
        ["Reload time", stats.reload ?? defaultValue],
    ];
}

function buildBlock(title, rows) {
    const blockWidth = 40;
    const MAX_LABEL_LEN = 16;
    const MAX_VALUE_LEN = blockWidth - MAX_LABEL_LEN - 6;

    const topBorder = `+${'─'.repeat(blockWidth - 2)}+`;
    const titleLine = `|${title.padStart(
        Math.floor((blockWidth - 2 + title.length) / 2)
    ).padEnd(blockWidth - 2)}|`;
    const botBorder = topBorder;

    const truncate = (text, maxLen) => {
        const str = String(text);
        return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
    };

    const contentLines = rows.map(([label, value], i) => {
        const isLast = i === rows.length - 1;
        const lineChar = isLast ? '└' : '├';
        const labelText = truncate(label, MAX_LABEL_LEN).padEnd(MAX_LABEL_LEN);
        const valueText = truncate(value, MAX_VALUE_LEN).padStart(MAX_VALUE_LEN);
        return `${lineChar}── ${labelText}: ${valueText}`;
    });

    return [topBorder, titleLine, botBorder, ...contentLines, ''].join('\n');
}

export function formatInfo(unitData) {
    const blocks = [
        buildBlock("BASIC STATS", prepareBasicStats(unitData)),
        buildBlock("DEFENSE", prepareDefense(unitData)),
        buildBlock("MELEE WEAPON", prepareMeleeWeapon(unitData)),
        buildBlock("MISSILE WEAPON", prepareMissileWeapon(unitData)),
    ];
    return blocks.join('\n');
}

