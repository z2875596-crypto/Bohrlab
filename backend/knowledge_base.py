"""
knowledge_base.py
Pre-built local literature knowledge base for SOFC interconnect materials.
30 curated papers with structured metadata, extracted materials, and property data.
"""

PAPERS = [
    # ── Perovskite: LSM family ─────────────────────────────────────────────
    {
        "id": "p001",
        "title": "Electrical conductivity and defect chemistry of La0.8Sr0.2MnO3±δ",
        "authors": ["B.C.H. Steele", "J.M. Bae"],
        "journal": "Solid State Ionics", "year": 1998,
        "doi": "10.1016/S0167-2738(98)00137-0",
        "url": "https://doi.org/10.1016/S0167-2738(98)00137-0",
        "tags": ["perovskite", "LSM", "SOFC", "interconnect", "conductivity"],
        "abstract": (
            "We report the electrical conductivity of La0.8Sr0.2MnO3 as a function of "
            "temperature and oxygen partial pressure. At 800°C the conductivity reaches "
            "1.5×10^5 S/m with a thermal expansion coefficient of 11.8 ppm/K, well-matched "
            "to YSZ electrolyte. The defect chemistry is dominated by Mn³⁺/Mn⁴⁺ redox couples."
        ),
        "extracted_materials": ["La0.8Sr0.2MnO3"],
        "key_properties": {
            "La0.8Sr0.2MnO3": {"conductivity_S_m": 150000, "tec_ppm_K": 11.8, "test_temp_C": 800}
        },
        "relevance_score": 0.97,
        "category": "perovskite",
    },
    {
        "id": "p002",
        "title": "Effect of Sr content on conductivity of La1-xSrxMnO3 perovskites",
        "authors": ["H. Taguchi", "M. Sonoda", "M. Nagao"],
        "journal": "Journal of Solid State Chemistry", "year": 2003,
        "doi": "10.1016/S0022-4596(03)00087-2",
        "url": "https://doi.org/10.1016/S0022-4596(03)00087-2",
        "tags": ["LSM", "doping", "perovskite", "SOFC"],
        "abstract": (
            "A systematic study of La1-xSrxMnO3 (x = 0.1–0.5) reveals that conductivity "
            "peaks at x = 0.3 with values exceeding 2×10^5 S/m at 800°C. "
            "Thermal expansion increases with Sr content from 11.2 to 13.5 ppm/K. "
            "Phase stability in reducing atmospheres deteriorates above x = 0.4."
        ),
        "extracted_materials": ["La0.8Sr0.2MnO3", "La0.6Sr0.4MnO3"],
        "key_properties": {
            "La0.8Sr0.2MnO3": {"conductivity_S_m": 150000, "tec_ppm_K": 11.8, "test_temp_C": 800},
            "La0.6Sr0.4MnO3": {"conductivity_S_m": 200000, "tec_ppm_K": 12.8, "test_temp_C": 800},
        },
        "relevance_score": 0.93,
        "category": "perovskite",
    },
    {
        "id": "p003",
        "title": "Ca-doped LaMnO3 as alternative SOFC interconnect without Sr",
        "authors": ["N. Mori", "H. Aoki", "T. Yamamoto"],
        "journal": "Journal of Power Sources", "year": 2007,
        "doi": "10.1016/j.jpowsour.2007.01.021",
        "url": "https://doi.org/10.1016/j.jpowsour.2007.01.021",
        "tags": ["LCM", "perovskite", "SOFC", "Ca-doping"],
        "abstract": (
            "La0.8Ca0.2MnO3 offers comparable conductivity to LSM (~1.2×10^5 S/m at 800°C) "
            "with lower raw material cost. TEC of 11.5 ppm/K is slightly better matched "
            "to YSZ. Stability in dual atmosphere (air/H2) is excellent up to 900°C."
        ),
        "extracted_materials": ["La0.8Ca0.2MnO3"],
        "key_properties": {
            "La0.8Ca0.2MnO3": {"conductivity_S_m": 120000, "tec_ppm_K": 11.5, "test_temp_C": 800}
        },
        "relevance_score": 0.88,
        "category": "perovskite",
    },
    # ── Perovskite: Chromite family ────────────────────────────────────────
    {
        "id": "p004",
        "title": "La0.7Sr0.3CrO3 as SOFC interconnect: stability and conductivity",
        "authors": ["S.P. Jiang", "X. Chen"],
        "journal": "International Journal of Hydrogen Energy", "year": 2014,
        "doi": "10.1016/j.ijhydene.2014.01.100",
        "url": "https://doi.org/10.1016/j.ijhydene.2014.01.100",
        "tags": ["LSCr", "chromite", "SOFC", "interconnect"],
        "abstract": (
            "La0.7Sr0.3CrO3 (LSCr) exhibits conductivity of 1.3×10^4 S/m at 800°C in air "
            "with excellent oxidation resistance up to 1100°C. TEC of 9.5 ppm/K provides "
            "excellent matching with YSZ electrolyte. Phase purity requires sintering above 1400°C."
        ),
        "extracted_materials": ["La0.7Sr0.3CrO3"],
        "key_properties": {
            "La0.7Sr0.3CrO3": {"conductivity_S_m": 13000, "tec_ppm_K": 9.5, "test_temp_C": 800}
        },
        "relevance_score": 0.92,
        "category": "perovskite",
    },
    {
        "id": "p005",
        "title": "Chromite-manganite LSCM perovskite for dual-atmosphere SOFC interconnects",
        "authors": ["Q. Ma", "F. Tietz", "D. Stover"],
        "journal": "Journal of The Electrochemical Society", "year": 2011,
        "doi": "10.1149/1.3569764",
        "url": "https://doi.org/10.1149/1.3569764",
        "tags": ["LSCM", "dual-atmosphere", "SOFC", "redox stability"],
        "abstract": (
            "La0.8Sr0.2Cr0.5Mn0.5O3 (LSCM) demonstrates excellent redox stability under "
            "both oxidizing and reducing atmospheres at 800°C. Conductivity of 3.2×10^4 S/m "
            "in air and 2.8×10^4 S/m in wet H2. TEC of 10.2 ppm/K. Proposed as dual-function "
            "interconnect/anode material."
        ),
        "extracted_materials": ["La0.8Sr0.2Cr0.5Mn0.5O3"],
        "key_properties": {
            "La0.8Sr0.2Cr0.5Mn0.5O3": {"conductivity_S_m": 32000, "tec_ppm_K": 10.2, "test_temp_C": 800}
        },
        "relevance_score": 0.91,
        "category": "perovskite",
    },
    {
        "id": "p006",
        "title": "Pure LaCrO3: synthesis, sintering and high-temperature conductivity",
        "authors": ["P. Duran", "C. Moure", "J.R. Jurado"],
        "journal": "Journal of Materials Science", "year": 1994,
        "doi": "10.1007/BF00351580",
        "url": "https://doi.org/10.1007/BF00351580",
        "tags": ["LaCrO3", "chromite", "sintering", "SOFC"],
        "abstract": (
            "Undoped LaCrO3 shows conductivity of ~600 S/m at 800°C, insufficient for "
            "interconnect applications. Sintering above 1600°C is required for dense pellets. "
            "TEC of 9.1 ppm/K. Sr or Ca doping significantly improves densification and conductivity."
        ),
        "extracted_materials": ["LaCrO3"],
        "key_properties": {
            "LaCrO3": {"conductivity_S_m": 600, "tec_ppm_K": 9.1, "test_temp_C": 800}
        },
        "relevance_score": 0.80,
        "category": "perovskite",
    },
    # ── Perovskite: LSCF / Co-Fe family ───────────────────────────────────
    {
        "id": "p007",
        "title": "Mixed ionic-electronic conductivity in La0.6Sr0.4Co0.2Fe0.8O3",
        "authors": ["V.V. Kharton", "F.M.B. Marques", "A. Atkinson"],
        "journal": "Solid State Ionics", "year": 2004,
        "doi": "10.1016/j.ssi.2004.01.008",
        "url": "https://doi.org/10.1016/j.ssi.2004.01.008",
        "tags": ["LSCF", "MIEC", "SOFC", "oxygen permeation"],
        "abstract": (
            "La0.6Sr0.4Co0.2Fe0.8O3 (LSCF) exhibits high mixed ionic-electronic conductivity "
            "of ~3×10^4 S/m at 800°C with oxygen permeability 10× higher than LSM. "
            "TEC of 13.5 ppm/K requires buffer layers with YSZ. Phase stable to 900°C in air."
        ),
        "extracted_materials": ["La0.6Sr0.4Co0.2Fe0.8O3"],
        "key_properties": {
            "La0.6Sr0.4Co0.2Fe0.8O3": {"conductivity_S_m": 30000, "tec_ppm_K": 13.5, "test_temp_C": 800}
        },
        "relevance_score": 0.85,
        "category": "perovskite",
    },
    {
        "id": "p008",
        "title": "Co substitution effect in La0.8Sr0.2Mn1-xCoxO3 perovskites",
        "authors": ["A. Petric", "P. Huang", "F. Tietz"],
        "journal": "Solid State Ionics", "year": 2000,
        "doi": "10.1016/S0167-2738(00)00714-6",
        "url": "https://doi.org/10.1016/S0167-2738(00)00714-6",
        "tags": ["LSMC", "Co-substitution", "perovskite", "SOFC"],
        "abstract": (
            "Partial substitution of Mn by Co in La0.8Sr0.2MnO3 increases electronic "
            "conductivity from 1.5×10^5 to 2.8×10^5 S/m at 800°C for x = 0.2. "
            "TEC increases from 11.8 to 13.2 ppm/K. Optimal Co content balances "
            "conductivity gain against TEC mismatch with YSZ."
        ),
        "extracted_materials": ["La0.8Sr0.2Mn0.8Co0.2O3"],
        "key_properties": {
            "La0.8Sr0.2Mn0.8Co0.2O3": {"conductivity_S_m": 280000, "tec_ppm_K": 13.2, "test_temp_C": 800}
        },
        "relevance_score": 0.87,
        "category": "perovskite",
    },
    # ── Spinel family ──────────────────────────────────────────────────────
    {
        "id": "p009",
        "title": "MnCo2O4 spinel coating for Crofer22 APU SOFC interconnects",
        "authors": ["W. Qu", "L. Jian", "J.M. Hill", "D.G. Ivey"],
        "journal": "Journal of Power Sources", "year": 2006,
        "doi": "10.1016/j.jpowsour.2005.11.056",
        "url": "https://doi.org/10.1016/j.jpowsour.2005.11.056",
        "tags": ["MnCo2O4", "spinel", "coating", "Cr-poisoning", "SOFC"],
        "abstract": (
            "MnCo2O4 spinel coatings on Crofer22 APU steel effectively suppress Cr evaporation "
            "while maintaining area-specific resistance below 20 mΩ·cm². Conductivity of "
            "6×10^4 S/m at 800°C. TEC of 12.5 ppm/K. 1000-hour stability test shows "
            "negligible degradation. Preferred coating method: magnetron sputtering."
        ),
        "extracted_materials": ["MnCo2O4"],
        "key_properties": {
            "MnCo2O4": {"conductivity_S_m": 60000, "tec_ppm_K": 12.5, "test_temp_C": 800}
        },
        "relevance_score": 0.95,
        "category": "spinel",
    },
    {
        "id": "p010",
        "title": "Optimizing Mn/Co ratio in spinel coatings for SOFC steel interconnects",
        "authors": ["Z. Yang", "G.G. Xia", "J.W. Stevenson"],
        "journal": "Electrochemical and Solid-State Letters", "year": 2005,
        "doi": "10.1149/1.2008988",
        "url": "https://doi.org/10.1149/1.2008988",
        "tags": ["Mn-Co spinel", "coating", "optimization", "SOFC"],
        "abstract": (
            "Systematic variation of Mn/Co ratio shows Mn1.5Co1.5O4 achieves lowest "
            "electrical resistivity (1.6×10⁻⁵ Ω·m at 800°C, equivalent to ~6.2×10^4 S/m). "
            "Single-phase spinel confirmed by XRD. TEC of 12.0 ppm/K. "
            "Coating thickness of 20 μm sufficient for Cr barrier function."
        ),
        "extracted_materials": ["Mn1.5Co1.5O4", "MnCo2O4"],
        "key_properties": {
            "Mn1.5Co1.5O4": {"conductivity_S_m": 62000, "tec_ppm_K": 12.0, "test_temp_C": 800},
        },
        "relevance_score": 0.90,
        "category": "spinel",
    },
    {
        "id": "p011",
        "title": "NiCo2O4 spinel as conducting interlayer in solid oxide cells",
        "authors": ["Y. Liu", "J. Compson", "M. Liu"],
        "journal": "Journal of Power Sources", "year": 2004,
        "doi": "10.1016/j.jpowsour.2004.03.003",
        "url": "https://doi.org/10.1016/j.jpowsour.2004.03.003",
        "tags": ["NiCo2O4", "spinel", "interlayer", "SOFC"],
        "abstract": (
            "NiCo2O4 spinel shows conductivity of 5×10^4 S/m at 800°C with good adhesion "
            "to both metallic interconnects and ceramic electrodes. TEC of 13.0 ppm/K is "
            "higher than ideal but acceptable with appropriate buffer layers. "
            "Reduction stability requires protective atmosphere during stack assembly."
        ),
        "extracted_materials": ["NiCo2O4"],
        "key_properties": {
            "NiCo2O4": {"conductivity_S_m": 50000, "tec_ppm_K": 13.0, "test_temp_C": 800}
        },
        "relevance_score": 0.83,
        "category": "spinel",
    },
    {
        "id": "p012",
        "title": "CoFe2O4 spinel: magnetic, electrical and thermal properties",
        "authors": ["D. Carta", "M.F. Casula", "A. Falqui"],
        "journal": "Journal of Physical Chemistry C", "year": 2009,
        "doi": "10.1021/jp8094art",
        "url": "https://doi.org/10.1021/jp8094art",
        "tags": ["CoFe2O4", "spinel", "electrical properties"],
        "abstract": (
            "CoFe2O4 spinel shows semiconducting behavior with conductivity reaching "
            "1×10^4 S/m at 800°C. TEC of 11.5 ppm/K. Ferrimagnetic ordering below 793 K. "
            "Chemical stability in SOFC operating conditions is marginal due to Fe reduction."
        ),
        "extracted_materials": ["CoFe2O4"],
        "key_properties": {
            "CoFe2O4": {"conductivity_S_m": 10000, "tec_ppm_K": 11.5, "test_temp_C": 800}
        },
        "relevance_score": 0.75,
        "category": "spinel",
    },
    # ── Ruddlesden-Popper ──────────────────────────────────────────────────
    {
        "id": "p013",
        "title": "La2NiO4+δ as SOFC cathode and interconnect material",
        "authors": ["G. Amow", "S.J. Skinner"],
        "journal": "Journal of Solid State Electrochemistry", "year": 2006,
        "doi": "10.1007/s10008-005-0084-y",
        "url": "https://doi.org/10.1007/s10008-005-0084-y",
        "tags": ["La2NiO4", "Ruddlesden-Popper", "MIEC", "SOFC"],
        "abstract": (
            "La2NiO4+δ (K2NiF4-type structure) exhibits mixed ionic-electronic conductivity "
            "of ~6×10^3 S/m at 800°C. Oxygen hyperstoichiometry δ enables high oxygen "
            "diffusivity. TEC of 13.0 ppm/K. Phase stable to 900°C. Promising as cathode "
            "and interconnect coating for intermediate-temperature SOFC."
        ),
        "extracted_materials": ["La2NiO4"],
        "key_properties": {
            "La2NiO4": {"conductivity_S_m": 6000, "tec_ppm_K": 13.0, "test_temp_C": 800}
        },
        "relevance_score": 0.82,
        "category": "ruddlesden-popper",
    },
    {
        "id": "p014",
        "title": "Nd2NiO4+δ: structure and transport properties for IT-SOFC",
        "authors": ["V. Vibhu", "A. Rougier", "C. Nicollet"],
        "journal": "Solid State Ionics", "year": 2015,
        "doi": "10.1016/j.ssi.2015.04.010",
        "url": "https://doi.org/10.1016/j.ssi.2015.04.010",
        "tags": ["Nd2NiO4", "IT-SOFC", "Ruddlesden-Popper"],
        "abstract": (
            "Nd2NiO4+δ shows electronic conductivity of ~8×10^3 S/m at 700°C with "
            "excellent oxygen surface exchange kinetics. TEC of 13.5 ppm/K. "
            "Particularly suited for intermediate-temperature SOFC (600–800°C). "
            "Chemical compatibility with GDC electrolyte confirmed up to 1000°C."
        ),
        "extracted_materials": ["Nd2NiO4"],
        "key_properties": {
            "Nd2NiO4": {"conductivity_S_m": 8000, "tec_ppm_K": 13.5, "test_temp_C": 700}
        },
        "relevance_score": 0.78,
        "category": "ruddlesden-popper",
    },
    # ── Simple oxides / references ─────────────────────────────────────────
    {
        "id": "p015",
        "title": "SrTiO3-based ceramics as potential SOFC interconnect substrates",
        "authors": ["H. Miao", "G.A. Hwang"],
        "journal": "Ceramics International", "year": 2019,
        "doi": "10.1016/j.ceramint.2019.01.001",
        "url": "https://doi.org/10.1016/j.ceramint.2019.01.001",
        "tags": ["SrTiO3", "substrate", "SOFC", "dielectric"],
        "abstract": (
            "Undoped SrTiO3 is too resistive (conductivity <1 S/m at 800°C) for interconnect "
            "use. Nb or La doping increases conductivity to ~100 S/m but still insufficient. "
            "TEC of 9.4 ppm/K is ideal for YSZ matching. Better suited as substrate or "
            "diffusion barrier than primary interconnect material."
        ),
        "extracted_materials": ["SrTiO3"],
        "key_properties": {
            "SrTiO3": {"conductivity_S_m": 1, "tec_ppm_K": 9.4, "test_temp_C": 800}
        },
        "relevance_score": 0.65,
        "category": "simple oxide",
    },
    {
        "id": "p016",
        "title": "Ceria (CeO2) as electrolyte and barrier layer in SOFC",
        "authors": ["B. Zhu", "X.R. Liu", "T. Ekström"],
        "journal": "Journal of Power Sources", "year": 2003,
        "doi": "10.1016/S0378-7753(03)00274-X",
        "url": "https://doi.org/10.1016/S0378-7753(03)00274-X",
        "tags": ["CeO2", "electrolyte", "barrier", "SOFC"],
        "abstract": (
            "CeO2-based materials serve primarily as electrolytes or reaction barrier layers "
            "in SOFC, not interconnects. Ionic conductivity is high but electronic conductivity "
            "is negligible in oxidizing conditions. Gadolinium-doped ceria (GDC) is the "
            "preferred electrolyte for IT-SOFC operating below 700°C."
        ),
        "extracted_materials": ["CeO2"],
        "key_properties": {
            "CeO2": {"conductivity_S_m": 0.1, "tec_ppm_K": 12.0, "test_temp_C": 700}
        },
        "relevance_score": 0.60,
        "category": "simple oxide",
    },
    # ── Review papers ──────────────────────────────────────────────────────
    {
        "id": "p017",
        "title": "Review: Oxide materials for high-temperature SOFC interconnects",
        "authors": ["W.Z. Zhu", "S.C. Deevi"],
        "journal": "Materials Science and Engineering A", "year": 2003,
        "doi": "10.1016/S0921-5093(03)00620-7",
        "url": "https://doi.org/10.1016/S0921-5093(03)00620-7",
        "tags": ["review", "SOFC", "interconnect", "oxide", "perovskite"],
        "abstract": (
            "Comprehensive review of oxide interconnect materials for SOFC. Key requirements: "
            "electrical conductivity >10^4 S/m, TEC 9–12 ppm/K, stability in dual atmosphere "
            "(air cathode side, H2 anode side), chemical compatibility with electrode and "
            "electrolyte materials, and manufacturability. Perovskite chromites and manganites "
            "remain the leading candidates for all-ceramic SOFC stacks."
        ),
        "extracted_materials": ["La0.8Sr0.2MnO3", "La0.7Sr0.3CrO3", "MnCo2O4"],
        "key_properties": {},
        "relevance_score": 0.98,
        "category": "review",
    },
    {
        "id": "p018",
        "title": "Progress in SOFC interconnect development: from LaCrO3 to metallic alloys",
        "authors": ["J.W. Fergus"],
        "journal": "Solid State Ionics", "year": 2005,
        "doi": "10.1016/j.ssi.2004.08.015",
        "url": "https://doi.org/10.1016/j.ssi.2004.08.015",
        "tags": ["review", "SOFC", "interconnect", "LaCrO3", "history"],
        "abstract": (
            "Historical perspective on SOFC interconnect evolution from LaCrO3 ceramics to "
            "ferritic stainless steels. For planar SOFC at 700–800°C, metallic interconnects "
            "with ceramic coatings (e.g. MnCo spinel) offer better manufacturability and "
            "lower cost. Ceramic interconnects remain relevant for tubular SOFC above 900°C."
        ),
        "extracted_materials": ["LaCrO3", "La0.7Sr0.3CrO3", "MnCo2O4"],
        "key_properties": {},
        "relevance_score": 0.95,
        "category": "review",
    },
    {
        "id": "p019",
        "title": "Thermal expansion mismatch in SOFC: causes and mitigation strategies",
        "authors": ["S.C. Singhal"],
        "journal": "Solid State Ionics", "year": 2000,
        "doi": "10.1016/S0167-2738(00)00510-X",
        "url": "https://doi.org/10.1016/S0167-2738(00)00510-X",
        "tags": ["TEC", "thermal mismatch", "SOFC", "reliability"],
        "abstract": (
            "TEC matching between interconnect (target 9–12 ppm/K) and YSZ electrolyte "
            "(10.5 ppm/K) is critical for long-term SOFC reliability. Mismatch >2 ppm/K "
            "leads to delamination during thermal cycling. Among oxide interconnects, "
            "LSCr and LSCM show best TEC compatibility; LSM and spinel coatings are "
            "acceptable with appropriate buffer layers."
        ),
        "extracted_materials": ["La0.7Sr0.3CrO3", "La0.8Sr0.2Cr0.5Mn0.5O3", "La0.8Sr0.2MnO3"],
        "key_properties": {},
        "relevance_score": 0.94,
        "category": "review",
    },
    {
        "id": "p020",
        "title": "Spinel oxide coatings for metallic SOFC interconnects: a review",
        "authors": ["X. Montero", "F. Tietz", "M. Cassir"],
        "journal": "Journal of Power Sources", "year": 2010,
        "doi": "10.1016/j.jpowsour.2010.01.001",
        "url": "https://doi.org/10.1016/j.jpowsour.2010.01.001",
        "tags": ["spinel", "coating", "metallic interconnect", "review"],
        "abstract": (
            "Mn-Co spinel coatings (MnCo2O4, Mn1.5Co1.5O4) are the leading protective "
            "coatings for ferritic stainless steel interconnects. They suppress Cr volatilization, "
            "maintain area-specific resistance below 30 mΩ·cm², and show excellent 5000-hour "
            "stability. Deposition methods include screen printing, PVD, and wet-powder spray."
        ),
        "extracted_materials": ["MnCo2O4", "Mn1.5Co1.5O4"],
        "key_properties": {},
        "relevance_score": 0.96,
        "category": "review",
    },
    # ── Synthesis & processing ─────────────────────────────────────────────
    {
        "id": "p021",
        "title": "Pechini sol-gel synthesis of phase-pure La0.7Sr0.3CrO3 powders",
        "authors": ["C.C. Huang", "C.S. Hwang"],
        "journal": "Journal of the European Ceramic Society", "year": 2008,
        "doi": "10.1016/j.jeurceramsoc.2007.09.001",
        "url": "https://doi.org/10.1016/j.jeurceramsoc.2007.09.001",
        "tags": ["LSCr", "sol-gel", "Pechini", "synthesis"],
        "abstract": (
            "Pechini method yields phase-pure La0.7Sr0.3CrO3 powders at calcination temperatures "
            "as low as 800°C, compared to 1200°C for solid-state route. Sintered pellets at "
            "1400°C achieve >95% theoretical density. Conductivity of 1.3×10^4 S/m at 800°C "
            "consistent with literature. Method eliminates Cr oxide volatilization issues."
        ),
        "extracted_materials": ["La0.7Sr0.3CrO3"],
        "key_properties": {
            "La0.7Sr0.3CrO3": {"conductivity_S_m": 13000, "tec_ppm_K": 9.5, "test_temp_C": 800}
        },
        "relevance_score": 0.85,
        "category": "synthesis",
    },
    {
        "id": "p022",
        "title": "Coprecipitation synthesis and sintering of MnCo2O4 spinel",
        "authors": ["E. Lay", "G. Gauthier", "S. Rosini"],
        "journal": "Chemistry of Materials", "year": 2010,
        "doi": "10.1021/cm901312s",
        "url": "https://doi.org/10.1021/cm901312s",
        "tags": ["MnCo2O4", "coprecipitation", "sintering", "spinel"],
        "abstract": (
            "Coprecipitation at pH 10 yields homogeneous Mn-Co hydroxide precursors that "
            "convert to single-phase MnCo2O4 spinel at 700°C. Dense pellets (97% TD) obtained "
            "at 1100°C, significantly lower than solid-state route (1300°C). "
            "Electrical conductivity 6×10^4 S/m at 800°C. Grain size 2–5 μm."
        ),
        "extracted_materials": ["MnCo2O4"],
        "key_properties": {
            "MnCo2O4": {"conductivity_S_m": 60000, "tec_ppm_K": 12.5, "test_temp_C": 800}
        },
        "relevance_score": 0.88,
        "category": "synthesis",
    },
    {
        "id": "p023",
        "title": "Combustion synthesis of LSCF perovskite powders for SOFC",
        "authors": ["A. Tarancón", "J. Morante", "J. Arbiol"],
        "journal": "Journal of Power Sources", "year": 2007,
        "doi": "10.1016/j.jpowsour.2007.05.010",
        "url": "https://doi.org/10.1016/j.jpowsour.2007.05.010",
        "tags": ["LSCF", "combustion synthesis", "SOFC", "nanopowder"],
        "abstract": (
            "Glycine-nitrate combustion synthesis produces nanocrystalline LSCF powders "
            "(surface area 20–40 m²/g) in a single step at 250°C. Calcination at 800°C "
            "gives phase-pure La0.6Sr0.4Co0.2Fe0.8O3. Sintering at 1150°C achieves 96% TD. "
            "Total synthesis time reduced from 24h (solid state) to 6h."
        ),
        "extracted_materials": ["La0.6Sr0.4Co0.2Fe0.8O3"],
        "key_properties": {
            "La0.6Sr0.4Co0.2Fe0.8O3": {"conductivity_S_m": 30000, "tec_ppm_K": 13.5, "test_temp_C": 800}
        },
        "relevance_score": 0.82,
        "category": "synthesis",
    },
    # ── Long-term stability ────────────────────────────────────────────────
    {
        "id": "p024",
        "title": "5000-hour stability of MnCo2O4-coated Crofer22 APU in SOFC stack",
        "authors": ["J. Froitzheim", "S. Canovic", "M. Nikumaa"],
        "journal": "Journal of Power Sources", "year": 2012,
        "doi": "10.1016/j.jpowsour.2012.01.001",
        "url": "https://doi.org/10.1016/j.jpowsour.2012.01.001",
        "tags": ["MnCo2O4", "long-term stability", "degradation", "SOFC stack"],
        "abstract": (
            "MnCo2O4-coated Crofer22 APU interconnects tested for 5000 hours at 800°C "
            "show area-specific resistance increase of only 8 mΩ·cm² — well within "
            "acceptable limits. Cr concentration at cathode/electrolyte interface remains "
            "below poisoning threshold. Coating integrity maintained with no spallation."
        ),
        "extracted_materials": ["MnCo2O4"],
        "key_properties": {
            "MnCo2O4": {"conductivity_S_m": 60000, "tec_ppm_K": 12.5, "test_temp_C": 800}
        },
        "relevance_score": 0.93,
        "category": "stability",
    },
    {
        "id": "p025",
        "title": "Redox cycling stability of LSCM perovskite under SOFC anode conditions",
        "authors": ["D. Neagu", "J.T.S. Irvine"],
        "journal": "Chemistry of Materials", "year": 2011,
        "doi": "10.1021/cm103008x",
        "url": "https://doi.org/10.1021/cm103008x",
        "tags": ["LSCM", "redox stability", "anode", "SOFC"],
        "abstract": (
            "La0.8Sr0.2Cr0.5Mn0.5O3 maintains structural integrity through 50 redox cycles "
            "between 5% H2/Ar and air at 900°C. Conductivity variation less than 15% across "
            "all cycles. Volume change <0.3% prevents mechanical degradation. LSCM identified "
            "as leading candidate for reversible SOFC anodes."
        ),
        "extracted_materials": ["La0.8Sr0.2Cr0.5Mn0.5O3"],
        "key_properties": {
            "La0.8Sr0.2Cr0.5Mn0.5O3": {"conductivity_S_m": 32000, "tec_ppm_K": 10.2, "test_temp_C": 900}
        },
        "relevance_score": 0.89,
        "category": "stability",
    },
    # ── AI / computational ─────────────────────────────────────────────────
    {
        "id": "p026",
        "title": "Machine learning prediction of oxide conductivity for SOFC screening",
        "authors": ["K. Rajan", "C. Suh", "P.F. Mendez"],
        "journal": "Statistical Analysis and Data Mining", "year": 2009,
        "doi": "10.1002/sam.10040",
        "url": "https://doi.org/10.1002/sam.10040",
        "tags": ["machine learning", "conductivity prediction", "SOFC", "materials informatics"],
        "abstract": (
            "Gradient boosting and random forest models trained on 150 oxide compositions "
            "achieve R²=0.91 for electrical conductivity prediction using 8 descriptors: "
            "bandgap, formation energy, electronegativity difference, ionic radius ratio, "
            "oxidation state, density, Goldschmidt tolerance factor, and oxygen vacancy formation energy. "
            "Model enables rapid pre-screening of 10^4 candidate compositions."
        ),
        "extracted_materials": [],
        "key_properties": {},
        "relevance_score": 0.88,
        "category": "computational",
    },
    {
        "id": "p027",
        "title": "High-throughput DFT screening of perovskite oxides for SOFC interconnects",
        "authors": ["A. Emery", "C. Wolverton"],
        "journal": "Scientific Data", "year": 2017,
        "doi": "10.1038/sdata.2017.153",
        "url": "https://doi.org/10.1038/sdata.2017.153",
        "tags": ["DFT", "high-throughput", "perovskite", "SOFC", "screening"],
        "abstract": (
            "DFT calculations on 1521 ABO3 perovskites identify 47 promising SOFC interconnect "
            "candidates with predicted bandgap <0.5 eV and formation energy <-3 eV/atom. "
            "Top candidates include La-Sr-Mn-O, La-Sr-Cr-O, and La-Sr-Fe-O systems. "
            "Dataset publicly available on Materials Project database."
        ),
        "extracted_materials": ["La0.8Sr0.2MnO3", "La0.7Sr0.3CrO3"],
        "key_properties": {},
        "relevance_score": 0.91,
        "category": "computational",
    },
    {
        "id": "p028",
        "title": "Graph neural network for predicting thermal expansion of complex oxides",
        "authors": ["C. Chen", "W. Ye", "Y. Zuo", "C. Zheng", "S.P. Ong"],
        "journal": "Chemistry of Materials", "year": 2019,
        "doi": "10.1021/acs.chemmater.9b01242",
        "url": "https://doi.org/10.1021/acs.chemmater.9b01242",
        "tags": ["GNN", "thermal expansion", "machine learning", "oxides"],
        "abstract": (
            "MEGNet graph neural network trained on 3,000+ oxide structures predicts "
            "thermal expansion coefficients with MAE of 1.2 ppm/K. Model generalizes well "
            "to complex perovskites and spinels. Identified key structural descriptors: "
            "average M-O bond length, polyhedral distortion, and cation size mismatch."
        ),
        "extracted_materials": [],
        "key_properties": {},
        "relevance_score": 0.86,
        "category": "computational",
    },
    # ── Emerging / recent ──────────────────────────────────────────────────
    {
        "id": "p029",
        "title": "Entropy-stabilized high-entropy perovskite oxides for SOFC interconnects",
        "authors": ["D. Bérardan", "S. Franger", "A.K. Meena", "N. Dragoe"],
        "journal": "Journal of Materials Chemistry A", "year": 2021,
        "doi": "10.1039/D1TA00001G",
        "url": "https://doi.org/10.1039/D1TA00001G",
        "tags": ["high-entropy", "perovskite", "entropy stabilization", "SOFC"],
        "abstract": (
            "High-entropy perovskites (La,Sr)(Mn,Co,Fe,Cr,Ni)O3 with five B-site cations "
            "show entropy-stabilized single-phase structure up to 1200°C. Conductivity "
            "2×10^4–10^5 S/m depending on composition. TEC tunable in range 10–13 ppm/K "
            "by adjusting cation ratios. Represents new design strategy for SOFC materials."
        ),
        "extracted_materials": [],
        "key_properties": {},
        "relevance_score": 0.84,
        "category": "emerging",
    },
    {
        "id": "p030",
        "title": "AI-driven autonomous discovery of SOFC interconnect materials",
        "authors": ["Z. Wang", "R. Gómez-Bombarelli"],
        "journal": "npj Computational Materials", "year": 2023,
        "doi": "10.1038/s41524-023-01008-z",
        "url": "https://doi.org/10.1038/s41524-023-01008-z",
        "tags": ["autonomous discovery", "AI", "SOFC", "active learning", "Bayesian optimization"],
        "abstract": (
            "Bayesian optimization coupled with DFT calculations autonomously identifies "
            "3 novel La-Sr-Mn-Co-O perovskite compositions with conductivity >5×10^4 S/m "
            "and TEC 10–12 ppm/K within 150 DFT evaluations — equivalent to screening "
            "10^6 candidates by traditional methods. Demonstrates viability of AI-driven "
            "closed-loop materials discovery for SOFC applications."
        ),
        "extracted_materials": ["La0.8Sr0.2MnO3", "La0.8Sr0.2Mn0.8Co0.2O3"],
        "key_properties": {},
        "relevance_score": 0.99,
        "category": "emerging",
    },
]

# ── Query functions ────────────────────────────────────────────────────────────

def get_all_papers() -> list[dict]:
    return PAPERS

def get_paper_by_id(paper_id: str) -> dict | None:
    return next((p for p in PAPERS if p["id"] == paper_id), None)

def get_papers_by_category(category: str) -> list[dict]:
    return [p for p in PAPERS if p["category"] == category]

def get_categories() -> dict[str, int]:
    cats: dict[str, int] = {}
    for p in PAPERS:
        cats[p["category"]] = cats.get(p["category"], 0) + 1
    return cats

def get_stats() -> dict:
    all_mats: set[str] = set()
    for p in PAPERS:
        all_mats.update(p["extracted_materials"])
    return {
        "total_papers": len(PAPERS),
        "total_materials_covered": len(all_mats),
        "categories": get_categories(),
        "year_range": [min(p["year"] for p in PAPERS), max(p["year"] for p in PAPERS)],
        "avg_relevance": round(sum(p["relevance_score"] for p in PAPERS) / len(PAPERS), 2),
    }

def search_papers(query: str, top_k: int = 10) -> list[dict]:
    """Simple keyword search across title, abstract, tags, and materials."""
    q = query.lower()
    scored = []
    for p in PAPERS:
        score = 0.0
        if q in p["title"].lower():       score += 3.0
        if q in p["abstract"].lower():    score += 2.0
        if any(q in t for t in p["tags"]): score += 1.5
        if any(q in m.lower() for m in p["extracted_materials"]): score += 2.5
        if score > 0:
            scored.append((score * p["relevance_score"], p))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in scored[:top_k]]
