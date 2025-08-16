# Disclaimer About the Data
- This repository uses data **derived from Total War: Rome 2**.  
- All original data, assets, and intellectual property belong to **Creative Assembly / SEGA**.  
- Data has been transformed, cleaned, and modified for my personal purposes.  
- Accuracy is **not guaranteed** — data may be incomplete, wrong, or outright weird. 


# Formulas


## Hardcoded values
Some values are hardcoded in the game and can be found in _kv_rules.xml
```
BASE_HIT_CHANCE = 40
MIN_HIT_CHANCE = 15
MAX_HIT_CHANCE = 75
```

## Basic unit data
This values are obtained from:
- land_units.xml
- melee_weapons.xml
- unit_armour_types.xml
- unit_shield_types.xml

```
Melee_Weapon_Damage = Your.MeleeWeapon.Damage
Melee_Attack_Chance = Your.Melee_Attack_Chance
Melee_Defence_Chance = Your.Melee_Defence_Chance + Your.Shield_Defence_Value
Missile_Defence_Chance = Your.Shield_Missile_Block_Chance
Melee_Armour_Value = Your.Armour_Value + Your.Shield_Armour_Value
```
## Agregated data
These values are calculated using the basic unit data and simple statistical formulas:
| Name                        | Formula                                                                 | Purpose                                                                                     |
|------------------------------|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| Melee_Hit_Chance             | BASE_HIT_CHANCE + Melee_Attack_Chance - Enemy.Melee_Defence_Chance      | Calculates the raw probability of hitting the enemy before applying min/max limits.        |
| Effective_Melee_Hit_Chance   | Max(MIN_HIT_CHANCE, Min(MAX_HIT_CHANCE, Melee_Hit_Chance))              | Clamps hit chance between minimum and maximum values to reflect game rules.                |
| Effective_Defence_Chance     | 100 - Enemy.Effective_Melee_Hit_Chance                                   | Determines the effective chance of avoiding damage from the enemy.                          |
| Expected_Melee_Damage        | Melee_Weapon_Damage * (Effective_Melee_Hit_Chance / 100)                | Estimates average damage dealt considering hit chance.                                      |
| Expected_Melee_Defence       | (Your.Melee_Armour_Value - Enemy.MeleeWeapon.AP_Damage) * (Effective_Defence_Chance / 100) | Estimates average damage mitigated by armor and defense.                                    |
| Melee_Combat_Score           | (Expected_Melee_Damage / 100) * Expected_Melee_Defence                  | Combines offense and defense into a single metric for unit combat efficiency.              |

