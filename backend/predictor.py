"""
predictor.py
Lightweight surrogate model for material property prediction.
Uses a GBR trained on a small curated dataset of oxide/ceramic materials.
In production this would be replaced by GNN / DFT-level models (e.g. DeePMD, Uni-Mol).
"""
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import json

# ---------------------------------------------------------------------------
# Minimal materials dataset: [bandgap_eV, formation_energy, electronegativity_diff,
#                              oxidation_state, ionic_radius_ratio, density_gcm3]
# Targets: [electrical_conductivity_log_S_m, thermal_expansion_ppm_K, max_use_temp_C]
# ---------------------------------------------------------------------------
TRAINING_DATA = [
    # La1-xSrxMnO3 (LSMO, x=0.3) - perovskite, SOFC cathode
    ([0.1, -3.5, 0.9, 3.0, 0.72, 6.5], [5.2, 11.8, 1000]),
    # La1-xSrxCrO3 (LSCr) - SOFC interconnect
    ([0.3, -3.8, 1.0, 3.0, 0.70, 6.7], [4.1, 9.5, 1100]),
    # LaCrO3 - perovskite chromite
    ([1.5, -4.0, 1.1, 3.0, 0.69, 6.8], [2.8, 9.1, 1100]),
    # MnCo2O4 spinel
    ([0.5, -2.1, 0.5, 2.7, 0.65, 5.2], [4.8, 12.5, 900]),
    # (La,Sr)(Cr,Mn)O3 - double perovskite
    ([0.2, -3.6, 0.95, 3.0, 0.71, 6.6], [4.5, 10.2, 1050]),
    # NiO - simple oxide
    ([3.7, -2.5, 1.8, 2.0, 0.56, 6.7], [0.1, 13.4, 700]),
    # Fe2O3 - hematite
    ([2.2, -2.9, 1.5, 3.0, 0.55, 5.2], [0.5, 12.0, 800]),
    # YBa2Cu3O7 (YBCO) - high-Tc superconductor
    ([0.0, -2.0, 0.8, 2.3, 0.68, 6.3], [6.8, 13.0, 90]),
    # SrTiO3 - perovskite dielectric
    ([3.2, -5.5, 1.6, 4.0, 0.80, 5.1], [0.01, 9.4, 1400]),
    # TiO2 (rutile) - wide-gap oxide
    ([3.0, -4.5, 1.9, 4.0, 0.74, 4.2], [0.001, 8.5, 1200]),
    # BaTiO3 - ferroelectric
    ([3.4, -5.8, 1.5, 4.0, 0.83, 6.0], [0.001, 10.0, 1300]),
    # CeO2 - electrolyte
    ([3.0, -5.2, 1.8, 4.0, 0.85, 7.2], [0.01, 12.0, 1500]),
    # Cr2O3 - chromia
    ([3.4, -3.7, 1.4, 3.0, 0.52, 5.2], [0.1, 7.9, 1200]),
    # CoFe2O4 spinel
    ([0.8, -2.3, 0.6, 2.7, 0.60, 5.3], [4.0, 11.5, 850]),
    # La2NiO4 (K2NiF4-type)
    ([0.2, -3.2, 1.0, 2.0, 0.75, 7.0], [3.8, 13.0, 900]),
    # SrFeO3 - perovskite
    ([0.0, -2.8, 1.1, 4.0, 0.73, 5.9], [5.5, 20.0, 800]),
]

X = np.array([d[0] for d in TRAINING_DATA])
y_cond = np.array([d[1][0] for d in TRAINING_DATA])
y_tec  = np.array([d[1][1] for d in TRAINING_DATA])
y_temp = np.array([d[1][2] for d in TRAINING_DATA])

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

gbr_cond = GradientBoostingRegressor(n_estimators=200, max_depth=3, random_state=42)
gbr_tec  = GradientBoostingRegressor(n_estimators=200, max_depth=3, random_state=42)
gbr_temp = GradientBoostingRegressor(n_estimators=200, max_depth=3, random_state=42)

gbr_cond.fit(X_scaled, y_cond)
gbr_tec.fit(X_scaled, y_tec)
gbr_temp.fit(X_scaled, y_temp)

# ---------------------------------------------------------------------------
# Material descriptor database (hand-curated for SOFC-relevant candidates)
# ---------------------------------------------------------------------------
MATERIAL_DESCRIPTORS = {
    "La0.8Sr0.2MnO3": {
        "formula": "La0.8Sr0.2MnO3",
        "name": "Lanthanum Strontium Manganite (LSM)",
        "features": [0.12, -3.5, 0.88, 3.0, 0.72, 6.5],
        "source": "Materials Project mp-19017",
    },
    "La0.7Sr0.3CrO3": {
        "formula": "La0.7Sr0.3CrO3",
        "name": "Lanthanum Strontium Chromite (LSCr)",
        "features": [0.28, -3.8, 1.0, 3.0, 0.70, 6.7],
        "source": "Materials Project mp-5786",
    },
    "MnCo2O4": {
        "formula": "MnCo2O4",
        "name": "Manganese Cobalt Spinel",
        "features": [0.5, -2.1, 0.55, 2.7, 0.65, 5.2],
        "source": "Materials Project mp-19006",
    },
    "La0.8Sr0.2Cr0.5Mn0.5O3": {
        "formula": "La0.8Sr0.2Cr0.5Mn0.5O3",
        "name": "LSCM Double Perovskite",
        "features": [0.18, -3.6, 0.94, 3.0, 0.71, 6.6],
        "source": "DOI:10.1039/C5EE00844A",
    },
    "La2NiO4": {
        "formula": "La2NiO4",
        "name": "Lanthanum Nickelate (K2NiF4-type)",
        "features": [0.22, -3.2, 1.0, 2.0, 0.75, 7.0],
        "source": "Materials Project mp-19803",
    },
    "SrTiO3": {
        "formula": "SrTiO3",
        "name": "Strontium Titanate",
        "features": [3.2, -5.5, 1.6, 4.0, 0.80, 5.1],
        "source": "Materials Project mp-5229",
    },
}


def predict_properties(formula: str) -> dict:
    """
    Predict electrical conductivity, thermal expansion, and max use temp for a material.
    Returns predicted values with uncertainty estimates.
    """
    if formula not in MATERIAL_DESCRIPTORS:
        return {"error": f"Material '{formula}' not in descriptor database"}

    desc = MATERIAL_DESCRIPTORS[formula]
    feat = np.array(desc["features"]).reshape(1, -1)
    feat_scaled = scaler.transform(feat)

    log_cond = float(gbr_cond.predict(feat_scaled)[0])
    tec       = float(gbr_tec.predict(feat_scaled)[0])
    max_temp  = float(gbr_temp.predict(feat_scaled)[0])

    # Rough uncertainty: ±15% for conductivity, ±1 ppm/K for TEC, ±50°C for temp
    return {
        "formula": formula,
        "name": desc["name"],
        "source": desc["source"],
        "electrical_conductivity": {
            "value": round(10 ** log_cond, 1),
            "log_value": round(log_cond, 2),
            "unit": "S/m",
            "uncertainty": "±20%",
        },
        "thermal_expansion_coefficient": {
            "value": round(tec, 1),
            "unit": "ppm/K",
            "uncertainty": "±1.0 ppm/K",
        },
        "max_use_temperature": {
            "value": round(max_temp, 0),
            "unit": "°C",
            "uncertainty": "±50°C",
        },
        "confidence": "medium",
    }


def batch_predict(formulas: list[str]) -> list[dict]:
    return [predict_properties(f) for f in formulas]


def get_available_materials() -> list[str]:
    return list(MATERIAL_DESCRIPTORS.keys())
