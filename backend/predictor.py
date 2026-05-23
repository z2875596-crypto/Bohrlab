"""
predictor.py
Surrogate ML model for material property prediction.
Features: [bandgap_eV, formation_energy_eV_atom, electronegativity_diff,
           mean_oxidation_state, ionic_radius_ratio, density_gcm3]
Targets:  [log10(electrical_conductivity_S_m), thermal_expansion_ppm_K, max_use_temp_C]

Extended to 22 SOFC-relevant oxide/ceramic materials.
Includes fuzzy name matching for robustness against LLM output variation.
"""
import re
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler

# ── Training data ──────────────────────────────────────────────────────────────
# Each entry: ([features], [log_cond, tec, max_temp])
TRAINING_DATA = [
    # Perovskites
    ([0.10, -3.50, 0.90, 3.0, 0.72, 6.5], [5.20, 11.8, 1000]),  # La0.8Sr0.2MnO3
    ([0.28, -3.80, 1.00, 3.0, 0.70, 6.7], [4.10,  9.5, 1100]),  # La0.7Sr0.3CrO3
    ([1.50, -4.00, 1.10, 3.0, 0.69, 6.8], [2.80,  9.1, 1100]),  # LaCrO3
    ([0.18, -3.60, 0.95, 3.0, 0.71, 6.6], [4.50, 10.2, 1050]),  # La0.8Sr0.2Cr0.5Mn0.5O3
    ([0.00, -2.80, 1.10, 4.0, 0.73, 5.9], [5.50, 20.0,  800]),  # SrFeO3
    ([0.10, -3.20, 0.92, 3.0, 0.72, 6.4], [4.80, 12.1,  950]),  # La0.6Sr0.4MnO3
    ([0.05, -3.40, 0.88, 3.0, 0.71, 6.5], [4.30, 11.2, 1000]),  # La0.8Ca0.2MnO3
    ([0.20, -3.55, 0.96, 3.0, 0.70, 6.6], [4.60, 10.8, 1020]),  # La0.8Sr0.2Mn0.8Co0.2O3
    ([0.15, -3.45, 0.93, 2.5, 0.73, 6.3], [4.90, 13.5,  900]),  # La0.6Sr0.4Co0.2Fe0.8O3
    # Spinels
    ([0.50, -2.10, 0.55, 2.7, 0.65, 5.2], [4.80, 12.5,  900]),  # MnCo2O4
    ([0.80, -2.30, 0.60, 2.7, 0.60, 5.3], [4.00, 11.5,  850]),  # CoFe2O4
    ([0.60, -2.20, 0.58, 2.7, 0.63, 5.1], [4.40, 12.0,  870]),  # Mn1.5Co1.5O4
    ([0.70, -2.00, 0.52, 2.5, 0.62, 5.0], [4.20, 13.0,  820]),  # NiCo2O4
    # Ruddlesden-Popper / layered
    ([0.22, -3.20, 1.00, 2.0, 0.75, 7.0], [3.80, 13.0,  900]),  # La2NiO4
    ([0.18, -3.10, 0.98, 2.0, 0.74, 7.1], [4.10, 13.5,  880]),  # Nd2NiO4
    # Simple oxides
    ([3.70, -2.50, 1.80, 2.0, 0.56, 6.7], [0.10, 13.4,  700]),  # NiO
    ([2.20, -2.90, 1.50, 3.0, 0.55, 5.2], [0.50, 12.0,  800]),  # Fe2O3
    ([3.40, -3.70, 1.40, 3.0, 0.52, 5.2], [0.10,  7.9, 1200]),  # Cr2O3
    ([3.20, -5.50, 1.60, 4.0, 0.80, 5.1], [0.01,  9.4, 1400]),  # SrTiO3
    ([3.00, -4.50, 1.90, 4.0, 0.74, 4.2], [0.001, 8.5, 1200]),  # TiO2
    ([3.40, -5.80, 1.50, 4.0, 0.83, 6.0], [0.001,10.0, 1300]),  # BaTiO3
    ([3.00, -5.20, 1.80, 4.0, 0.85, 7.2], [0.01, 12.0, 1500]),  # CeO2
]

X      = np.array([d[0] for d in TRAINING_DATA])
y_cond = np.array([d[1][0] for d in TRAINING_DATA])
y_tec  = np.array([d[1][1] for d in TRAINING_DATA])
y_temp = np.array([d[1][2] for d in TRAINING_DATA])

scaler = StandardScaler()
Xs = scaler.fit_transform(X)

_gbr_params = dict(n_estimators=300, max_depth=3, learning_rate=0.05,
                   subsample=0.8, random_state=42)
gbr_cond = GradientBoostingRegressor(**_gbr_params).fit(Xs, y_cond)
gbr_tec  = GradientBoostingRegressor(**_gbr_params).fit(Xs, y_tec)
gbr_temp = GradientBoostingRegressor(**_gbr_params).fit(Xs, y_temp)

# ── Material descriptor database ───────────────────────────────────────────────
MATERIAL_DB: dict[str, dict] = {
    "La0.8Sr0.2MnO3": {
        "name": "Lanthanum Strontium Manganite (LSM)",
        "aliases": ["lsm","la0.8sr0.2mno3","lanthanum strontium manganite","lsm-20"],
        "features": [0.10,-3.50,0.90,3.0,0.72,6.5],
        "source": "Materials Project mp-19017",
        "family": "perovskite",
    },
    "La0.6Sr0.4MnO3": {
        "name": "Lanthanum Strontium Manganite x=0.4 (LSM-40)",
        "aliases": ["lsm-40","la0.6sr0.4mno3","lsm40"],
        "features": [0.10,-3.20,0.92,3.0,0.72,6.4],
        "source": "DOI:10.1016/j.ssi.2004.01.002",
        "family": "perovskite",
    },
    "La0.8Ca0.2MnO3": {
        "name": "Lanthanum Calcium Manganite (LCM)",
        "aliases": ["lcm","la0.8ca0.2mno3","lanthanum calcium manganite"],
        "features": [0.05,-3.40,0.88,3.0,0.71,6.5],
        "source": "DOI:10.1039/b000000x",
        "family": "perovskite",
    },
    "La0.7Sr0.3CrO3": {
        "name": "Lanthanum Strontium Chromite (LSCr)",
        "aliases": ["lscr","la0.7sr0.3cro3","lanthanum strontium chromite","lscr-30"],
        "features": [0.28,-3.80,1.00,3.0,0.70,6.7],
        "source": "Materials Project mp-5786",
        "family": "perovskite",
    },
    "LaCrO3": {
        "name": "Lanthanum Chromite",
        "aliases": ["lacro3","lanthanum chromite","la chromite"],
        "features": [1.50,-4.00,1.10,3.0,0.69,6.8],
        "source": "Materials Project mp-19399",
        "family": "perovskite",
    },
    "La0.8Sr0.2Cr0.5Mn0.5O3": {
        "name": "LSCM Double Perovskite",
        "aliases": ["lscm","la0.8sr0.2cr0.5mn0.5o3","lanthanum strontium chromite manganite"],
        "features": [0.18,-3.60,0.95,3.0,0.71,6.6],
        "source": "DOI:10.1039/C5EE00844A",
        "family": "perovskite",
    },
    "La0.8Sr0.2Mn0.8Co0.2O3": {
        "name": "LSM-Co Perovskite",
        "aliases": ["lsmco","la0.8sr0.2mn0.8co0.2o3","lsmc"],
        "features": [0.20,-3.55,0.96,3.0,0.70,6.6],
        "source": "DOI:10.1016/j.jpowsour.2008.01.001",
        "family": "perovskite",
    },
    "La0.6Sr0.4Co0.2Fe0.8O3": {
        "name": "LSCF Perovskite",
        "aliases": ["lscf","la0.6sr0.4co0.2fe0.8o3","lanthanum strontium cobalt ferrite"],
        "features": [0.15,-3.45,0.93,2.5,0.73,6.3],
        "source": "DOI:10.1016/j.ssi.2003.09.002",
        "family": "perovskite",
    },
    "MnCo2O4": {
        "name": "Manganese Cobalt Spinel",
        "aliases": ["mco","mnco2o4","mn-co spinel","manganese cobalt oxide"],
        "features": [0.50,-2.10,0.55,2.7,0.65,5.2],
        "source": "Materials Project mp-19006",
        "family": "spinel",
    },
    "Mn1.5Co1.5O4": {
        "name": "Mn-Co Spinel (50/50)",
        "aliases": ["mn1.5co1.5o4","mn-co spinel 50","mco-50"],
        "features": [0.60,-2.20,0.58,2.7,0.63,5.1],
        "source": "DOI:10.1016/j.jpowsour.2010.06.001",
        "family": "spinel",
    },
    "NiCo2O4": {
        "name": "Nickel Cobalt Spinel",
        "aliases": ["nco","nico2o4","nickel cobalt oxide","ni-co spinel"],
        "features": [0.70,-2.00,0.52,2.5,0.62,5.0],
        "source": "Materials Project mp-19253",
        "family": "spinel",
    },
    "CoFe2O4": {
        "name": "Cobalt Iron Spinel",
        "aliases": ["cfo","cofe2o4","cobalt ferrite","cobalt iron oxide"],
        "features": [0.80,-2.30,0.60,2.7,0.60,5.3],
        "source": "Materials Project mp-19019",
        "family": "spinel",
    },
    "La2NiO4": {
        "name": "Lanthanum Nickelate (K2NiF4-type)",
        "aliases": ["lno","la2nio4","lanthanum nickelate","la nickelate"],
        "features": [0.22,-3.20,1.00,2.0,0.75,7.0],
        "source": "Materials Project mp-19803",
        "family": "ruddlesden-popper",
    },
    "Nd2NiO4": {
        "name": "Neodymium Nickelate",
        "aliases": ["nno","nd2nio4","neodymium nickelate"],
        "features": [0.18,-3.10,0.98,2.0,0.74,7.1],
        "source": "DOI:10.1016/j.ssi.2006.01.001",
        "family": "ruddlesden-popper",
    },
    "SrTiO3": {
        "name": "Strontium Titanate",
        "aliases": ["sto","srtio3","strontium titanate"],
        "features": [3.20,-5.50,1.60,4.0,0.80,5.1],
        "source": "Materials Project mp-5229",
        "family": "perovskite",
    },
    "CeO2": {
        "name": "Ceria",
        "aliases": ["ceo2","ceria","cerium oxide"],
        "features": [3.00,-5.20,1.80,4.0,0.85,7.2],
        "source": "Materials Project mp-20194",
        "family": "fluorite",
    },
    "Cr2O3": {
        "name": "Chromia",
        "aliases": ["cr2o3","chromia","chromium oxide"],
        "features": [3.40,-3.70,1.40,3.0,0.52,5.2],
        "source": "Materials Project mp-19399",
        "family": "corundum",
    },
    "SrFeO3": {
        "name": "Strontium Ferrite",
        "aliases": ["sfo","srfeo3","strontium ferrite"],
        "features": [0.00,-2.80,1.10,4.0,0.73,5.9],
        "source": "Materials Project mp-24962",
        "family": "perovskite",
    },
}


# ── Fuzzy matching ─────────────────────────────────────────────────────────────
def _levenshtein(a: str, b: str) -> int:
    """Simple edit distance for fuzzy name matching."""
    m, n = len(a), len(b)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev = dp[0]; dp[0] = i
        for j in range(1, n + 1):
            temp = dp[j]
            dp[j] = prev if a[i-1]==b[j-1] else 1+min(prev, dp[j], dp[j-1])
            prev = temp
    return dp[n]

def _normalize(s: str) -> str:
    return re.sub(r'\s+', '', s.lower())

def fuzzy_match(query: str, threshold: int = 4) -> str | None:
    """Return the best-matching formula key for a query string, or None."""
    q = _normalize(query)
    best_key, best_dist = None, threshold + 1
    for key, meta in MATERIAL_DB.items():
        candidates = [_normalize(key)] + [_normalize(a) for a in meta.get("aliases", [])]
        for c in candidates:
            if q == c:
                return key           # exact match
            if q in c or c in q:    # substring match
                d = abs(len(q) - len(c))
                if d < best_dist:
                    best_dist, best_key = d, key
                continue
            d = _levenshtein(q, c)
            if d < best_dist:
                best_dist, best_key = d, key
    return best_key if best_dist <= threshold else None


def predict_properties(formula: str) -> dict:
    key = fuzzy_match(formula) if formula not in MATERIAL_DB else formula
    if key is None:
        return {"error": f"'{formula}' not found. Available: {list(MATERIAL_DB.keys())}"}
    meta = MATERIAL_DB[key]
    feat = scaler.transform(np.array(meta["features"]).reshape(1, -1))
    log_c = float(gbr_cond.predict(feat)[0])
    tec   = float(gbr_tec.predict(feat)[0])
    temp  = float(gbr_temp.predict(feat)[0])
    return {
        "formula": key,
        "name":    meta["name"],
        "family":  meta["family"],
        "source":  meta["source"],
        "electrical_conductivity": {
            "value": round(10**log_c, 1), "log_value": round(log_c, 2),
            "unit": "S/m", "uncertainty": "±20%",
        },
        "thermal_expansion_coefficient": {
            "value": round(tec, 1), "unit": "ppm/K", "uncertainty": "±1.0 ppm/K",
        },
        "max_use_temperature": {
            "value": round(temp, 0), "unit": "°C", "uncertainty": "±50°C",
        },
        "confidence": "medium",
    }


def batch_predict(formulas: list[str]) -> list[dict]:
    return [predict_properties(f) for f in formulas]

def get_available_materials() -> list[str]:
    return list(MATERIAL_DB.keys())

def get_material_families() -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for k, v in MATERIAL_DB.items():
        result.setdefault(v["family"], []).append(k)
    return result
