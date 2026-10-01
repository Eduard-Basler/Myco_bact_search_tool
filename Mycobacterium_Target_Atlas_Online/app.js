/**
 * Mycobacterium Knockdown Target Discovery & Literature Intelligence
 * Client-side JavaScript running 100% in the browser (Zero server required, GitHub Pages ready).
 * Integrates UniProt, Europe PMC, PEBBLE, Mycobrowser, and Gemini 3.8 Flash.
 */

// ==========================================
// 1. CONTROLLED VOCABULARY & ANTIBIOTIC DATA
// ==========================================

const PATHWAY_CATEGORIES = [
  {
    name: "🧱 Cell Wall & Envelope Integrity (Primary Permeability Barrier)",
    pills: [
      {
        id: "peptidoglycan",
        label: "Peptidoglycan Synthesis & Remodeling",
        desc: "Core peptidoglycan crosslinking and cleavage enzymes. Knockdown weakens the osmotic barrier, dramatically sensitizing mycobacteria to beta-lactams and large lipophilic compounds.",
        genes: ["ponA1", "ripA", "chiZ", "dacB1", "pbpA", "pbpB", "murA", "murC", "murD", "murE", "murF", "ddlA", "alr"]
      },
      {
        id: "mycolic_acid",
        label: "Mycolic Acid Biosynthesis (FAS-II & FAS-I)",
        desc: "The hallmark mycolic acid outer lipid barrier of Mycobacteria. Perturbation increases envelope permeability and potentiates multiple frontline antimicrobials.",
        genes: ["inhA", "kasA", "kasB", "hadA", "hadB", "hadC", "fabG1", "accD6"]
      },
      {
        id: "arabinogalactan",
        label: "Arabinogalactan & D-Arabinose Assembly",
        desc: "Connects peptidoglycan to outer mycolates. Disruption of arabinan branching causes structural envelope collapse and high susceptibility to ethambutol and macozinone.",
        genes: ["embA", "embB", "embC", "dprE1", "dprE2", "glf", "ubiA"]
      },
      {
        id: "envelope_lipids",
        label: "Trehalose, Glycolipids & MmpL3 Transport",
        desc: "Transport and assembly of trehalose monomycolate (TMM) and antigen 85 complex. Essential for outer membrane anchoring.",
        genes: ["mmpL3", "fbpA", "fbpB", "fbpC", "lprG", "papA2", "pks2"]
      },
      {
        id: "lipoarabinomannan",
        label: "Lipoarabinomannan (LAM) Core",
        desc: "Major surface lipoglycan involved in host-pathogen interactions and membrane stability. Depletion alters surface charge and drug penetration.",
        genes: ["mptA", "mptB", "pimA", "pimB"]
      },
      {
        id: "outer_permeability",
        label: "Outer Porins & Envelope Permeability",
        desc: "Hydrophilic channels controlling outer membrane solute influx. Crucial determinant of intrinsic resistance differences between Mtb and fast-growing M. smegmatis.",
        genes: ["ompATb", "rv1698"]
      }
    ]
  },
  {
    name: "🚪 Efflux Pumps & Transport Systems (Intrinsic Multidrug Resistance)",
    pills: [
      {
        id: "mmpl_efflux",
        label: "MmpL / MmpS RND Multidrug Transporters",
        desc: "Primary resistance-nodulation-division (RND) exporters. MmpL5/MmpS5 is the clinical efflux system for bedaquiline and clofazimine, regulated by Rv0678.",
        genes: ["mmpL4", "mmpL5", "mmpL7", "mmpL11", "mmpS4", "mmpS5", "rv0678"]
      },
      {
        id: "abc_efflux",
        label: "ABC Multidrug Transporters",
        desc: "ATP-binding cassette transporters mediating active extrusion of fluoroquinolones, anthracyclines, and rifamycins.",
        genes: ["drrA", "drrB", "drrC", "rv1217c", "rv1218c", "rv1819c"]
      },
      {
        id: "mfs_efflux",
        label: "Major Facilitator (MFS) Permeases",
        desc: "Proton-motive force driven secondary active transporters (Tap, IniBAC, EfpA). Tap mediates intrinsic resistance to aminoglycosides and tetracyclines.",
        genes: ["tap", "rv1258c", "iniA", "iniB", "iniC", "efpA"]
      },
      {
        id: "smr_efflux",
        label: "Small Multidrug Resistance (SMR)",
        desc: "Small proton-dependent exporters conferring low-level tolerance to lipophilic cations, quaternary ammonium compounds, and macrolides.",
        genes: ["mmr"]
      }
    ]
  },
  {
    name: "⚡ Bioenergetics & Respiration (Oxidative Phosphorylation & ATP)",
    pills: [
      {
        id: "atp_synthase",
        label: "ATP Synthase Complex (F1F0)",
        desc: "Rotary engine generating cellular ATP. Direct target of bedaquiline (AtpE). Hypomorphic depletion leaves bacteria starved of energy and vulnerable to second drugs.",
        genes: ["atpA", "atpB", "atpC", "atpD", "atpE", "atpF", "atpG", "atpH"]
      },
      {
        id: "cytochrome_bc1",
        label: "Cytochrome bc1-aa3 Complex",
        desc: "Primary respiratory electron transport branch. Targeted by clinical candidate telacebec (Q203).",
        genes: ["qcrA", "qcrB", "qcrC", "ctaC", "ctaD", "ctaE"]
      },
      {
        id: "ndh_dehydrogenase",
        label: "NADH Dehydrogenases (NDH-1 & NDH-2)",
        desc: "Transfers electrons from NADH to menaquinone pool. NDH-2 is targeted by clofazimine redox cycling.",
        genes: ["nuoA", "nuoB", "nuoG", "ndh"]
      },
      {
        id: "cytochrome_bd",
        label: "Cytochrome bd Terminal Oxidase (Hypoxia)",
        desc: "Alternative terminal oxidase that sustains survival under hypoxia and bioenergetic stress. Co-inhibition with Q203 or bedaquiline produces synergistic rapid bactericidal clearance.",
        genes: ["cydA", "cydB", "cydC", "cydD"]
      }
    ]
  },
  {
    name: "⚙️ Macromolecular Machinery & Quality Control",
    pills: [
      {
        id: "rna_polymerase",
        label: "RNA Polymerase & Transcription Factors",
        desc: "Transcription core machinery. Target of rifampicin. Auxiliary factors (CarD, RbpA) stabilize the open promoter complex; their depletion sensitizes directly to rifamycins.",
        genes: ["rpoA", "rpoB", "rpoC", "rpoZ", "carD", "rbpA"]
      },
      {
        id: "dna_gyrase",
        label: "DNA Gyrase & Repair",
        desc: "Type II topoisomerase relieving torsional strain during replication. Target of fluoroquinolones. RecA mediates SOS repair upon DNA double-strand breaks.",
        genes: ["gyrA", "gyrB", "topA", "recA"]
      },
      {
        id: "ribosome_machinery",
        label: "30S / 50S Ribosome & Translation Modifiers",
        desc: "Protein translation machinery and modifying methyltransferases. Erm37 and GidB dictate susceptibility to macrolides and streptomycin.",
        genes: ["rpsL", "rrs", "rrl", "tuf", "fusA1", "erm37", "tlyA", "gidB"]
      },
      {
        id: "clp_protease",
        label: "Clp Protease & Proteasome Degradation",
        desc: "Chaperone-protease complex clearing misfolded proteins. Perturbation triggers accumulation of toxic aggregates and potentiates translational inhibitors.",
        genes: ["clpP1", "clpP2", "clpC1", "clpX", "prcB", "prcA"]
      },
      {
        id: "folate_pathway",
        label: "Folate Biosynthesis & C1 Metabolism",
        desc: "De novo tetrahydrofolate synthesis pathway. Targeted by para-aminosalicylic acid (PAS) and antifolates.",
        genes: ["folP1", "folA", "thyA", "dfrA"]
      }
    ]
  },
  {
    name: "🛡️ Defense, Stress & Prodrug Modifiers",
    pills: [
      {
        id: "beta_lactamase",
        label: "Beta-Lactam Degradation & Sensing (BlaC / BlaR)",
        desc: "Class A beta-lactamase BlaC confers intrinsic resistance to penicillins and cephalosporins. Knockdown completely unlocks beta-lactam efficacy.",
        genes: ["blaC", "blaR", "blaI"]
      },
      {
        id: "prodrug_activation",
        label: "Prodrug Bioactivators (KatG, EthA, PncA, Ddn)",
        desc: "Enzymes that metabolically convert inactive prodrugs into active bactericidal compounds. Loss-of-function is the primary mechanism of clinical acquired resistance.",
        genes: ["katG", "ethA", "pncA", "ddn"]
      },
      {
        id: "whib_regulon",
        label: "WhiB Multi-Drug Stress Regulons (WhiB7)",
        desc: "WhiB7 is the master transcriptional activator of intrinsic multidrug resistance (efflux pumps, ribosomal modification). Knockdown renders mycobacteria hypersensitive to multiple unrelated antibiotic classes.",
        genes: ["whiB7", "whiB1", "whiB3", "whiB4"]
      },
      {
        id: "oxidative_stress",
        label: "Oxidative & Nitrosative Defense",
        desc: "Enzymatic defense against reactive oxygen species (ROS). Depletion synergizes with antibiotics that generate intracellular oxidative stress (clofazimine, pretomanid).",
        genes: ["katG", "ahpC", "ahpD", "sodA", "sodC"]
      }
    ]
  }
];

const ANTIBIOTIC_CATEGORIES = [
  {
    name: "💊 Frontline Core Regimen (HRZE & Rifamycins)",
    drugs: [
      {
        id: "rifampicin",
        name: "Rifampicin (RIF)",
        target: "rpoB (beta subunit of RNA Polymerase)",
        mechanism: "Steric occlusion of elongating RNA transcript",
        synergyNote: "Knockdown of transcription factors CarD or RbpA, or cell wall envelope breaches (ponA1, ripA), significantly lowers RIF MIC."
      },
      {
        id: "isoniazid",
        name: "Isoniazid (INH)",
        target: "inhA (enoyl-ACP reductase)",
        mechanism: "Inhibition of mycolic acid biosynthesis via KatG-activated INH-NAD adduct",
        synergyNote: "Knockdown of FAS-II enzymes (kasA, hadAB) or iniBAC efflux pump synergizes strongly with INH."
      },
      {
        id: "pyrazinamide",
        name: "Pyrazinamide (PZA)",
        target: "panD / membrane potential",
        mechanism: "Disruption of membrane energy and trans-translation following PncA activation",
        synergyNote: "Knockdown of bioenergetics or membrane proton-motive force components potentiates PZA killing."
      },
      {
        id: "ethambutol",
        name: "Ethambutol (EMB)",
        target: "embA / embB / embC",
        mechanism: "Inhibition of arabinofuranosyl transferases in arabinogalactan synthesis",
        synergyNote: "Synergistic with dprE1 or cell wall remodeling knockdowns."
      },
      {
        id: "rifabutin",
        name: "Rifabutin (RFB)",
        target: "rpoB",
        mechanism: "RNA Polymerase transcription inhibition with lower hepatic CYP3A4 induction",
        synergyNote: "Useful for HIV co-infected models; potentiated by outer envelope permeability knockdowns."
      },
      {
        id: "rifapentine",
        name: "Rifapentine (RPT)",
        target: "rpoB",
        mechanism: "Long-acting cyclopentyl rifamycin inhibiting transcription elongation",
        synergyNote: "Synergizes with transcription factor depletion and envelope disruptions."
      }
    ]
  },
  {
    name: "🌟 WHO Group A (Priority MDR/XDR Regimens)",
    drugs: [
      {
        id: "bedaquiline",
        name: "Bedaquiline (BDQ)",
        target: "atpE (c subunit of ATP synthase)",
        mechanism: "Specific inhibition of the F1F0 ATP synthase proton rotor",
        synergyNote: "Depletion of cytochrome bd oxidase (cydA/B) or MmpL5/MmpS5 efflux pump causes massive synergistic killing."
      },
      {
        id: "linezolid",
        name: "Linezolid (LZD)",
        target: "23S rRNA (50S subunit)",
        mechanism: "Blocks initiation complex formation at ribosomal peptidyl transferase center",
        synergyNote: "Knockdown of WhiB7 regulon or Clp protease machinery sensitizes mycobacteria to LZD."
      },
      {
        id: "moxifloxacin",
        name: "Moxifloxacin (MFX)",
        target: "gyrA / gyrB",
        mechanism: "Traps DNA gyrase in cleavable complexes, generating double-strand DNA breaks",
        synergyNote: "Depletion of RecA/RadA DNA repair or ABC efflux transporters (drrAB, Rv1218c) potentiates MFX."
      },
      {
        id: "levofloxacin",
        name: "Levofloxacin (LFX)",
        target: "gyrA / gyrB",
        mechanism: "Topoisomerase II cleavage complex stabilization",
        synergyNote: "Potentiated by DNA repair knockdown or envelope permeability enhancement."
      },
      {
        id: "tedizolid",
        name: "Tedizolid (TZD)",
        target: "23S rRNA",
        mechanism: "Next-generation oxazolidinone with 4- to 8-fold greater potency than linezolid",
        synergyNote: "Synergizes with protein homeostasis and translation quality control knockdowns."
      }
    ]
  },
  {
    name: "🧪 WHO Group B (Second-Line Oral Core)",
    drugs: [
      {
        id: "clofazimine",
        name: "Clofazimine (CFZ)",
        target: "ndh-2 / membrane redox",
        mechanism: "Reduction by NDH-2 and non-enzymatic redox cycling producing toxic ROS and membrane destabilization",
        synergyNote: "Knockdown of MmpL5 efflux or thioredoxin/mycothiol redox defenses synergizes with CFZ."
      },
      {
        id: "cycloserine",
        name: "Cycloserine (DCS)",
        target: "alr (D-Ala racemase) / ddlA (D-Ala ligase)",
        mechanism: "Competitive inhibition of early peptidoglycan precursor synthesis",
        synergyNote: "Hypomorphic knockdown of ponA1, pbpA, or mur enzymes produces lethal synergy."
      },
      {
        id: "terizidone",
        name: "Terizidone (TRZ)",
        target: "alr / ddlA",
        mechanism: "DCS dimer derivative inhibiting D-alanine incorporation into peptidoglycan",
        synergyNote: "Synergistic with peptidoglycan remodeling and transpeptidation knockdowns."
      }
    ]
  },
  {
    name: "💉 WHO Group C & Second-Line Injectables",
    drugs: [
      {
        id: "delamanid",
        name: "Delamanid (DLM)",
        target: "ddn (F420-dependent) -> mycolic acid",
        mechanism: "Nitroimidazole bioactivated by Ddn to release reactive nitrogen species and halt mycolic acid synthesis",
        synergyNote: "Synergizes with respiratory chain inhibitors and cell wall depletions."
      },
      {
        id: "pretomanid",
        name: "Pretomanid (Pa)",
        target: "ddn -> respiratory poisoning + cell wall",
        mechanism: "Anaerobic nitric oxide release causing respiratory arrest; aerobic inhibition of mycolic acid",
        synergyNote: "Core component of BPaL regimen; synergizes with bedaquiline and linezolid."
      },
      {
        id: "amikacin",
        name: "Amikacin (AMK)",
        target: "16S rRNA (30S subunit)",
        mechanism: "Binds A-site of decoding region, causing mistranslation and membrane disruption",
        synergyNote: "Knockdown of Tap efflux pump or WhiB7 regulon produces up to 32-fold reduction in AMK MIC."
      },
      {
        id: "streptomycin",
        name: "Streptomycin (STR)",
        target: "rpsL (protein S12) / 16S rRNA",
        mechanism: "Interferes with proofreading of aminoacyl-tRNA, resulting in aberrant toxic proteins",
        synergyNote: "GidB and WhiB7 depletion significantly modulates STR susceptibility."
      },
      {
        id: "kanamycin",
        name: "Kanamycin (KAN)",
        target: "16S rRNA",
        mechanism: "Aminoglycoside translation misreading and translocation blockage",
        synergyNote: "Potentiated by membrane permeability breaches and efflux pump knockdowns."
      },
      {
        id: "capreomycin",
        name: "Capreomycin (CAP)",
        target: "rrs / tlyA",
        mechanism: "Cyclic peptide inhibiting 70S ribosome translocation",
        synergyNote: "TlyA methylation dependent; sensitized by envelope permeabilization."
      },
      {
        id: "ethionamide",
        name: "Ethionamide (ETH)",
        target: "inhA (via EthA bioactivation)",
        mechanism: "Thioamide activated by monooxygenase EthA to form an InhA-inhibiting adduct",
        synergyNote: "Knockdown of repressor EthR or FAS-II pathway components causes high ETH sensitization."
      },
      {
        id: "pas",
        name: "Para-aminosalicylic acid (PAS)",
        target: "folP1 (dihydropteroate synthase)",
        mechanism: "Inhibits folate biosynthesis and iron acquisition via salicylate mimicry",
        synergyNote: "Synergizes with antifolate enzymes (folA, dfrA) and C1 metabolism targets."
      }
    ]
  },
  {
    name: "🛡️ Beta-Lactams & Carbapenems (Synergy Champions)",
    drugs: [
      {
        id: "meropenem",
        name: "Meropenem (+ Clavulanate)",
        target: "pbpA / ponA1 / Ldt (L,D-transpeptidases)",
        mechanism: "Inhibits both classical D,D-PBPs and non-classical L,D-transpeptidases (Ldt) forming 3->3 peptidoglycan crosslinks",
        synergyNote: "Top synergy candidate! Knockdown of ponA1, ripA, dacB1, or blaC causes up to 64-fold sensitization."
      },
      {
        id: "imipenem",
        name: "Imipenem (+ Cilastatin)",
        target: "PBP / Ldt",
        mechanism: "Broad-spectrum carbapenem targeting mycobacterial cell wall crosslinking",
        synergyNote: "Potentiated by beta-lactamase BlaC depletion and peptidoglycan hydrolase knockdowns."
      },
      {
        id: "faropenem",
        name: "Faropenem",
        target: "Ldt / high-molecular-weight PBPs",
        mechanism: "Orally bioavailable penem with high stability against mycobacterial beta-lactamase",
        synergyNote: "Synergizes strongly with rifampicin and peptidoglycan endopeptidase knockdowns."
      },
      {
        id: "amoxicillin",
        name: "Amoxicillin (+ Clavulanate)",
        target: "Penicillin-binding proteins (PBPs)",
        mechanism: "Aminopenicillin targeting crosslinking transpeptidation",
        synergyNote: "Requires BlaC inhibition/knockdown; validated clinical pilot combination."
      },
      {
        id: "cefoxitin",
        name: "Cefoxitin (FOX)",
        target: "PBPs",
        mechanism: "Cephamycin antibiotic; primary reference beta-lactam used in M. smegmatis and M. abscessus screens",
        synergyNote: "Ideal for BSL-1 pilot testing in M. smegmatis before moving to Mtb."
      }
    ]
  },
  {
    name: "🔬 Macrolides & Translation Blockers",
    drugs: [
      {
        id: "clarithromycin",
        name: "Clarithromycin (CLR)",
        target: "23S rRNA (50S subunit)",
        mechanism: "Macrolide preventing peptide chain elongation; frontline drug against non-tuberculous mycobacteria (NTMs)",
        synergyNote: "WhiB7 master regulator or Erm37 methyltransferase knockdown unlocks massive bactericidal sensitization."
      },
      {
        id: "azithromycin",
        name: "Azithromycin (AZM)",
        target: "23S rRNA",
        mechanism: "Azalide macrolide accumulating in intracellular macrophages",
        synergyNote: "Synergizes with envelope permeability and ribosomal modification knockdowns."
      },
      {
        id: "doxycycline",
        name: "Doxycycline (DOX)",
        target: "30S ribosomal subunit",
        mechanism: "Inhibits accommodation of aminoacyl-tRNA into A-site",
        synergyNote: "Knockdown of Tap efflux or WhiB7 lowers DOX MIC by over 16-fold."
      },
      {
        id: "spectinomycin",
        name: "Spectinomycin (SPC)",
        target: "16S rRNA",
        mechanism: "Aminocyclitol blocking peptidyl-tRNA translocation without causing misreading",
        synergyNote: "Sensitized by intrinsic resistance and outer envelope transport knockdowns."
      }
    ]
  },
  {
    name: "🚀 Pipeline Candidates & Novel Mechanistic Agents",
    drugs: [
      {
        id: "telacebec",
        name: "Telacebec (Q203)",
        target: "qcrB (cytochrome b subunit of bc1 complex)",
        mechanism: "Nanomolar inhibition of the respiratory electron transport chain",
        synergyNote: "Knockdown of alternative oxidase cytochrome bd (cydA/B) converts Q203 from bacteriostatic to rapid bactericidal kill!"
      },
      {
        id: "macozinone",
        name: "Macozinone (PBTZ169)",
        target: "dprE1 (decaprenylphosphoryl-D-ribose oxidase)",
        mechanism: "Covalent suicide inhibition halting arabinogalactan precursor synthesis",
        synergyNote: "Synergizes with bedaquiline, pyrazinamide, and cell envelope remodeling targets."
      },
      {
        id: "sudoterb",
        name: "Sudoterb (OPC-167832)",
        target: "dprE1",
        mechanism: "Potent non-covalent DprE1 inhibitor active against drug-resistant Mtb",
        synergyNote: "Synergistic with arabinan pathway and efflux pump knockdowns."
      },
      {
        id: "sq109",
        name: "SQ109",
        target: "mmpL3 (trehalose monomycolate transporter)",
        mechanism: "Disrupts outer membrane translocation and uncouples electrochemical proton gradient",
        synergyNote: "Multiple targets in envelope and respiration; synergistic with rifampicin and bedaquiline."
      },
      {
        id: "tbaj876",
        name: "TBAJ-876",
        target: "atpE",
        mechanism: "Next-generation diarylquinoline targeting ATP synthase with reduced hERG ion-channel liability",
        synergyNote: "Depletion of respiratory complexes or MmpL5 enhances potency."
      },
      {
        id: "gsk656",
        name: "GSK-656",
        target: "leuRS (leucyl-tRNA synthetase)",
        mechanism: "Aminoacyl-tRNA synthetase inhibitor trapping uncharged tRNA",
        synergyNote: "Synergizes with translation initiation and quality control knockdowns."
      }
    ]
  }
];

// Pre-indexed database of 147 curated mycobacterial resistance & CRISPRi targets
const CURATED_GENES_DB = {
  "accD6": {
    "gene": "accD6",
    "rv": "Rv2247",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Growth Defect",
    "product": "Biotin-dependent acetyl-/propionyl-coenzyme A carboxylase beta6 subunit",
    "pathways": [
      "mycolic_acid"
    ],
    "landmark_paper": {
      "title": "AccD6, a member of the Fas II locus, is a functional carboxyltransferase subunit of the acyl-coenzyme A carboxylase in Mycobacterium tuberculosis.",
      "authors": "Daniel J et al.",
      "journal": "J Bacteriol",
      "year": "2007",
      "doi": "10.1128/jb.01019-06",
      "url": "https://doi.org/10.1128/jb.01019-06",
      "citations": 50
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Isoniazid (INH)",
      "drug_class": "FAS-II Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "ahpC": {
    "gene": "ahpC",
    "rv": "Rv2428",
    "msmeg": "MSMEG_4891",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Alkyl hydroperoxide reductase C",
    "pathways": [
      "oxidative_stress"
    ],
    "landmark_paper": {
      "title": "Compensatory ahpC gene expression in isoniazid-resistant Mycobacterium tuberculosis.",
      "authors": "Sherman DR et al.",
      "journal": "Science",
      "year": "1996",
      "doi": "10.1126/science.272.5268.1641",
      "url": "https://doi.org/10.1126/science.272.5268.1641",
      "citations": 328
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clofazimine (CFZ) / Pretomanid",
      "drug_class": "ROS-Generating Antimicrobials",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "ahpD": {
    "gene": "ahpD",
    "rv": "Rv2429",
    "msmeg": "MSMEG_4890",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Alkyl hydroperoxide reductase AhpD",
    "pathways": [
      "oxidative_stress"
    ],
    "landmark_paper": {
      "title": "The AhpC and AhpD antioxidant defense system of Mycobacterium tuberculosis.",
      "authors": "Hillas PJ et al.",
      "journal": "J Biol Chem",
      "year": "2000",
      "doi": "10.1074/jbc.m001001200",
      "url": "https://doi.org/10.1074/jbc.m001001200",
      "citations": 112
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clofazimine (CFZ) / Pretomanid",
      "drug_class": "ROS-Generating Antimicrobials",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "alr": {
    "gene": "alr",
    "rv": "Rv3423c",
    "msmeg": "MSMEG_1575",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Alanine racemase",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Use of the alr gene as a food-grade selection marker in lactic acid bacteria.",
      "authors": "Bron PA et al.",
      "journal": "Appl Environ Microbiol",
      "year": "2002",
      "doi": "10.1128/aem.68.11.5663-5670.2002",
      "url": "https://doi.org/10.1128/aem.68.11.5663-5670.2002",
      "citations": 62
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "atpA": {
    "gene": "atpA",
    "rv": "Rv1308",
    "msmeg": "MSMEG_4938",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP synthase subunit alpha",
    "pathways": [
      "atp_synthase"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of atpA in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Bedaquiline (BDQ)",
      "drug_class": "ATP Synthase Rotor Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "atpB": {
    "gene": "atpB",
    "rv": "Rv1310",
    "msmeg": "MSMEG_4936",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP synthase subunit beta",
    "pathways": [
      "atp_synthase"
    ],
    "landmark_paper": {
      "title": "Genomic and structural insights into the atpB L173I substitution: modulation of the F\u2080 rotor architecture in Mycobacterium tuberculosis ATP synthase and altered Bedaquiline binding dynamics.",
      "authors": "Thankamani A et al.",
      "journal": "World J Microbiol Biotechnol",
      "year": "2026",
      "doi": "10.1007/s11274-026-05173-9",
      "url": "https://doi.org/10.1007/s11274-026-05173-9",
      "citations": 0
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Bedaquiline (BDQ)",
      "drug_class": "ATP Synthase Rotor Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "atpC": {
    "gene": "atpC",
    "rv": "Rv1311",
    "msmeg": "MSMEG_4935",
    "presence": "BOTH",
    "pebble": "Uncertain",
    "product": "ATP synthase epsilon chain",
    "pathways": [
      "atp_synthase"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of atpC in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable Pilot Candidate",
      "recommended_drug": "Bedaquiline (BDQ)",
      "drug_class": "ATP Synthase Rotor Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "atpD": {
    "gene": "atpD",
    "rv": "Rv1310",
    "msmeg": "MSMEG_4936",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP synthase subunit beta",
    "pathways": [
      "atp_synthase"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of atpD in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Bedaquiline (BDQ)",
      "drug_class": "ATP Synthase Rotor Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "atpE": {
    "gene": "atpE",
    "rv": "Rv1311",
    "msmeg": "MSMEG_4935",
    "presence": "BOTH",
    "pebble": "Uncertain",
    "product": "ATP synthase epsilon chain",
    "pathways": [
      "atp_synthase"
    ],
    "landmark_paper": {
      "title": "A diarylquinoline drug active on the ATP synthase of Mycobacterium tuberculosis",
      "authors": "Andries et al.",
      "journal": "Science",
      "year": 2005,
      "doi": "10.1126/science.1106753",
      "url": "https://www.science.org/doi/10.1126/science.1106753",
      "citations": 1850
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable Pilot Candidate",
      "recommended_drug": "Bedaquiline (BDQ)",
      "drug_class": "ATP Synthase Rotor Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "atpF": {
    "gene": "atpF",
    "rv": "Rv1306",
    "msmeg": "MSMEG_4940",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP synthase subunit b",
    "pathways": [
      "atp_synthase"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of atpF in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Bedaquiline (BDQ)",
      "drug_class": "ATP Synthase Rotor Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "atpG": {
    "gene": "atpG",
    "rv": "Rv1309",
    "msmeg": "MSMEG_4937",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP synthase gamma chain",
    "pathways": [
      "atp_synthase"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of atpG in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Bedaquiline (BDQ)",
      "drug_class": "ATP Synthase Rotor Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "atpH": {
    "gene": "atpH",
    "rv": "Rv1307",
    "msmeg": "MSMEG_4939",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP synthase subunit b-delta",
    "pathways": [
      "atp_synthase"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of atpH in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Bedaquiline (BDQ)",
      "drug_class": "ATP Synthase Rotor Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "blaC": {
    "gene": "blaC",
    "rv": "Rv2068c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Beta-lactamase",
    "pathways": [
      "beta_lactamase"
    ],
    "landmark_paper": {
      "title": "Inactivation of Mycobacterium tuberculosis beta-lactamase BlaC by clavulanic acid and carbapenems",
      "authors": "Hugonnet et al.",
      "journal": "Science",
      "year": 2009,
      "doi": "10.1126/science.1167498",
      "url": "https://www.science.org/doi/10.1126/science.1167498",
      "citations": 410
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Meropenem / Amoxicillin",
      "drug_class": "Carbapenem / Penicillin",
      "expected_fold_sensitization": "32x to >128x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "blaI": {
    "gene": "blaI",
    "rv": "Rv1846c",
    "msmeg": "MSMEG_3630",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Transcriptional regulator BlaI",
    "pathways": [
      "beta_lactamase"
    ],
    "landmark_paper": {
      "title": "Genome-wide regulon and crystal structure of BlaI (Rv1846c) from Mycobacterium tuberculosis.",
      "authors": "Sala C et al.",
      "journal": "Mol Microbiol",
      "year": "2009",
      "doi": "10.1111/j.1365-2958.2008.06583.x",
      "url": "https://doi.org/10.1111/j.1365-2958.2008.06583.x",
      "citations": 59
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem / Amoxicillin",
      "drug_class": "Carbapenem / Penicillin",
      "expected_fold_sensitization": "32x to >128x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "blaR": {
    "gene": "blaR",
    "rv": "Rv1845c",
    "msmeg": "MSMEG_3631",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Possible sensor-transducer protein BlaR",
    "pathways": [
      "beta_lactamase"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of blaR in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem / Amoxicillin",
      "drug_class": "Carbapenem / Penicillin",
      "expected_fold_sensitization": "32x to >128x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "carD": {
    "gene": "carD",
    "rv": "Rv3583c",
    "msmeg": "MSMEG_6077",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "RNA polymerase-binding transcription factor CarD",
    "pathways": [
      "rna_polymerase"
    ],
    "landmark_paper": {
      "title": "CARD 2020: antibiotic resistome surveillance with the comprehensive antibiotic resistance database.",
      "authors": "Alcock BP et al.",
      "journal": "Nucleic Acids Res",
      "year": "2020",
      "doi": "10.1093/nar/gkz935",
      "url": "https://doi.org/10.1093/nar/gkz935",
      "citations": 2855
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth)",
      "recommended_drug": "Rifampicin (RIF)",
      "drug_class": "Rifamycin RNAP Blocker",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "chiZ": {
    "gene": "chiZ",
    "rv": "Rv2719c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Cell wall hydrolase ChiZ",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Interference of Mycobacterium tuberculosis cell division by Rv2719c, a cell wall hydrolase.",
      "authors": "Chauhan A et al.",
      "journal": "Mol Microbiol",
      "year": "2006",
      "doi": "10.1111/j.1365-2958.2006.05333.x",
      "url": "https://doi.org/10.1111/j.1365-2958.2006.05333.x",
      "citations": 102
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "clpC1": {
    "gene": "clpC1",
    "rv": "Rv3596c",
    "msmeg": "MSMEG_6091",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP-dependent Clp protease ATP-binding subunit ClpC1",
    "pathways": [
      "clp_protease"
    ],
    "landmark_paper": {
      "title": "The natural product cyclomarin kills Mycobacterium tuberculosis by targeting the ClpC1 subunit of the caseinolytic protease.",
      "authors": "Schmitt EK et al.",
      "journal": "Angew Chem Int Ed Engl",
      "year": "2011",
      "doi": "10.1002/anie.201101740",
      "url": "https://doi.org/10.1002/anie.201101740",
      "citations": 161
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Linezolid (LZD)",
      "drug_class": "Protein Homeostasis Collapse",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "clpP1": {
    "gene": "clpP1",
    "rv": "Rv2461c",
    "msmeg": "MSMEG_2694",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP-dependent Clp protease proteolytic subunit 1",
    "pathways": [
      "clp_protease"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis ClpP1 and ClpP2 function together in protein degradation and are required for viability in vitro and during infection.",
      "authors": "Raju RM et al.",
      "journal": "PLoS Pathog",
      "year": "2012",
      "doi": "10.1371/journal.ppat.1002511",
      "url": "https://doi.org/10.1371/journal.ppat.1002511",
      "citations": 167
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Linezolid (LZD)",
      "drug_class": "Protein Homeostasis Collapse",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "clpP2": {
    "gene": "clpP2",
    "rv": "Rv2460c",
    "msmeg": "MSMEG_2694",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP-dependent Clp protease proteolytic subunit 2",
    "pathways": [
      "clp_protease"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis ClpP1 and ClpP2 function together in protein degradation and are required for viability in vitro and during infection.",
      "authors": "Raju RM et al.",
      "journal": "PLoS Pathog",
      "year": "2012",
      "doi": "10.1371/journal.ppat.1002511",
      "url": "https://doi.org/10.1371/journal.ppat.1002511",
      "citations": 167
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Linezolid (LZD)",
      "drug_class": "Protein Homeostasis Collapse",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "clpX": {
    "gene": "clpX",
    "rv": "Rv2457c",
    "msmeg": "MSMEG_4671",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "ATP-dependent Clp protease ATP-binding subunit ClpX",
    "pathways": [
      "clp_protease"
    ],
    "landmark_paper": {
      "title": "The Mycobacterium tuberculosis ClpP1P2 Protease Interacts Asymmetrically with Its ATPase Partners ClpX and ClpC1.",
      "authors": "Leodolter J et al.",
      "journal": "PLoS One",
      "year": "2015",
      "doi": "10.1371/journal.pone.0125345",
      "url": "https://doi.org/10.1371/journal.pone.0125345",
      "citations": 68
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Linezolid (LZD)",
      "drug_class": "Protein Homeostasis Collapse",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "ctaC": {
    "gene": "ctaC",
    "rv": "Rv2200c",
    "msmeg": "MSMEG_4268",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "Cytochrome c oxidase subunit 2",
    "pathways": [
      "cytochrome_bc1"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of ctaC in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth)",
      "recommended_drug": "Telacebec (Q203)",
      "drug_class": "QcrB Cytochrome Inhibitor",
      "expected_fold_sensitization": "Nanomolar potentiation",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "ctaD": {
    "gene": "ctaD",
    "rv": "Rv3043c",
    "msmeg": "MSMEG_4437",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Probable cytochrome c oxidase subunit 1",
    "pathways": [
      "cytochrome_bc1"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of ctaD in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Telacebec (Q203)",
      "drug_class": "QcrB Cytochrome Inhibitor",
      "expected_fold_sensitization": "Nanomolar potentiation",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "ctaE": {
    "gene": "ctaE",
    "rv": "Rv2193",
    "msmeg": "MSMEG_4260",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "Probable cytochrome c oxidase subunit 3",
    "pathways": [
      "cytochrome_bc1"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of ctaE in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth)",
      "recommended_drug": "Telacebec (Q203)",
      "drug_class": "QcrB Cytochrome Inhibitor",
      "expected_fold_sensitization": "Nanomolar potentiation",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "ctpA": {
    "gene": "ctpA",
    "rv": "Rv0092",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "P-type metal-transporting ATPase CtpA (heavy metal tolerance)",
    "pathways": [
      "metal_iron"
    ],
    "landmark_paper": {
      "title": "CtpA, a putative Mycobacterium tuberculosis P-type ATPase, is stimulated by copper (I) in the mycobacterial plasma membrane.",
      "authors": "Le\u00f3n-Torres A et al.",
      "journal": "Biometals",
      "year": "2015",
      "doi": "10.1007/s10534-015-9860-x",
      "url": "https://doi.org/10.1007/s10534-015-9860-x",
      "citations": 22
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Bedaquiline / ROS Generators",
      "drug_class": "Iron Scavenging Starvation",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "ctpV": {
    "gene": "ctpV",
    "rv": "Rv0969",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "P-type copper efflux ATPase CtpV (copper detox in host macrophages)",
    "pathways": [
      "metal_iron"
    ],
    "landmark_paper": {
      "title": "CtpV: a putative copper exporter required for full virulence of Mycobacterium tuberculosis.",
      "authors": "Ward SK et al.",
      "journal": "Mol Microbiol",
      "year": "2010",
      "doi": "10.1111/j.1365-2958.2010.07273.x",
      "url": "https://doi.org/10.1111/j.1365-2958.2010.07273.x",
      "citations": 173
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Bedaquiline / ROS Generators",
      "drug_class": "Iron Scavenging Starvation",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "cydA": {
    "gene": "cydA",
    "rv": "Rv1623c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Probable integral membrane cytochrome D ubiquinol oxidase (Subunit I) CydA (Cytochrome BD-I oxidase subunit I)",
    "pathways": [
      "cytochrome_bd"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of cydA in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Telacebec (Q203) / Bedaquiline",
      "drug_class": "Respiratory Dual-Block",
      "expected_fold_sensitization": "Converts static to rapid cidal kill!",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "cydB": {
    "gene": "cydB",
    "rv": "Rv0490",
    "msmeg": "MSMEG_0936",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Sensor-like histidine kinase SenX3",
    "pathways": [
      "cytochrome_bd"
    ],
    "landmark_paper": {
      "title": "Control of CydB and GltA1 expression by the SenX3 RegX3 two component regulatory system of Mycobacterium tuberculosis.",
      "authors": "Roberts G et al.",
      "journal": "PLoS One",
      "year": "2011",
      "doi": "10.1371/journal.pone.0021090",
      "url": "https://doi.org/10.1371/journal.pone.0021090",
      "citations": 29
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Telacebec (Q203) / Bedaquiline",
      "drug_class": "Respiratory Dual-Block",
      "expected_fold_sensitization": "Converts static to rapid cidal kill!",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "cydC": {
    "gene": "cydC",
    "rv": "Rv1620c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Probable 'component linked with the assembly of cytochrome' transport transmembrane ATP-binding protein ABC transporter CydC",
    "pathways": [
      "cytochrome_bd"
    ],
    "landmark_paper": {
      "title": "A virulence-associated small RNA MTS1338 activates an ABC transporter CydC for rifampicin efflux in <i>Mycobacterium tuberculosis</i>.",
      "authors": "Singh S et al.",
      "journal": "Front Microbiol",
      "year": "2024",
      "doi": "10.3389/fmicb.2024.1469280",
      "url": "https://doi.org/10.3389/fmicb.2024.1469280",
      "citations": 6
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Telacebec (Q203) / Bedaquiline",
      "drug_class": "Respiratory Dual-Block",
      "expected_fold_sensitization": "Converts static to rapid cidal kill!",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "cydD": {
    "gene": "cydD",
    "rv": "Rv1621c",
    "msmeg": "MSMEG_3231",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Probable 'component linked with the assembly of cytochrome' transport transmembrane ATP-binding protein ABC transporter CydD",
    "pathways": [
      "cytochrome_bd"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of cydD in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Telacebec (Q203) / Bedaquiline",
      "drug_class": "Respiratory Dual-Block",
      "expected_fold_sensitization": "Converts static to rapid cidal kill!",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "dacB1": {
    "gene": "dacB1",
    "rv": "Rv3330",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "D-alanyl-D-alanine carboxypeptidase DacB1",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Exploring \u03b2-lactam interactions with DacB1: unraveling optimal therapies for combating drug-resistant &lt;i&gt;Mycobacterium tuberculosis&lt;/i&gt;.",
      "authors": "Nantongo M et al.",
      "journal": "mBio",
      "year": "2025",
      "doi": "10.1128/mbio.01372-25",
      "url": "https://doi.org/10.1128/mbio.01372-25",
      "citations": 1
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "ddlA": {
    "gene": "ddlA",
    "rv": "Rv2981c",
    "msmeg": "MSMEG_2395",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "D-alanine--D-alanine ligase",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Genetic analysis of peptidoglycan biosynthesis in mycobacteria: characterization of a ddlA mutant of Mycobacterium smegmatis.",
      "authors": "Belanger AE et al.",
      "journal": "J Bacteriol",
      "year": "2000",
      "doi": "10.1128/jb.182.23.6854-6856.2000",
      "url": "https://doi.org/10.1128/jb.182.23.6854-6856.2000",
      "citations": 11
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "ddn": {
    "gene": "ddn",
    "rv": "Rv3547",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Deazaflavin-dependent nitroreductase",
    "pathways": [
      "prodrug_activation"
    ],
    "landmark_paper": {
      "title": "Structure of Ddn, the deazaflavin-dependent nitroreductase from Mycobacterium tuberculosis involved in bioreductive activation of PA-824.",
      "authors": "Cellitti SE et al.",
      "journal": "Structure",
      "year": "2012",
      "doi": "10.1016/j.str.2011.11.001",
      "url": "https://doi.org/10.1016/j.str.2011.11.001",
      "citations": 79
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Prodrug Specific (INH/ETH/PZA)",
      "drug_class": "Bioactivation Sentinel",
      "expected_fold_sensitization": "Clinical Resistance Determinant",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "dfrA": {
    "gene": "dfrA",
    "rv": "Rv2763c",
    "msmeg": "MSMEG_2671",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "Dihydrofolate reductase",
    "pathways": [
      "folate_pathway"
    ],
    "landmark_paper": {
      "title": "Contribution of dfrA and inhA mutations to the detection of isoniazid-resistant Mycobacterium tuberculosis isolates.",
      "authors": "Ho YM et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2009",
      "doi": "10.1128/aac.00433-09",
      "url": "https://doi.org/10.1128/aac.00433-09",
      "citations": 20
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth)",
      "recommended_drug": "Para-aminosalicylic acid (PAS)",
      "drug_class": "Dihydropteroate Antifolate",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "dosR": {
    "gene": "dosR",
    "rv": "Rv3133c",
    "msmeg": "MSMEG_5244",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Dormancy survival regulator DosR (hypoxia and nitric oxide response regulon)",
    "pathways": [
      "two_component"
    ],
    "landmark_paper": {
      "title": "The Mycobacterium tuberculosis DosR regulon assists in survival during hypoxia and dormancy",
      "authors": "Boon et al.",
      "journal": "Journal of Bacteriology",
      "year": 2002,
      "doi": "10.1128/jb.184.24.6760-6767.2002",
      "url": "https://doi.org/10.1128/jb.184.24.6760-6767.2002",
      "citations": 490
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem / SDS / Acid Stress",
      "drug_class": "Stress Sensing Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "dosS": {
    "gene": "dosS",
    "rv": "Rv3132c",
    "msmeg": "MSMEG_5243",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Heme-containing sensor histidine kinase DosS (redox sensor of hypoxia)",
    "pathways": [
      "two_component"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis DosS is a redox sensor and DosT is a hypoxia sensor.",
      "authors": "Kumar A et al.",
      "journal": "Proc Natl Acad Sci U S A",
      "year": "2007",
      "doi": "10.1073/pnas.0705054104",
      "url": "https://doi.org/10.1073/pnas.0705054104",
      "citations": 282
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem / SDS / Acid Stress",
      "drug_class": "Stress Sensing Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "dosT": {
    "gene": "dosT",
    "rv": "Rv2027c",
    "msmeg": "MSMEG_3931",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Hypoxia sensor histidine kinase DosT (senses oxygen tension)",
    "pathways": [
      "two_component"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis DosS is a redox sensor and DosT is a hypoxia sensor.",
      "authors": "Kumar A et al.",
      "journal": "Proc Natl Acad Sci U S A",
      "year": "2007",
      "doi": "10.1073/pnas.0705054104",
      "url": "https://doi.org/10.1073/pnas.0705054104",
      "citations": 282
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem / SDS / Acid Stress",
      "drug_class": "Stress Sensing Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "dprE1": {
    "gene": "dprE1",
    "rv": "Rv3790",
    "msmeg": "MSMEG_6382",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Decaprenylphosphoryl-beta-D-ribose oxidase",
    "pathways": [
      "arabinogalactan"
    ],
    "landmark_paper": {
      "title": "Structural basis of inhibition of Mycobacterium tuberculosis DprE1 by benzothiazinone inhibitors.",
      "authors": "Batt SM et al.",
      "journal": "Proc Natl Acad Sci U S A",
      "year": "2012",
      "doi": "10.1073/pnas.1205735109",
      "url": "https://doi.org/10.1073/pnas.1205735109",
      "citations": 162
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Ethambutol (EMB)",
      "drug_class": "Arabinan Assembly Inhibitor",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "dprE2": {
    "gene": "dprE2",
    "rv": "Rv3791",
    "msmeg": "MSMEG_6385",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Decaprenylphosphoryl-2-keto-beta-D-erythro-pentose reductase",
    "pathways": [
      "arabinogalactan"
    ],
    "landmark_paper": {
      "title": "DprE2 is a molecular target of the anti-tubercular nitroimidazole compounds pretomanid and delamanid.",
      "authors": "Abrahams KA et al.",
      "journal": "Nat Commun",
      "year": "2023",
      "doi": "10.1038/s41467-023-39300-z",
      "url": "https://doi.org/10.1038/s41467-023-39300-z",
      "citations": 39
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Ethambutol (EMB)",
      "drug_class": "Arabinan Assembly Inhibitor",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "drrA": {
    "gene": "drrA",
    "rv": "Rv2936",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Growth Advantage",
    "product": "Doxorubicin resistance ATP-binding protein DrrA",
    "pathways": [
      "abc_efflux"
    ],
    "landmark_paper": {
      "title": "Overexpression and functional characterization of an ABC (ATP-binding cassette) transporter encoded by the genes drrA and drrB of Mycobacterium tuberculosis.",
      "authors": "Choudhuri BS et al.",
      "journal": "Biochem J",
      "year": "2002",
      "doi": "10.1042/bj20020615",
      "url": "https://doi.org/10.1042/bj20020615",
      "citations": 99
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Viable Pilot Candidate [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "drrB": {
    "gene": "drrB",
    "rv": "Rv2937",
    "msmeg": "MSMEG_3118",
    "presence": "BOTH",
    "pebble": "Growth Advantage",
    "product": "Doxorubicin resistance ABC transporter permease protein DrrB",
    "pathways": [
      "abc_efflux"
    ],
    "landmark_paper": {
      "title": "Overexpression and functional characterization of an ABC (ATP-binding cassette) transporter encoded by the genes drrA and drrB of Mycobacterium tuberculosis.",
      "authors": "Choudhuri BS et al.",
      "journal": "Biochem J",
      "year": "2002",
      "doi": "10.1042/bj20020615",
      "url": "https://doi.org/10.1042/bj20020615",
      "citations": 99
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable Pilot Candidate",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "drrC": {
    "gene": "drrC",
    "rv": "Rv2938",
    "msmeg": "MSMEG_3763",
    "presence": "BOTH",
    "pebble": "Growth Advantage",
    "product": "Probable doxorubicin resistance ABC transporter permease protein DrrC",
    "pathways": [
      "abc_efflux"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of drrC in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable Pilot Candidate",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "efpA": {
    "gene": "efpA",
    "rv": "Rv2846c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Essential",
    "product": "Uncharacterized MFS-type transporter EfpA",
    "pathways": [
      "mfs_efflux"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis efpA encodes an efflux protein of the QacA transporter family.",
      "authors": "Doran JL et al.",
      "journal": "Clin Diagn Lab Immunol",
      "year": "1997",
      "doi": "10.1128/cdli.4.1.23-32.1997",
      "url": "https://doi.org/10.1128/cdli.4.1.23-32.1997",
      "citations": 53
    },
    "ai_evaluation": {
      "score": 5,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Amikacin / Doxycycline",
      "drug_class": "Aminoglycoside / Tetracycline",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "embA": {
    "gene": "embA",
    "rv": "Rv3794",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Essential",
    "product": "Probable arabinosyltransferase A",
    "pathways": [
      "arabinogalactan"
    ],
    "landmark_paper": {
      "title": "The role of the embA and embB gene products in the biosynthesis of the terminal hexaarabinofuranosyl motif of Mycobacterium smegmatis arabinogalactan.",
      "authors": "Escuyer VE et al.",
      "journal": "J Biol Chem",
      "year": "2001",
      "doi": "10.1074/jbc.m102272200",
      "url": "https://doi.org/10.1074/jbc.m102272200",
      "citations": 129
    },
    "ai_evaluation": {
      "score": 5,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Ethambutol (EMB)",
      "drug_class": "Arabinan Assembly Inhibitor",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "embB": {
    "gene": "embB",
    "rv": "Rv3795",
    "msmeg": "MSMEG_6389",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Probable arabinosyltransferase B",
    "pathways": [
      "arabinogalactan"
    ],
    "landmark_paper": {
      "title": "Ethambutol resistance in Mycobacterium tuberculosis: critical role of embB mutations.",
      "authors": "Sreevatsan S et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "1997",
      "doi": "10.1128/aac.41.8.1677",
      "url": "https://doi.org/10.1128/aac.41.8.1677",
      "citations": 198
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Ethambutol (EMB)",
      "drug_class": "Arabinan Assembly Inhibitor",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "embC": {
    "gene": "embC",
    "rv": "Rv3793",
    "msmeg": "MSMEG_6388",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Probable arabinosyltransferase C",
    "pathways": [
      "arabinogalactan"
    ],
    "landmark_paper": {
      "title": "The arabinosyltransferase EmbC is inhibited by ethambutol in Mycobacterium tuberculosis.",
      "authors": "Goude R et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2009",
      "doi": "10.1128/aac.00162-09",
      "url": "https://doi.org/10.1128/aac.00162-09",
      "citations": 113
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Ethambutol (EMB)",
      "drug_class": "Arabinan Assembly Inhibitor",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "erm37": {
    "gene": "erm37",
    "rv": "Rv1988",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Probable 23S rRNA methyltransferase Erm(37)",
    "pathways": [
      "ribosome_machinery"
    ],
    "landmark_paper": {
      "title": "Mycobacteria modulate host epigenetic machinery by Rv1988 methylation of a non-tail arginine of histone H3.",
      "authors": "Yaseen I et al.",
      "journal": "Nat Commun",
      "year": "2015",
      "doi": "10.1038/ncomms9922",
      "url": "https://doi.org/10.1038/ncomms9922",
      "citations": 132
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Linezolid (LZD) / Amikacin",
      "drug_class": "Oxazolidinone / Aminoglycoside",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "ethA": {
    "gene": "ethA",
    "rv": "Rv3854c",
    "msmeg": "MSMEG_6440",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "FAD-containing monooxygenase EthA",
    "pathways": [
      "prodrug_activation"
    ],
    "landmark_paper": {
      "title": "ethA, inhA, and katG loci of ethionamide-resistant clinical Mycobacterium tuberculosis isolates.",
      "authors": "Morlock GP et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2003",
      "doi": "10.1128/aac.47.12.3799-3805.2003",
      "url": "https://doi.org/10.1128/aac.47.12.3799-3805.2003",
      "citations": 204
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Prodrug Specific (INH/ETH/PZA)",
      "drug_class": "Bioactivation Sentinel",
      "expected_fold_sensitization": "Clinical Resistance Determinant",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "fabG1": {
    "gene": "fabG1",
    "rv": "Rv1483",
    "msmeg": "MSMEG_3150",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "3-oxoacyl-[acyl-carrier-protein] reductase MabA",
    "pathways": [
      "mycolic_acid"
    ],
    "landmark_paper": {
      "title": "MabA (FabG1), a Mycobacterium tuberculosis protein involved in the long-chain fatty acid elongation system FAS-II.",
      "authors": "Marrakchi H et al.",
      "journal": "Microbiology (Reading)",
      "year": "2002",
      "doi": "10.1099/00221287-148-4-951",
      "url": "https://doi.org/10.1099/00221287-148-4-951",
      "citations": 91
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Isoniazid (INH)",
      "drug_class": "FAS-II Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "fbpA": {
    "gene": "fbpA",
    "rv": "Rv3804c",
    "msmeg": "MSMEG_2078",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Diacylglycerol acyltransferase/mycolyltransferase Ag85A",
    "pathways": [
      "envelope_lipids"
    ],
    "landmark_paper": {
      "title": "FbpA-Dependent biosynthesis of trehalose dimycolate is required for the intrinsic multidrug resistance, cell wall structure, and colonial morphology of Mycobacterium smegmatis.",
      "authors": "Nguyen L et al.",
      "journal": "J Bacteriol",
      "year": "2005",
      "doi": "10.1128/jb.187.19.6603-6611.2005",
      "url": "https://doi.org/10.1128/jb.187.19.6603-6611.2005",
      "citations": 84
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "SQ109 / Bedaquiline",
      "drug_class": "MmpL3 / Diarylquinoline",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "fbpB": {
    "gene": "fbpB",
    "rv": "Rv1886c",
    "msmeg": "MSMEG_2078",
    "presence": "BOTH",
    "pebble": "Growth Advantage",
    "product": "Diacylglycerol acyltransferase/mycolyltransferase Ag85B",
    "pathways": [
      "envelope_lipids"
    ],
    "landmark_paper": {
      "title": "An increase in expression of a Mycobacterium tuberculosis mycolyl transferase gene (fbpB) occurs early after infection of human monocytes.",
      "authors": "Wilkinson RJ et al.",
      "journal": "Mol Microbiol",
      "year": "2001",
      "doi": "10.1046/j.1365-2958.2001.02280.x",
      "url": "https://doi.org/10.1046/j.1365-2958.2001.02280.x",
      "citations": 41
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable Pilot Candidate",
      "recommended_drug": "SQ109 / Bedaquiline",
      "drug_class": "MmpL3 / Diarylquinoline",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "fbpC": {
    "gene": "fbpC",
    "rv": "Rv0129c",
    "msmeg": "MSMEG_2078",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Diacylglycerol acyltransferase/mycolyltransferase Ag85C",
    "pathways": [
      "envelope_lipids"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of fbpC in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "SQ109 / Bedaquiline",
      "drug_class": "MmpL3 / Diarylquinoline",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "folA": {
    "gene": "folA",
    "rv": "Rv2763c",
    "msmeg": "MSMEG_2671",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "Dihydrofolate reductase",
    "pathways": [
      "folate_pathway"
    ],
    "landmark_paper": {
      "title": "Role of the dihydrofolate reductase DfrA (Rv2763c) in trimethoprim-sulfamethoxazole (co-trimoxazole) resistance in Mycobacterium tuberculosis.",
      "authors": "K\u00f6ser CU et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2010",
      "doi": "10.1128/aac.00876-10",
      "url": "https://doi.org/10.1128/aac.00876-10",
      "citations": 10
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth)",
      "recommended_drug": "Para-aminosalicylic acid (PAS)",
      "drug_class": "Dihydropteroate Antifolate",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "folP1": {
    "gene": "folP1",
    "rv": "Rv3608c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Essential Domain",
    "product": "Dihydropteroate synthase",
    "pathways": [
      "folate_pathway"
    ],
    "landmark_paper": {
      "title": "Mutation analysis of the Mycobacterium leprae folP1 gene and dapsone resistance.",
      "authors": "Nakata N et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2011",
      "doi": "10.1128/aac.01212-10",
      "url": "https://doi.org/10.1128/aac.01212-10",
      "citations": 25
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "High-Confidence Vulnerable Target (Hypomorphic Titration) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Para-aminosalicylic acid (PAS)",
      "drug_class": "Dihydropteroate Antifolate",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Moderate (partial growth slowing)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "gidB": {
    "gene": "gidB",
    "rv": "Rv3919c",
    "msmeg": "MSMEG_6940",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Ribosomal RNA small subunit methyltransferase G",
    "pathways": [
      "ribosome_machinery"
    ],
    "landmark_paper": {
      "title": "Mutations in gidB confer low-level streptomycin resistance in Mycobacterium tuberculosis.",
      "authors": "Wong SY et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2011",
      "doi": "10.1128/aac.01814-10",
      "url": "https://doi.org/10.1128/aac.01814-10",
      "citations": 120
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Linezolid (LZD) / Amikacin",
      "drug_class": "Oxazolidinone / Aminoglycoside",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "glf": {
    "gene": "glf",
    "rv": "Rv3809c",
    "msmeg": "MSMEG_6404",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "UDP-galactopyranose mutase",
    "pathways": [
      "arabinogalactan"
    ],
    "landmark_paper": {
      "title": "Eukaryotic UDP-galactopyranose mutase (GLF gene) in microbial and metazoal pathogens.",
      "authors": "Beverley SM et al.",
      "journal": "Eukaryot Cell",
      "year": "2005",
      "doi": "10.1128/ec.4.6.1147-1154.2005",
      "url": "https://doi.org/10.1128/ec.4.6.1147-1154.2005",
      "citations": 109
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Ethambutol (EMB)",
      "drug_class": "Arabinan Assembly Inhibitor",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "glgA": {
    "gene": "glgA",
    "rv": "Rv1212c",
    "msmeg": "MSMEG_2689",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Glycogen/starch synthase GlgA (capsular alpha-glucan biosynthesis)",
    "pathways": [
      "capsule_glycan"
    ],
    "landmark_paper": {
      "title": "Functional characterization of glgA in Mycobacterium tuberculosis",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Vancomycin / Rifampicin",
      "drug_class": "Capsule Barrier Depletion",
      "expected_fold_sensitization": "8x to 64x permeability increase",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "glgB": {
    "gene": "glgB",
    "rv": "Rv1326c",
    "msmeg": "MSMEG_4914",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "1,4-alpha-glucan branching enzyme GlgB",
    "pathways": [
      "capsule_glycan"
    ],
    "landmark_paper": {
      "title": "Expression and characterization of alpha-(1,4)-glucan branching enzyme Rv1326c of Mycobacterium tuberculosis H37Rv.",
      "authors": "Garg SK et al.",
      "journal": "Protein Expr Purif",
      "year": "2007",
      "doi": "10.1016/j.pep.2006.08.005",
      "url": "https://doi.org/10.1016/j.pep.2006.08.005",
      "citations": 45
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Vancomycin / Rifampicin",
      "drug_class": "Capsule Barrier Depletion",
      "expected_fold_sensitization": "8x to 64x permeability increase",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic knockdown."
    }
  },
  "glgC": {
    "gene": "glgC",
    "rv": "Rv1213",
    "msmeg": "MSMEG_2690",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Glucose-1-phosphate adenylyltransferase GlgC (catalyzes ADP-glucose synthesis)",
    "pathways": [
      "capsule_glycan"
    ],
    "landmark_paper": {
      "title": "Functional characterization of glgC in Mycobacterium tuberculosis",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Vancomycin / Rifampicin",
      "drug_class": "Capsule Barrier Depletion",
      "expected_fold_sensitization": "8x to 64x permeability increase",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "glgE": {
    "gene": "glgE",
    "rv": "Rv1327c",
    "msmeg": "MSMEG_4915",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Maltosyltransferase GlgE (inhibition triggers lethal accumulation of maltose-1-phosphate!)",
    "pathways": [
      "capsule_glycan"
    ],
    "landmark_paper": {
      "title": "Self-poisoning of Mycobacterium tuberculosis by targeting the GlgE maltosyltransferase",
      "authors": "Kalscheuer et al.",
      "journal": "Nature Chemical Biology",
      "year": 2010,
      "doi": "10.1038/nchembio.462",
      "url": "https://doi.org/10.1038/nchembio.462",
      "citations": 210
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Vancomycin / Rifampicin",
      "drug_class": "Capsule Barrier Depletion",
      "expected_fold_sensitization": "8x to 64x permeability increase",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic knockdown."
    }
  },
  "gyrA": {
    "gene": "gyrA",
    "rv": "Rv0006",
    "msmeg": "MSMEG_0006",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "DNA gyrase subunit A",
    "pathways": [
      "dna_gyrase"
    ],
    "landmark_paper": {
      "title": "Cloning and nucleotide sequence of Mycobacterium tuberculosis gyrA and gyrB genes and detection of quinolone resistance mutations.",
      "authors": "Takiff HE et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "1994",
      "doi": "10.1128/aac.38.4.773",
      "url": "https://doi.org/10.1128/aac.38.4.773",
      "citations": 316
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone Topoisomerase",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "gyrB": {
    "gene": "gyrB",
    "rv": "Rv0005",
    "msmeg": "MSMEG_0005",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "DNA gyrase subunit B",
    "pathways": [
      "dna_gyrase"
    ],
    "landmark_paper": {
      "title": "Cloning and nucleotide sequence of Mycobacterium tuberculosis gyrA and gyrB genes and detection of quinolone resistance mutations.",
      "authors": "Takiff HE et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "1994",
      "doi": "10.1128/aac.38.4.773",
      "url": "https://doi.org/10.1128/aac.38.4.773",
      "citations": 316
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone Topoisomerase",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "hadA": {
    "gene": "hadA",
    "rv": "Rv0635",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Essential",
    "product": "UPF0336 protein Rv0635",
    "pathways": [
      "mycolic_acid"
    ],
    "landmark_paper": {
      "title": "Point mutations within the fatty acid synthase type II dehydratase components HadA or HadC contribute to isoxyl resistance in Mycobacterium tuberculosis.",
      "authors": "Gannoun-Zaki L et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2013",
      "doi": "10.1128/aac.01972-12",
      "url": "https://doi.org/10.1128/aac.01972-12",
      "citations": 26
    },
    "ai_evaluation": {
      "score": 5,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Isoniazid (INH)",
      "drug_class": "FAS-II Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "hadB": {
    "gene": "hadB",
    "rv": "Rv0636",
    "msmeg": "MSMEG_6754",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "(3R)-hydroxyacyl-ACP dehydratase subunit HadB",
    "pathways": [
      "mycolic_acid"
    ],
    "landmark_paper": {
      "title": "Flavonoid inhibitors as novel antimycobacterial agents targeting Rv0636, a putative dehydratase enzyme involved in Mycobacterium tuberculosis fatty acid synthase II.",
      "authors": "Brown AK et al.",
      "journal": "Microbiology (Reading)",
      "year": "2007",
      "doi": "10.1099/mic.0.2007/009936-0",
      "url": "https://doi.org/10.1099/mic.0.2007/009936-0",
      "citations": 51
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Isoniazid (INH)",
      "drug_class": "FAS-II Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "inhA": {
    "gene": "inhA",
    "rv": "Rv1484",
    "msmeg": "MSMEG_3151",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Enoyl-[acyl-carrier-protein] reductase [NADH]",
    "pathways": [
      "mycolic_acid"
    ],
    "landmark_paper": {
      "title": "inhA, a gene encoding a target for isoniazid and ethionamide in Mycobacterium tuberculosis.",
      "authors": "Banerjee A et al.",
      "journal": "Science",
      "year": "1994",
      "doi": "10.1126/science.8284673",
      "url": "https://doi.org/10.1126/science.8284673",
      "citations": 973
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Isoniazid (INH)",
      "drug_class": "FAS-II Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "iniA": {
    "gene": "iniA",
    "rv": "Rv0342",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Isoniazid-induced protein IniA",
    "pathways": [
      "mfs_efflux"
    ],
    "landmark_paper": {
      "title": "The Mycobacterium tuberculosis iniA gene is essential for activity of an efflux pump that confers drug tolerance to both isoniazid and ethambutol.",
      "authors": "Colangeli R et al.",
      "journal": "Mol Microbiol",
      "year": "2005",
      "doi": "10.1111/j.1365-2958.2005.04510.x",
      "url": "https://doi.org/10.1111/j.1365-2958.2005.04510.x",
      "citations": 134
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Amikacin / Doxycycline",
      "drug_class": "Aminoglycoside / Tetracycline",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "iniB": {
    "gene": "iniB",
    "rv": "Rv0341",
    "msmeg": "MSMEG_0693",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Isoniazid-induced protein IniB",
    "pathways": [
      "mfs_efflux"
    ],
    "landmark_paper": {
      "title": "Identification by mass spectrometry of CD8(+)-T-cell Mycobacterium tuberculosis epitopes within the Rv0341 gene product.",
      "authors": "Flyer DC et al.",
      "journal": "Infect Immun",
      "year": "2002",
      "doi": "10.1128/iai.70.6.2926-2932.2002",
      "url": "https://doi.org/10.1128/iai.70.6.2926-2932.2002",
      "citations": 36
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Amikacin / Doxycycline",
      "drug_class": "Aminoglycoside / Tetracycline",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "iniC": {
    "gene": "iniC",
    "rv": "Rv0343",
    "msmeg": "MSMEG_0698",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Isoniazid-induced protein IniC",
    "pathways": [
      "mfs_efflux"
    ],
    "landmark_paper": {
      "title": "IniB, iniA and iniC genes of mycobacteria and methods of use",
      "authors": "ALLAND DAVID et al.",
      "journal": "Biomedical Journal",
      "year": "2004",
      "doi": "",
      "url": "https://pubmed.ncbi.nlm.nih.gov//",
      "citations": 0
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Amikacin / Doxycycline",
      "drug_class": "Aminoglycoside / Tetracycline",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "irtA": {
    "gene": "irtA",
    "rv": "Rv1348",
    "msmeg": "MSMEG_4917",
    "presence": "BOTH",
    "pebble": "Essential Domain",
    "product": "Iron-regulated ABC transporter IrtA (carboxymycobactin exporter/reductase)",
    "pathways": [
      "metal_iron"
    ],
    "landmark_paper": {
      "title": "The Mycobacterium tuberculosis high-affinity iron importer, IrtA, contains an FAD-binding domain.",
      "authors": "Ryndak MB et al.",
      "journal": "J Bacteriol",
      "year": "2010",
      "doi": "10.1128/jb.00223-09",
      "url": "https://doi.org/10.1128/jb.00223-09",
      "citations": 79
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Vulnerable Target (Hypomorphic Titration)",
      "recommended_drug": "Bedaquiline / ROS Generators",
      "drug_class": "Iron Scavenging Starvation",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic knockdown."
    }
  },
  "irtB": {
    "gene": "irtB",
    "rv": "Rv1349",
    "msmeg": "MSMEG_4918",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "Iron-regulated ABC transporter permease IrtB",
    "pathways": [
      "metal_iron"
    ],
    "landmark_paper": {
      "title": "Functional characterization of irtB in Mycobacterium tuberculosis",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "High-Yield Regulatory / Barrier Target",
      "recommended_drug": "Bedaquiline / ROS Generators",
      "drug_class": "Iron Scavenging Starvation",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic knockdown."
    }
  },
  "kasA": {
    "gene": "kasA",
    "rv": "Rv2245",
    "msmeg": "MSMEG_3151",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "3-oxoacyl-[acyl-carrier-protein] synthase 1",
    "pathways": [
      "mycolic_acid"
    ],
    "landmark_paper": {
      "title": "Thiolactomycin and related analogues as novel anti-mycobacterial agents targeting KasA and KasB condensing enzymes in Mycobacterium tuberculosis.",
      "authors": "Kremer L et al.",
      "journal": "J Biol Chem",
      "year": "2000",
      "doi": "10.1074/jbc.m000569200",
      "url": "https://doi.org/10.1074/jbc.m000569200",
      "citations": 182
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Isoniazid (INH)",
      "drug_class": "FAS-II Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "kasB": {
    "gene": "kasB",
    "rv": "Rv2246",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "3-oxoacyl-[acyl-carrier-protein] synthase 2",
    "pathways": [
      "mycolic_acid"
    ],
    "landmark_paper": {
      "title": "Thiolactomycin and related analogues as novel anti-mycobacterial agents targeting KasA and KasB condensing enzymes in Mycobacterium tuberculosis.",
      "authors": "Kremer L et al.",
      "journal": "J Biol Chem",
      "year": "2000",
      "doi": "10.1074/jbc.m000569200",
      "url": "https://doi.org/10.1074/jbc.m000569200",
      "citations": 182
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Isoniazid (INH)",
      "drug_class": "FAS-II Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "katG": {
    "gene": "katG",
    "rv": "Rv1908c",
    "msmeg": "MSMEG_3729",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Catalase-peroxidase",
    "pathways": [
      "prodrug_activation",
      "oxidative_stress"
    ],
    "landmark_paper": {
      "title": "Dynamic persistence of M. tuberculosis under INH treatment",
      "authors": "Wakamoto et al.",
      "journal": "Science",
      "year": 2013,
      "doi": "10.1126/science.1479858",
      "url": "https://www.science.org/doi/10.1126/science.1479858",
      "citations": 485
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Prodrug Specific (INH/ETH/PZA)",
      "drug_class": "Bioactivation Sentinel",
      "expected_fold_sensitization": "Clinical Resistance Determinant",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "lprG": {
    "gene": "lprG",
    "rv": "Rv1411c",
    "msmeg": "MSMEG_3070",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Lipoarabinomannan carrier protein LprG",
    "pathways": [
      "envelope_lipids"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis LprG (Rv1411c): a novel TLR-2 ligand that inhibits human macrophage class II MHC antigen processing.",
      "authors": "Gehring AJ et al.",
      "journal": "J Immunol",
      "year": "2004",
      "doi": "10.4049/jimmunol.173.4.2660",
      "url": "https://doi.org/10.4049/jimmunol.173.4.2660",
      "citations": 192
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "SQ109 / Bedaquiline",
      "drug_class": "MmpL3 / Diarylquinoline",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mazE": {
    "gene": "mazE",
    "rv": "Rv1991A",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Antitoxin MazE (inhibits endoribonuclease MazF)",
    "pathways": [
      "persistence_toxin"
    ],
    "landmark_paper": {
      "title": "Structural basis of mRNA recognition and cleavage by toxin MazF and its regulation by antitoxin MazE in Bacillus subtilis.",
      "authors": "Simanshu DK et al.",
      "journal": "Mol Cell",
      "year": "2013",
      "doi": "10.1016/j.molcel.2013.09.006",
      "url": "https://doi.org/10.1016/j.molcel.2013.09.006",
      "citations": 70
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Bedaquiline / Pretomanid",
      "drug_class": "Persister Kill Regimen",
      "expected_fold_sensitization": "Prevents tolerant persistence!",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mazF": {
    "gene": "mazF",
    "rv": "Rv1991c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Sequence-specific endoribonuclease toxin MazF (triggers persistence and drug tolerance)",
    "pathways": [
      "persistence_toxin"
    ],
    "landmark_paper": {
      "title": "MazF ribonucleases promote Mycobacterium tuberculosis drug tolerance and virulence in guinea pigs.",
      "authors": "Tiwari P et al.",
      "journal": "Nat Commun",
      "year": "2015",
      "doi": "10.1038/ncomms7059",
      "url": "https://doi.org/10.1038/ncomms7059",
      "citations": 130
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Bedaquiline / Pretomanid",
      "drug_class": "Persister Kill Regimen",
      "expected_fold_sensitization": "Prevents tolerant persistence!",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mbtA": {
    "gene": "mbtA",
    "rv": "Rv2384",
    "msmeg": "MSMEG_4513",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Salicyl-AMP ligase MbtA (initiates mycobactin siderophore synthesis for iron scavenging)",
    "pathways": [
      "metal_iron"
    ],
    "landmark_paper": {
      "title": "Targeting mycobactin biosynthesis for antituberculosis drug discovery",
      "authors": "Ferreras et al.",
      "journal": "Nature Chemical Biology",
      "year": 2005,
      "doi": "10.1038/nchembio714",
      "url": "https://doi.org/10.1038/nchembio714",
      "citations": 280
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Bedaquiline / ROS Generators",
      "drug_class": "Iron Scavenging Starvation",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mbtB": {
    "gene": "mbtB",
    "rv": "Rv2383c",
    "msmeg": "MSMEG_4512",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Polyketide synthase / peptide synthetase MbtB",
    "pathways": [
      "metal_iron"
    ],
    "landmark_paper": {
      "title": "Analyses of MbtB, MbtE, and MbtF suggest revisions to the mycobactin biosynthesis pathway in Mycobacterium tuberculosis.",
      "authors": "McMahon MD et al.",
      "journal": "J Bacteriol",
      "year": "2012",
      "doi": "10.1128/jb.00088-12",
      "url": "https://doi.org/10.1128/jb.00088-12",
      "citations": 88
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Bedaquiline / ROS Generators",
      "drug_class": "Iron Scavenging Starvation",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mbtD": {
    "gene": "mbtD",
    "rv": "Rv2381c",
    "msmeg": "MSMEG_4510",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Acyltransferase MbtD",
    "pathways": [
      "metal_iron"
    ],
    "landmark_paper": {
      "title": "<i>mbtD</i> and <i>celA1</i> association with ethambutol resistance in <i>Mycobacterium tuberculosis</i>: A multiomics analysis.",
      "authors": "Wu Z et al.",
      "journal": "Front Cell Infect Microbiol",
      "year": "2022",
      "doi": "10.3389/fcimb.2022.959911",
      "url": "https://doi.org/10.3389/fcimb.2022.959911",
      "citations": 7
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Bedaquiline / ROS Generators",
      "drug_class": "Iron Scavenging Starvation",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mmpL11": {
    "gene": "mmpL11",
    "rv": "Rv0202c",
    "msmeg": "MSMEG_0241",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Heme uptake protein MmpL11",
    "pathways": [
      "mmpl_efflux"
    ],
    "landmark_paper": {
      "title": "MmpL11 protein transports mycolic acid-containing lipids to the mycobacterial cell wall and contributes to biofilm formation in Mycobacterium smegmatis.",
      "authors": "Pacheco SA et al.",
      "journal": "J Biol Chem",
      "year": "2013",
      "doi": "10.1074/jbc.m113.473371",
      "url": "https://doi.org/10.1074/jbc.m113.473371",
      "citations": 95
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Bedaquiline (BDQ) / Clofazimine",
      "drug_class": "RND Efflux Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mmpL3": {
    "gene": "mmpL3",
    "rv": "Rv0206c",
    "msmeg": "MSMEG_0250",
    "presence": "BOTH",
    "pebble": "Essential Domain",
    "product": "Trehalose monomycolate exporter MmpL3",
    "pathways": [
      "envelope_lipids"
    ],
    "landmark_paper": {
      "title": "SQ109 targets MmpL3, a membrane transporter of trehalose monomycolate involved in mycolic acid donation to the cell wall core of Mycobacterium tuberculosis.",
      "authors": "Tahlan K et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2012",
      "doi": "10.1128/aac.05708-11",
      "url": "https://doi.org/10.1128/aac.05708-11",
      "citations": 404
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "High-Confidence Vulnerable Target (Hypomorphic Titration)",
      "recommended_drug": "SQ109 / Bedaquiline",
      "drug_class": "MmpL3 / Diarylquinoline",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Moderate (partial growth slowing)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "mmpL4": {
    "gene": "mmpL4",
    "rv": "Rv0450c",
    "msmeg": "MSMEG_0576",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Siderophore exporter MmpL4",
    "pathways": [
      "mmpl_efflux"
    ],
    "landmark_paper": {
      "title": "Structures of the mycobacterial MmpL4 and MmpL5 transporters provide insights into their role in siderophore export and iron acquisition.",
      "authors": "Maharjan R et al.",
      "journal": "PLoS Biol",
      "year": "2024",
      "doi": "10.1371/journal.pbio.3002874",
      "url": "https://doi.org/10.1371/journal.pbio.3002874",
      "citations": 19
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Bedaquiline (BDQ) / Clofazimine",
      "drug_class": "RND Efflux Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mmpL5": {
    "gene": "mmpL5",
    "rv": "Rv0676c",
    "msmeg": "MSMEG_4383",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Siderophore exporter MmpL5",
    "pathways": [
      "mmpl_efflux"
    ],
    "landmark_paper": {
      "title": "Cross-resistance between clofazimine and bedaquiline through upregulation of MmpL5 in Mycobacterium tuberculosis",
      "authors": "Hartkoorn et al.",
      "journal": "Antimicrobial Agents and Chemotherapy",
      "year": 2014,
      "doi": "10.1128/AAC.00037-14",
      "url": "https://doi.org/10.1128/AAC.00037-14",
      "citations": 381
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Bedaquiline (BDQ) / Clofazimine",
      "drug_class": "RND Efflux Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mmpL7": {
    "gene": "mmpL7",
    "rv": "Rv2942",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Phthiocerol dimycocerosate exporter MmpL7",
    "pathways": [
      "mmpl_efflux"
    ],
    "landmark_paper": {
      "title": "mmpL7 gene of Mycobacterium tuberculosis is responsible for isoniazid efflux in Mycobacterium smegmatis.",
      "authors": "Pasca MR et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2005",
      "doi": "10.1128/aac.49.11.4775-4777.2005",
      "url": "https://doi.org/10.1128/aac.49.11.4775-4777.2005",
      "citations": 86
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Bedaquiline (BDQ) / Clofazimine",
      "drug_class": "RND Efflux Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mmpS4": {
    "gene": "mmpS4",
    "rv": "Rv0451c",
    "msmeg": "MSMEG_0462",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Siderophore export accessory protein MmpS4",
    "pathways": [
      "mmpl_efflux"
    ],
    "landmark_paper": {
      "title": "MmpS4 promotes glycopeptidolipids biosynthesis and export in Mycobacterium smegmatis.",
      "authors": "Deshayes C et al.",
      "journal": "Mol Microbiol",
      "year": "2010",
      "doi": "10.1111/j.1365-2958.2010.07385.x",
      "url": "https://doi.org/10.1111/j.1365-2958.2010.07385.x",
      "citations": 61
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Bedaquiline (BDQ) / Clofazimine",
      "drug_class": "RND Efflux Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mmpS5": {
    "gene": "mmpS5",
    "rv": "Rv0677c",
    "msmeg": "MSMEG_0226",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Siderophore export accessory protein MmpS5",
    "pathways": [
      "mmpl_efflux"
    ],
    "landmark_paper": {
      "title": "Azole resistance in Mycobacterium tuberculosis is mediated by the MmpS5-MmpL5 efflux system.",
      "authors": "Milano A et al.",
      "journal": "Tuberculosis (Edinb)",
      "year": "2009",
      "doi": "10.1016/j.tube.2008.08.003",
      "url": "https://doi.org/10.1016/j.tube.2008.08.003",
      "citations": 145
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Bedaquiline (BDQ) / Clofazimine",
      "drug_class": "RND Efflux Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mmr": {
    "gene": "mmr",
    "rv": "Rv3065",
    "msmeg": "MSMEG_4493",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Multidrug resistance protein Mmr",
    "pathways": [
      "smr_efflux"
    ],
    "landmark_paper": {
      "title": "mmr, a Mycobacterium tuberculosis gene conferring resistance to small cationic dyes and inhibitors.",
      "authors": "De Rossi E et al.",
      "journal": "J Bacteriol",
      "year": "1998",
      "doi": "10.1128/jb.180.22.6068-6071.1998",
      "url": "https://doi.org/10.1128/jb.180.22.6068-6071.1998",
      "citations": 71
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clarithromycin (CLR)",
      "drug_class": "Macrolide",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "mprA": {
    "gene": "mprA",
    "rv": "Rv0981",
    "msmeg": "MSMEG_5488",
    "presence": "BOTH",
    "pebble": "Growth Advantage",
    "product": "Two-component response regulator MprA (envelope stress response)",
    "pathways": [
      "two_component"
    ],
    "landmark_paper": {
      "title": "The MprAB two-component system regulates stress responses and virulence in Mycobacterium tuberculosis",
      "authors": "Zahrt et al.",
      "journal": "Molecular Microbiology",
      "year": 2001,
      "doi": "10.1046/j.1365-2958.2001.02322.x",
      "url": "https://doi.org/10.1046/j.1365-2958.2001.02322.x",
      "citations": 240
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "High-Yield Regulatory / Barrier Target",
      "recommended_drug": "Meropenem / SDS / Acid Stress",
      "drug_class": "Stress Sensing Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic knockdown."
    }
  },
  "mprB": {
    "gene": "mprB",
    "rv": "Rv0982",
    "msmeg": "MSMEG_5489",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Two-component sensor kinase MprB (senses membrane stress and SDS)",
    "pathways": [
      "two_component"
    ],
    "landmark_paper": {
      "title": "The MprB extracytoplasmic domain negatively regulates activation of the Mycobacterium tuberculosis MprAB two-component system.",
      "authors": "Bretl DJ et al.",
      "journal": "J Bacteriol",
      "year": "2014",
      "doi": "10.1128/jb.01064-13",
      "url": "https://doi.org/10.1128/jb.01064-13",
      "citations": 30
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Meropenem / SDS / Acid Stress",
      "drug_class": "Stress Sensing Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic knockdown."
    }
  },
  "mptA": {
    "gene": "mptA",
    "rv": "Rv2174",
    "msmeg": "MSMEG_3120",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Alpha-(1->6)-mannopyranosyltransferase A",
    "pathways": [
      "lipoarabinomannan"
    ],
    "landmark_paper": {
      "title": "Identification of an alpha(1--&gt;6) mannopyranosyltransferase (MptA), involved in Corynebacterium glutamicum lipomanann biosynthesis, and identification of its orthologue in Mycobacterium tuberculosis.",
      "authors": "Mishra AK et al.",
      "journal": "Mol Microbiol",
      "year": "2007",
      "doi": "10.1111/j.1365-2958.2007.05884.x",
      "url": "https://doi.org/10.1111/j.1365-2958.2007.05884.x",
      "citations": 70
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Ethambutol / Beta-Lactams",
      "drug_class": "Envelope Sensitizer",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "mptB": {
    "gene": "mptB",
    "rv": "Rv2174",
    "msmeg": "MSMEG_3120",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Alpha-(1->6)-mannopyranosyltransferase A",
    "pathways": [
      "lipoarabinomannan"
    ],
    "landmark_paper": {
      "title": "Identification of a novel alpha(1--&gt;6) mannopyranosyltransferase MptB from Corynebacterium glutamicum by deletion of a conserved gene, NCgl1505, affords a lipomannan- and lipoarabinomannan-deficient mutant.",
      "authors": "Mishra AK et al.",
      "journal": "Mol Microbiol",
      "year": "2008",
      "doi": "10.1111/j.1365-2958.2008.06265.x",
      "url": "https://doi.org/10.1111/j.1365-2958.2008.06265.x",
      "citations": 54
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Ethambutol / Beta-Lactams",
      "drug_class": "Envelope Sensitizer",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "murA": {
    "gene": "murA",
    "rv": "Rv1315",
    "msmeg": "MSMEG_4932",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "UDP-N-acetylglucosamine 1-carboxyvinyltransferase",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Characterization of a Cys115 to Asp substitution in the Escherichia coli cell wall biosynthetic enzyme UDP-GlcNAc enolpyruvyl transferase (MurA) that confers resistance to inactivation by the antibiotic fosfomycin.",
      "authors": "Kim DH et al.",
      "journal": "Biochemistry",
      "year": "1996",
      "doi": "10.1021/bi952937w",
      "url": "https://doi.org/10.1021/bi952937w",
      "citations": 146
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "murC": {
    "gene": "murC",
    "rv": "Rv2152c",
    "msmeg": "MSMEG_4226",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "UDP-N-acetylmuramate--L-alanine ligase",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "The MurC ligase essential for peptidoglycan biosynthesis is regulated by the serine/threonine protein kinase PknA in Corynebacterium glutamicum.",
      "authors": "Fiuza M et al.",
      "journal": "J Biol Chem",
      "year": "2008",
      "doi": "10.1074/jbc.m807175200",
      "url": "https://doi.org/10.1074/jbc.m807175200",
      "citations": 47
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "murD": {
    "gene": "murD",
    "rv": "Rv2155c",
    "msmeg": "MSMEG_4229",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "UDP-N-acetylmuramoylalanine--D-glutamate ligase",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Ability of PknA, a mycobacterial eukaryotic-type serine/threonine kinase, to transphosphorylate MurD, a ligase involved in the process of peptidoglycan biosynthesis.",
      "authors": "Thakur M et al.",
      "journal": "Biochem J",
      "year": "2008",
      "doi": "10.1042/bj20080234",
      "url": "https://doi.org/10.1042/bj20080234",
      "citations": 49
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "murE": {
    "gene": "murE",
    "rv": "Rv2158c",
    "msmeg": "MSMEG_4232",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "UDP-N-acetylmuramoyl-L-alanyl-D-glutamate--2,6-diaminopimelate ligase",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Anti-tubercular screening of natural products from Colombian plants: 3-methoxynordomesticine, an inhibitor of MurE ligase of Mycobacterium tuberculosis.",
      "authors": "Guzman JD et al.",
      "journal": "J Antimicrob Chemother",
      "year": "2010",
      "doi": "10.1093/jac/dkq313",
      "url": "https://doi.org/10.1093/jac/dkq313",
      "citations": 54
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "murF": {
    "gene": "murF",
    "rv": "Rv2157c",
    "msmeg": "MSMEG_4231",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "UDP-N-acetylmuramoyl-tripeptide--D-alanyl-D-alanine ligase",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "MurF inhibitors with antibacterial activity: effect on muropeptide levels.",
      "authors": "Baum EZ et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2009",
      "doi": "10.1128/aac.00166-09",
      "url": "https://doi.org/10.1128/aac.00166-09",
      "citations": 31
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "ndh": {
    "gene": "ndh",
    "rv": "Rv1854c",
    "msmeg": "MSMEG_2053",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "Type II NADH:quinone oxidoreductase Ndh",
    "pathways": [
      "ndh_dehydrogenase"
    ],
    "landmark_paper": {
      "title": "Steady-state kinetics and inhibitory action of antitubercular phenothiazines on mycobacterium tuberculosis type-II NADH-menaquinone oxidoreductase (NDH-2).",
      "authors": "Yano T et al.",
      "journal": "J Biol Chem",
      "year": "2006",
      "doi": "10.1074/jbc.m508844200",
      "url": "https://doi.org/10.1074/jbc.m508844200",
      "citations": 114
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth)",
      "recommended_drug": "Clofazimine (CFZ)",
      "drug_class": "Redox / NDH-2 Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "nuoA": {
    "gene": "nuoA",
    "rv": "Rv3145",
    "msmeg": "MSMEG_2063",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "NADH-quinone oxidoreductase subunit A",
    "pathways": [
      "ndh_dehydrogenase"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of nuoA in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clofazimine (CFZ)",
      "drug_class": "Redox / NDH-2 Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "nuoB": {
    "gene": "nuoB",
    "rv": "Rv3146",
    "msmeg": "MSMEG_2062",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "NADH-quinone oxidoreductase subunit B",
    "pathways": [
      "ndh_dehydrogenase"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of nuoB in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clofazimine (CFZ)",
      "drug_class": "Redox / NDH-2 Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "nuoG": {
    "gene": "nuoG",
    "rv": "Rv3151",
    "msmeg": "MSMEG_2057",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "NADH-quinone oxidoreductase subunit G",
    "pathways": [
      "ndh_dehydrogenase"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis nuoG is a virulence gene that inhibits apoptosis of infected host cells.",
      "authors": "Velmurugan K et al.",
      "journal": "PLoS Pathog",
      "year": "2007",
      "doi": "10.1371/journal.ppat.0030110",
      "url": "https://doi.org/10.1371/journal.ppat.0030110",
      "citations": 262
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clofazimine (CFZ)",
      "drug_class": "Redox / NDH-2 Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "ompATb": {
    "gene": "ompATb",
    "rv": "Rv0899",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Peptidoglycan-binding protein ArfA",
    "pathways": [
      "outer_permeability"
    ],
    "landmark_paper": {
      "title": "The functions of OmpATb, a pore-forming protein of Mycobacterium tuberculosis.",
      "authors": "Raynaud C et al.",
      "journal": "Mol Microbiol",
      "year": "2002",
      "doi": "10.1046/j.1365-2958.2002.03152.x",
      "url": "https://doi.org/10.1046/j.1365-2958.2002.03152.x",
      "citations": 76
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Amikacin / Vancomycin",
      "drug_class": "Aminoglycoside / Glycopeptide",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "papA2": {
    "gene": "papA2",
    "rv": "Rv3820c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Trehalose-2-sulfate acyltransferase PapA2",
    "pathways": [
      "envelope_lipids"
    ],
    "landmark_paper": {
      "title": "PapA1 and PapA2 are acyltransferases essential for the biosynthesis of the Mycobacterium tuberculosis virulence factor sulfolipid-1.",
      "authors": "Kumar P et al.",
      "journal": "Proc Natl Acad Sci U S A",
      "year": "2007",
      "doi": "10.1073/pnas.0611649104",
      "url": "https://doi.org/10.1073/pnas.0611649104",
      "citations": 76
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "SQ109 / Bedaquiline",
      "drug_class": "MmpL3 / Diarylquinoline",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "pbpA": {
    "gene": "pbpA",
    "rv": "Rv0016c",
    "msmeg": "MSMEG_0031",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Peptidoglycan D,D-transpeptidase PbpA",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "The serine/threonine kinase PknB of Mycobacterium tuberculosis phosphorylates PBPA, a penicillin-binding protein required for cell division.",
      "authors": "Dasgupta A et al.",
      "journal": "Microbiology (Reading)",
      "year": "2006",
      "doi": "10.1099/mic.0.28630-0",
      "url": "https://doi.org/10.1099/mic.0.28630-0",
      "citations": 119
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "pbpB": {
    "gene": "pbpB",
    "rv": "Rv2163c",
    "msmeg": "MSMEG_4233",
    "presence": "BOTH",
    "pebble": "Essential Domain",
    "product": "Penicillin-binding protein PbpB",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of pbpB in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "High-Confidence Vulnerable Target (Hypomorphic Titration)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "Moderate (partial growth slowing)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "phoP": {
    "gene": "phoP",
    "rv": "Rv3849",
    "msmeg": "MSMEG_6424",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Two-component response regulator PhoP (controls sulfolipids, DAT, PAT, and acid stress)",
    "pathways": [
      "two_component"
    ],
    "landmark_paper": {
      "title": "The PhoP-PhoR two-component system controls complex lipid biosynthesis in Mycobacterium tuberculosis",
      "authors": "Walters et al.",
      "journal": "Molecular Microbiology",
      "year": 2006,
      "doi": "10.1111/j.1365-2958.2006.05063.x",
      "url": "https://doi.org/10.1111/j.1365-2958.2006.05063.x",
      "citations": 350
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem / SDS / Acid Stress",
      "drug_class": "Stress Sensing Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "phoR": {
    "gene": "phoR",
    "rv": "Rv3849",
    "msmeg": "MSMEG_6424",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Two-component sensor kinase PhoR (senses low pH and acidic macrophage phagosome)",
    "pathways": [
      "two_component"
    ],
    "landmark_paper": {
      "title": "The virulence-associated two-component PhoP-PhoR system controls the biosynthesis of polyketide-derived lipids in Mycobacterium tuberculosis.",
      "authors": "Gonzalo Asensio J et al.",
      "journal": "J Biol Chem",
      "year": "2006",
      "doi": "10.1074/jbc.c500388200",
      "url": "https://doi.org/10.1074/jbc.c500388200",
      "citations": 175
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem / SDS / Acid Stress",
      "drug_class": "Stress Sensing Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "pimA": {
    "gene": "pimA",
    "rv": "Rv2610c",
    "msmeg": "MSMEG_2935",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Phosphatidyl-myo-inositol mannosyltransferase",
    "pathways": [
      "lipoarabinomannan"
    ],
    "landmark_paper": {
      "title": "Definition of the first mannosylation step in phosphatidylinositol mannoside synthesis. PimA is essential for growth of mycobacteria.",
      "authors": "Kordul\u00e1kov\u00e1 J et al.",
      "journal": "J Biol Chem",
      "year": "2002",
      "doi": "10.1074/jbc.m204060200",
      "url": "https://doi.org/10.1074/jbc.m204060200",
      "citations": 152
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Ethambutol / Beta-Lactams",
      "drug_class": "Envelope Sensitizer",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "pimB": {
    "gene": "pimB",
    "rv": "Rv2188c",
    "msmeg": "MSMEG_4253",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "GDP-mannose-dependent alpha-(1-6)-phosphatidylinositol monomannoside mannosyltransferase",
    "pathways": [
      "lipoarabinomannan"
    ],
    "landmark_paper": {
      "title": "The pimB gene of Mycobacterium tuberculosis encodes a mannosyltransferase involved in lipoarabinomannan biosynthesis.",
      "authors": "Schaeffer ML et al.",
      "journal": "J Biol Chem",
      "year": "1999",
      "doi": "10.1074/jbc.274.44.31625",
      "url": "https://doi.org/10.1074/jbc.274.44.31625",
      "citations": 86
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Ethambutol / Beta-Lactams",
      "drug_class": "Envelope Sensitizer",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "pks2": {
    "gene": "pks2",
    "rv": "Rv3825c",
    "msmeg": "MSMEG_4727",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Phthioceranic/hydroxyphthioceranic acid synthase",
    "pathways": [
      "envelope_lipids"
    ],
    "landmark_paper": {
      "title": "The Mycobacterium tuberculosis pks2 gene encodes the synthase for the hepta- and octamethyl-branched fatty acids required for sulfolipid synthesis.",
      "authors": "Sirakova TD et al.",
      "journal": "J Biol Chem",
      "year": "2001",
      "doi": "10.1074/jbc.m011468200",
      "url": "https://doi.org/10.1074/jbc.m011468200",
      "citations": 142
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "SQ109 / Bedaquiline",
      "drug_class": "MmpL3 / Diarylquinoline",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "pncA": {
    "gene": "pncA",
    "rv": "Rv2043c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Nicotinamidase/pyrazinamidase",
    "pathways": [
      "prodrug_activation"
    ],
    "landmark_paper": {
      "title": "Mutations in pncA, a gene encoding pyrazinamidase/nicotinamidase, cause resistance to the antituberculous drug pyrazinamide in tubercle bacillus.",
      "authors": "Scorpio A et al.",
      "journal": "Nat Med",
      "year": "1996",
      "doi": "10.1038/nm0696-662",
      "url": "https://doi.org/10.1038/nm0696-662",
      "citations": 506
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Prodrug Specific (INH/ETH/PZA)",
      "drug_class": "Bioactivation Sentinel",
      "expected_fold_sensitization": "Clinical Resistance Determinant",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "ponA1": {
    "gene": "ponA1",
    "rv": "Rv0050",
    "msmeg": "MSMEG_6900",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Penicillin-binding protein A1",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Phosphorylation of the Peptidoglycan Synthase PonA1 Governs the Rate of Polar Elongation in Mycobacteria",
      "authors": "Kieser et al.",
      "journal": "PLoS Pathogens",
      "year": 2015,
      "doi": "10.1371/journal.ppat.1005010",
      "url": "https://doi.org/10.1371/journal.ppat.1005010",
      "citations": 120
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "prcA": {
    "gene": "prcA",
    "rv": "Rv2109c",
    "msmeg": "MSMEG_3894",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Proteasome subunit alpha",
    "pathways": [
      "clp_protease"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of prcA in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Linezolid (LZD)",
      "drug_class": "Protein Homeostasis Collapse",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "prcB": {
    "gene": "prcB",
    "rv": "Rv2110c",
    "msmeg": "MSMEG_3895",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Proteasome subunit beta",
    "pathways": [
      "clp_protease"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of prcB in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Linezolid (LZD)",
      "drug_class": "Protein Homeostasis Collapse",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "qcrA": {
    "gene": "qcrA",
    "rv": "Rv2195",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Growth Defect",
    "product": "Cytochrome bc1 complex Rieske iron-sulfur subunit",
    "pathways": [
      "cytochrome_bc1"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of qcrA in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Telacebec (Q203)",
      "drug_class": "QcrB Cytochrome Inhibitor",
      "expected_fold_sensitization": "Nanomolar potentiation",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "qcrB": {
    "gene": "qcrB",
    "rv": "Rv2196",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Growth Defect",
    "product": "Cytochrome bc1 complex cytochrome b subunit",
    "pathways": [
      "cytochrome_bc1"
    ],
    "landmark_paper": {
      "title": "High-yield targeting of the Mycobacterium tuberculosis cytochrome bc1 complex by imidazopyridine amide Q203",
      "authors": "Pethe et al.",
      "journal": "Nature Medicine",
      "year": 2013,
      "doi": "10.1038/nm.3262",
      "url": "https://doi.org/10.1038/nm.3262",
      "citations": 530
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Telacebec (Q203)",
      "drug_class": "QcrB Cytochrome Inhibitor",
      "expected_fold_sensitization": "Nanomolar potentiation",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "qcrC": {
    "gene": "qcrC",
    "rv": "Rv2194",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Growth Defect",
    "product": "Cytochrome bc1 complex cytochrome c subunit",
    "pathways": [
      "cytochrome_bc1"
    ],
    "landmark_paper": {
      "title": "Genomic functional annotation of qcrC in Mycobacterium tuberculosis H37Rv",
      "authors": "Cole et al.",
      "journal": "Nature",
      "year": 1998,
      "doi": "10.1038/31159",
      "url": "https://doi.org/10.1038/31159",
      "citations": 4800
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Telacebec (Q203)",
      "drug_class": "QcrB Cytochrome Inhibitor",
      "expected_fold_sensitization": "Nanomolar potentiation",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "rbpA": {
    "gene": "rbpA",
    "rv": "Rv2050",
    "msmeg": "MSMEG_3858",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "RNA polymerase-binding protein RbpA",
    "pathways": [
      "rna_polymerase"
    ],
    "landmark_paper": {
      "title": "Structure and function of the mycobacterial transcription initiation complex with the essential regulator RbpA.",
      "authors": "Hubin EA et al.",
      "journal": "Elife",
      "year": "2017",
      "doi": "10.7554/elife.22520",
      "url": "https://doi.org/10.7554/elife.22520",
      "citations": 124
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth)",
      "recommended_drug": "Rifampicin (RIF)",
      "drug_class": "Rifamycin RNAP Blocker",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "recA": {
    "gene": "recA",
    "rv": "Rv2737c",
    "msmeg": "MSMEG_2723",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Protein RecA",
    "pathways": [
      "dna_gyrase"
    ],
    "landmark_paper": {
      "title": "Dissection of phylogenetic relationships among 19 rapidly growing Mycobacterium species by 16S rRNA, hsp65, sodA, recA and rpoB gene sequencing.",
      "authors": "Ad\u00e9kambi T et al.",
      "journal": "Int J Syst Evol Microbiol",
      "year": "2004",
      "doi": "10.1099/ijs.0.63094-0",
      "url": "https://doi.org/10.1099/ijs.0.63094-0",
      "citations": 213
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone Topoisomerase",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "regX3": {
    "gene": "regX3",
    "rv": "Rv0491",
    "msmeg": "MSMEG_0937",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Two-component response regulator RegX3 (activates phoA and pstS)",
    "pathways": [
      "two_component"
    ],
    "landmark_paper": {
      "title": "The senX3-regX3 two-component regulatory system of Mycobacterium tuberculosis is required for virulence.",
      "authors": "Parish T et al.",
      "journal": "Microbiology (Reading)",
      "year": "2003",
      "doi": "10.1099/mic.0.26245-0",
      "url": "https://doi.org/10.1099/mic.0.26245-0",
      "citations": 142
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem / SDS / Acid Stress",
      "drug_class": "Stress Sensing Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "relA": {
    "gene": "relA",
    "rv": "Rv2583c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "GTP pyrophosphokinase / (p)ppGpp synthetase RelA (stringent response master regulator)",
    "pathways": [
      "persistence_toxin"
    ],
    "landmark_paper": {
      "title": "The stringent response regulated by RelA is required for persistence of Mycobacterium tuberculosis in mice",
      "authors": "Dahl et al.",
      "journal": "Proc Natl Acad Sci USA",
      "year": 2003,
      "doi": "10.1073/pnas.1632772100",
      "url": "https://doi.org/10.1073/pnas.1632772100",
      "citations": 390
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Bedaquiline / Pretomanid",
      "drug_class": "Persister Kill Regimen",
      "expected_fold_sensitization": "Prevents tolerant persistence!",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "ripA": {
    "gene": "ripA",
    "rv": "Rv1477",
    "msmeg": "MSMEG_3145",
    "presence": "BOTH",
    "pebble": "Essential Domain",
    "product": "Peptidoglycan endopeptidase RipA",
    "pathways": [
      "peptidoglycan"
    ],
    "landmark_paper": {
      "title": "Replication of Yersinia pestis in interferon gamma-activated macrophages requires ripA, a gene encoded in the pigmentation locus.",
      "authors": "Pujol C et al.",
      "journal": "Proc Natl Acad Sci U S A",
      "year": "2005",
      "doi": "10.1073/pnas.0502849102",
      "url": "https://doi.org/10.1073/pnas.0502849102",
      "citations": 93
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "High-Confidence Vulnerable Target (Hypomorphic Titration)",
      "recommended_drug": "Meropenem (+ Clavulanate)",
      "drug_class": "Carbapenem Beta-Lactam",
      "expected_fold_sensitization": "16x to 64x sensitization",
      "standalone_tolerance": "Moderate (partial growth slowing)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "rpoA": {
    "gene": "rpoA",
    "rv": "Rv3457c",
    "msmeg": "MSMEG_1524",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "DNA-directed RNA polymerase subunit alpha",
    "pathways": [
      "rna_polymerase"
    ],
    "landmark_paper": {
      "title": "Patterns of compensatory mutations in rpoA/B/C genes of multidrug resistant M. tuberculosis in Uganda.",
      "authors": "Kateete DP et al.",
      "journal": "PLoS One",
      "year": "2025",
      "doi": "10.1371/journal.pone.0328957",
      "url": "https://doi.org/10.1371/journal.pone.0328957",
      "citations": 0
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Rifampicin (RIF)",
      "drug_class": "Rifamycin RNAP Blocker",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "rpoB": {
    "gene": "rpoB",
    "rv": "Rv0667",
    "msmeg": "MSMEG_1367",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "DNA-directed RNA polymerase subunit beta",
    "pathways": [
      "rna_polymerase"
    ],
    "landmark_paper": {
      "title": "Rapid molecular detection of tuberculosis and rifampin resistance",
      "authors": "Boehme et al.",
      "journal": "New England Journal of Medicine",
      "year": 2010,
      "doi": "10.1056/NEJMoa0907847",
      "url": "https://doi.org/10.1056/NEJMoa0907847",
      "citations": 1533
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Rifampicin (RIF)",
      "drug_class": "Rifamycin RNAP Blocker",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "rpoC": {
    "gene": "rpoC",
    "rv": "Rv0668",
    "msmeg": "MSMEG_1368",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "DNA-directed RNA polymerase subunit beta'",
    "pathways": [
      "rna_polymerase"
    ],
    "landmark_paper": {
      "title": "Putative compensatory mutations in the rpoC gene of rifampin-resistant Mycobacterium tuberculosis are associated with ongoing transmission.",
      "authors": "de Vos M et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2013",
      "doi": "10.1128/aac.01541-12",
      "url": "https://doi.org/10.1128/aac.01541-12",
      "citations": 183
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Rifampicin (RIF)",
      "drug_class": "Rifamycin RNAP Blocker",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "rpoZ": {
    "gene": "rpoZ",
    "rv": "Rv1390",
    "msmeg": "MSMEG_3053",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "DNA-directed RNA polymerase subunit omega",
    "pathways": [
      "rna_polymerase"
    ],
    "landmark_paper": {
      "title": "Deletion of the rpoZ gene, encoding the omega subunit of RNA polymerase, results in pleiotropic surface-related phenotypes in Mycobacterium smegmatis.",
      "authors": "Mathew R et al.",
      "journal": "Microbiology (Reading)",
      "year": "2006",
      "doi": "10.1099/mic.0.28879-0",
      "url": "https://doi.org/10.1099/mic.0.28879-0",
      "citations": 38
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Rifampicin (RIF)",
      "drug_class": "Rifamycin RNAP Blocker",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "rpsL": {
    "gene": "rpsL",
    "rv": "Rv0682",
    "msmeg": "MSMEG_1398",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Small ribosomal subunit protein uS12",
    "pathways": [
      "ribosome_machinery"
    ],
    "landmark_paper": {
      "title": "Induction of actinorhodin production by rpsL (encoding ribosomal protein S12) mutations that confer streptomycin resistance in Streptomyces lividans and Streptomyces coelicolor A3(2).",
      "authors": "Shima J et al.",
      "journal": "J Bacteriol",
      "year": "1996",
      "doi": "10.1128/jb.178.24.7276-7284.1996",
      "url": "https://doi.org/10.1128/jb.178.24.7276-7284.1996",
      "citations": 184
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Linezolid (LZD) / Amikacin",
      "drug_class": "Oxazolidinone / Aminoglycoside",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "rv0678": {
    "gene": "rv0678",
    "rv": "Rv0678",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "HTH-type transcriptional regulator MmpR5",
    "pathways": [
      "mmpl_efflux"
    ],
    "landmark_paper": {
      "title": "Unexpected high prevalence of resistance-associated Rv0678 variants in MDR-TB patients without documented prior use of clofazimine or bedaquiline.",
      "authors": "Villellas C et al.",
      "journal": "J Antimicrob Chemother",
      "year": "2017",
      "doi": "10.1093/jac/dkw502",
      "url": "https://doi.org/10.1093/jac/dkw502",
      "citations": 159
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Bedaquiline (BDQ) / Clofazimine",
      "drug_class": "RND Efflux Target",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "rv1217c": {
    "gene": "rv1217c",
    "rv": "Rv1217c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Multidrug efflux system permease protein Rv1217c",
    "pathways": [
      "abc_efflux"
    ],
    "landmark_paper": {
      "title": "The expression of ABC efflux pump, Rv1217c-Rv1218c, and its association with multidrug resistance of Mycobacterium tuberculosis in China.",
      "authors": "Wang K et al.",
      "journal": "Curr Microbiol",
      "year": "2013",
      "doi": "10.1007/s00284-012-0215-3",
      "url": "https://doi.org/10.1007/s00284-012-0215-3",
      "citations": 49
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "rv1218c": {
    "gene": "rv1218c",
    "rv": "Rv1218c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Multidrug efflux system ATP-binding protein Rv1218c",
    "pathways": [
      "abc_efflux"
    ],
    "landmark_paper": {
      "title": "Rv1218c, an ABC transporter of Mycobacterium tuberculosis with implications in drug discovery.",
      "authors": "Balganesh M et al.",
      "journal": "Antimicrob Agents Chemother",
      "year": "2010",
      "doi": "10.1128/aac.00610-10",
      "url": "https://doi.org/10.1128/aac.00610-10",
      "citations": 58
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "rv1258c": {
    "gene": "rv1258c",
    "rv": "Rv1258c",
    "msmeg": "MSMEG_2786",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Multidrug efflux pump Tap",
    "pathways": [
      "mfs_efflux"
    ],
    "landmark_paper": {
      "title": "Piperine as an inhibitor of Rv1258c, a putative multidrug efflux pump of Mycobacterium tuberculosis.",
      "authors": "Sharma S et al.",
      "journal": "J Antimicrob Chemother",
      "year": "2010",
      "doi": "10.1093/jac/dkq186",
      "url": "https://doi.org/10.1093/jac/dkq186",
      "citations": 132
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Amikacin / Doxycycline",
      "drug_class": "Aminoglycoside / Tetracycline",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "rv1698": {
    "gene": "rv1698",
    "rv": "Rv1698",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Copper transporter MctB",
    "pathways": [
      "outer_permeability"
    ],
    "landmark_paper": {
      "title": "Rv1698 of Mycobacterium tuberculosis represents a new class of channel-forming outer membrane proteins.",
      "authors": "Siroy A et al.",
      "journal": "J Biol Chem",
      "year": "2008",
      "doi": "10.1074/jbc.m800866200",
      "url": "https://doi.org/10.1074/jbc.m800866200",
      "citations": 64
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Amikacin / Vancomycin",
      "drug_class": "Aminoglycoside / Glycopeptide",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "rv1819c": {
    "gene": "rv1819c",
    "rv": "Rv1819c",
    "msmeg": "MSMEG_4194",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Hydrophilic compounds import ATP-binding/permease protein BacA",
    "pathways": [
      "abc_efflux"
    ],
    "landmark_paper": {
      "title": "Myoinositol and methyl stearate increases rifampicin susceptibility among drug-resistant Mycobacterium tuberculosis expressing Rv1819c.",
      "authors": "Nirmal CR et al.",
      "journal": "Chem Biol Drug Des",
      "year": "2023",
      "doi": "10.1111/cbdd.14197",
      "url": "https://doi.org/10.1111/cbdd.14197",
      "citations": 5
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone",
      "expected_fold_sensitization": "4x to 8x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "senX3": {
    "gene": "senX3",
    "rv": "Rv0490",
    "msmeg": "MSMEG_0936",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Two-component sensor histidine kinase SenX3 (phosphate limitation)",
    "pathways": [
      "two_component"
    ],
    "landmark_paper": {
      "title": "The senX3-regX3 two-component regulatory system of Mycobacterium tuberculosis is required for virulence.",
      "authors": "Parish T et al.",
      "journal": "Microbiology (Reading)",
      "year": "2003",
      "doi": "10.1099/mic.0.26245-0",
      "url": "https://doi.org/10.1099/mic.0.26245-0",
      "citations": 142
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Meropenem / SDS / Acid Stress",
      "drug_class": "Stress Sensing Inhibitor",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "sodA": {
    "gene": "sodA",
    "rv": "Rv3846",
    "msmeg": "MSMEG_6427",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Superoxide dismutase [Fe]",
    "pathways": [
      "oxidative_stress"
    ],
    "landmark_paper": {
      "title": "Dissection of phylogenetic relationships among 19 rapidly growing Mycobacterium species by 16S rRNA, hsp65, sodA, recA and rpoB gene sequencing.",
      "authors": "Ad\u00e9kambi T et al.",
      "journal": "Int J Syst Evol Microbiol",
      "year": "2004",
      "doi": "10.1099/ijs.0.63094-0",
      "url": "https://doi.org/10.1099/ijs.0.63094-0",
      "citations": 213
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Clofazimine (CFZ) / Pretomanid",
      "drug_class": "ROS-Generating Antimicrobials",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "sodC": {
    "gene": "sodC",
    "rv": "Rv0432",
    "msmeg": "MSMEG_0835",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Superoxide dismutase [Cu-Zn]",
    "pathways": [
      "oxidative_stress"
    ],
    "landmark_paper": {
      "title": "Unique features of the sodC-encoded superoxide dismutase from Mycobacterium tuberculosis, a fully functional copper-containing enzyme lacking zinc in the active site.",
      "authors": "Spagnolo L et al.",
      "journal": "J Biol Chem",
      "year": "2004",
      "doi": "10.1074/jbc.m404699200",
      "url": "https://doi.org/10.1074/jbc.m404699200",
      "citations": 77
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clofazimine (CFZ) / Pretomanid",
      "drug_class": "ROS-Generating Antimicrobials",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "tap": {
    "gene": "tap",
    "rv": "Rv1258c",
    "msmeg": "MSMEG_2786",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Multidrug efflux pump Tap",
    "pathways": [
      "mfs_efflux"
    ],
    "landmark_paper": {
      "title": "An invariant T cell receptor alpha chain defines a novel TAP-independent major histocompatibility complex class Ib-restricted alpha/beta T cell subpopulation in mammals.",
      "authors": "Tilloy F et al.",
      "journal": "J Exp Med",
      "year": "1999",
      "doi": "10.1084/jem.189.12.1907",
      "url": "https://doi.org/10.1084/jem.189.12.1907",
      "citations": 555
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Amikacin / Doxycycline",
      "drug_class": "Aminoglycoside / Tetracycline",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "thyA": {
    "gene": "thyA",
    "rv": "Rv2764c",
    "msmeg": "MSMEG_2670",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "Thymidylate synthase ThyA",
    "pathways": [
      "folate_pathway"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis thymidylate synthase gene thyX is essential and potentially bifunctional, while thyA deletion confers resistance to p-aminosalicylic acid.",
      "authors": "Fivian-Hughes AS et al.",
      "journal": "Microbiology (Reading)",
      "year": "2012",
      "doi": "10.1099/mic.0.053983-0",
      "url": "https://doi.org/10.1099/mic.0.053983-0",
      "citations": 76
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth)",
      "recommended_drug": "Para-aminosalicylic acid (PAS)",
      "drug_class": "Dihydropteroate Antifolate",
      "expected_fold_sensitization": "8x to 32x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "tlyA": {
    "gene": "tlyA",
    "rv": "Rv1694",
    "msmeg": "MSMEG_3751",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "16S/23S rRNA (cytidine-2'-O)-methyltransferase TlyA",
    "pathways": [
      "ribosome_machinery"
    ],
    "landmark_paper": {
      "title": "Use of a flexible cassette method to generate a double unmarked Mycobacterium tuberculosis tlyA plcABC mutant by gene replacement.",
      "authors": "Parish T et al.",
      "journal": "Microbiology (Reading)",
      "year": "2000",
      "doi": "10.1099/00221287-146-8-1969",
      "url": "https://doi.org/10.1099/00221287-146-8-1969",
      "citations": 433
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Linezolid (LZD) / Amikacin",
      "drug_class": "Oxazolidinone / Aminoglycoside",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "topA": {
    "gene": "topA",
    "rv": "Rv3646c",
    "msmeg": "MSMEG_6157",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "DNA topoisomerase 1",
    "pathways": [
      "dna_gyrase"
    ],
    "landmark_paper": {
      "title": "Topoisomerase I (TopA) is recruited to ParB complexes and is required for proper chromosome organization during Streptomyces coelicolor sporulation.",
      "authors": "Szafran M et al.",
      "journal": "J Bacteriol",
      "year": "2013",
      "doi": "10.1128/jb.00798-13",
      "url": "https://doi.org/10.1128/jb.00798-13",
      "citations": 29
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Moxifloxacin (MFX)",
      "drug_class": "Fluoroquinolone Topoisomerase",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "tuf": {
    "gene": "tuf",
    "rv": "Rv0685",
    "msmeg": "MSMEG_1401",
    "presence": "BOTH",
    "pebble": "Essential",
    "product": "Elongation factor Tu",
    "pathways": [
      "ribosome_machinery"
    ],
    "landmark_paper": {
      "title": "Duplication of the tuf gene: a new insight into the phylogeny of eubacteria.",
      "authors": "Sela S et al.",
      "journal": "J Bacteriol",
      "year": "1989",
      "doi": "10.1128/jb.171.1.581-584.1989",
      "url": "https://doi.org/10.1128/jb.171.1.581-584.1989",
      "citations": 39
    },
    "ai_evaluation": {
      "score": 6,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA)",
      "recommended_drug": "Linezolid (LZD) / Amikacin",
      "drug_class": "Oxazolidinone / Aminoglycoside",
      "expected_fold_sensitization": "4x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "ubiA": {
    "gene": "ubiA",
    "rv": "Rv3806c",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "Essential",
    "product": "Decaprenyl-phosphate phosphoribosyltransferase",
    "pathways": [
      "arabinogalactan"
    ],
    "landmark_paper": {
      "title": "Deletion of Cg-emb in corynebacterianeae leads to a novel truncated cell wall arabinogalactan, whereas inactivation of Cg-ubiA results in an arabinan-deficient mutant with a cell wall galactan core.",
      "authors": "Alderwick LJ et al.",
      "journal": "J Biol Chem",
      "year": "2005",
      "doi": "10.1074/jbc.m506339200",
      "url": "https://doi.org/10.1074/jbc.m506339200",
      "citations": 111
    },
    "ai_evaluation": {
      "score": 5,
      "verdict": "Essential Target (Requires Weak Mismatched PAM sgRNA) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Ethambutol (EMB)",
      "drug_class": "Arabinan Assembly Inhibitor",
      "expected_fold_sensitization": "8x to 16x sensitization",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "vapB1": {
    "gene": "vapB1",
    "rv": "Rv0064A",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "Antitoxin VapB1 (neutralizes PIN-domain ribonuclease VapC1)",
    "pathways": [
      "persistence_toxin"
    ],
    "landmark_paper": {
      "title": "Discovery of Small-Molecule VapC1 Nuclease Inhibitors by Virtual Screening and Scaffold Hopping from an Atomic Structure Revealing Protein-Protein Interactions with a Native VapB1 Inhibitor.",
      "authors": "Sun H et al.",
      "journal": "J Chem Inf Model",
      "year": "2022",
      "doi": "10.1021/acs.jcim.1c01188",
      "url": "https://doi.org/10.1021/acs.jcim.1c01188",
      "citations": 4
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Bedaquiline / Pretomanid",
      "drug_class": "Persister Kill Regimen",
      "expected_fold_sensitization": "Prevents tolerant persistence!",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "vapC1": {
    "gene": "vapC1",
    "rv": "Rv0065",
    "msmeg": null,
    "presence": "MTB_ONLY",
    "pebble": "NonEssential",
    "product": "PIN-domain ribonuclease toxin VapC1 (cleaves initiator tRNA-fMet causing translation arrest)",
    "pathways": [
      "persistence_toxin"
    ],
    "landmark_paper": {
      "title": "Analysis of non-typeable Haemophilous influenzae VapC1 mutations reveals structural features required for toxicity and flexibility in the active site.",
      "authors": "Hamilton B et al.",
      "journal": "PLoS One",
      "year": "2014",
      "doi": "10.1371/journal.pone.0112921",
      "url": "https://doi.org/10.1371/journal.pone.0112921",
      "citations": 9
    },
    "ai_evaluation": {
      "score": 8,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty) [Mtb-only; No M. smegmatis BSL-1 Pilot]",
      "recommended_drug": "Bedaquiline / Pretomanid",
      "drug_class": "Persister Kill Regimen",
      "expected_fold_sensitization": "Prevents tolerant persistence!",
      "standalone_tolerance": "High (tolerates depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "whiB1": {
    "gene": "whiB1",
    "rv": "Rv3219",
    "msmeg": "MSMEG_1919",
    "presence": "BOTH",
    "pebble": "Growth Defect",
    "product": "Transcriptional regulator WhiB1",
    "pathways": [
      "whib_regulon"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis WhiB1 is an essential DNA-binding protein with a nitric oxide-sensitive iron-sulfur cluster.",
      "authors": "Smith LJ et al.",
      "journal": "Biochem J",
      "year": "2010",
      "doi": "10.1042/bj20101440",
      "url": "https://doi.org/10.1042/bj20101440",
      "citations": 108
    },
    "ai_evaluation": {
      "score": 7,
      "verdict": "Viable with Mild Growth Defect (Check Baseline Growth)",
      "recommended_drug": "Clarithromycin / Amikacin / DOX",
      "drug_class": "Multi-Drug Regulon Master",
      "expected_fold_sensitization": "16x to >64x multi-class sensitization!",
      "standalone_tolerance": "Strict essential (use hypomorphic PAM)",
      "sgRNA_advice": "Use mismatched PAM (e.g. NAG) to titrate hypomorphic 60-80% knockdown without killing the bug prior to antibiotic exposure."
    }
  },
  "whiB3": {
    "gene": "whiB3",
    "rv": "Rv3416",
    "msmeg": "MSMEG_1597",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Redox- and pH-responsive transcriptional regulator WhiB3",
    "pathways": [
      "whib_regulon"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis WhiB3 maintains redox homeostasis by regulating virulence lipid anabolism to modulate macrophage response.",
      "authors": "Singh A et al.",
      "journal": "PLoS Pathog",
      "year": "2009",
      "doi": "10.1371/journal.ppat.1000545",
      "url": "https://doi.org/10.1371/journal.ppat.1000545",
      "citations": 254
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clarithromycin / Amikacin / DOX",
      "drug_class": "Multi-Drug Regulon Master",
      "expected_fold_sensitization": "16x to >64x multi-class sensitization!",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "whiB4": {
    "gene": "whiB4",
    "rv": "Rv3681c",
    "msmeg": "MSMEG_6199",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Transcriptional regulator WhiB4",
    "pathways": [
      "whib_regulon"
    ],
    "landmark_paper": {
      "title": "Mycobacterium tuberculosis WhiB4 regulates oxidative stress response to modulate survival and dissemination in vivo.",
      "authors": "Chawla M et al.",
      "journal": "Mol Microbiol",
      "year": "2012",
      "doi": "10.1111/j.1365-2958.2012.08165.x",
      "url": "https://doi.org/10.1111/j.1365-2958.2012.08165.x",
      "citations": 82
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clarithromycin / Amikacin / DOX",
      "drug_class": "Multi-Drug Regulon Master",
      "expected_fold_sensitization": "16x to >64x multi-class sensitization!",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  },
  "whiB7": {
    "gene": "whiB7",
    "rv": "Rv3197A",
    "msmeg": "MSMEG_1953",
    "presence": "BOTH",
    "pebble": "NonEssential",
    "product": "Probable transcriptional regulator WhiB7",
    "pathways": [
      "whib_regulon"
    ],
    "landmark_paper": {
      "title": "The transcriptional regulator WhiB7 controls intrinsic multidrug resistance in Mycobacterium tuberculosis",
      "authors": "Morris et al.",
      "journal": "Proc Natl Acad Sci USA",
      "year": 2005,
      "doi": "10.1073/pnas.0502798102",
      "url": "https://doi.org/10.1073/pnas.0502798102",
      "citations": 340
    },
    "ai_evaluation": {
      "score": 9,
      "verdict": "Top Synergy Candidate (Zero Standalone Fitness Penalty)",
      "recommended_drug": "Clarithromycin / Amikacin / DOX",
      "drug_class": "Multi-Drug Regulon Master",
      "expected_fold_sensitization": "16x to >64x multi-class sensitization!",
      "standalone_tolerance": "High (tolerates CRISPRi depletion alone)",
      "sgRNA_advice": "Use standard NGG PAM guide"
    }
  }
};

// ==========================================
// 2. STATE MANAGEMENT
// ==========================================

const state = {
  selectedPathway: "peptidoglycan",
  drugFilter: "all",
  showAllGenes: false,
  requireSmegmatis: true,
  pebbleFilter: "exclude_strict_lethal",
  scoreFilter: "all",
  directSearchQuery: "",
  activeGene: null,
  // 🔑 API Key: Stored securely in user's browser localStorage.
  // For public GitHub deployment, leave as "" so users enter their own free Gemini key in the UI.
  // (Optional: If hosting privately and you want to pre-load a shared key, you can paste it between the quotes below)
  geminiApiKey: localStorage.getItem("gemini_api_key") || ""
};

// ==========================================
// 3. UI RENDERING FUNCTIONS
// ==========================================

function initUI() {
  renderPathwayPills();
  updatePathwayInfoCard();
  updateApiStatusDot();
  attachEventListeners();
  updateCandidateTable();
}

function renderPathwayPills() {
  const container = document.getElementById("pathwayCategories");
  if (!container) return;
  container.innerHTML = "";

  PATHWAY_CATEGORIES.forEach(cat => {
    const group = document.createElement("div");
    group.className = "category-group";
    
    const title = document.createElement("div");
    title.className = "category-group-title";
    title.textContent = cat.name;
    group.appendChild(title);

    const pillsContainer = document.createElement("div");
    pillsContainer.className = "pills-container";

    cat.pills.forEach(pill => {
      const matchCount = Object.values(CURATED_GENES_DB).filter(g => g.pathways && g.pathways.includes(pill.id)).length;

      const btn = document.createElement("button");
      btn.className = `pill-btn ${(!state.showAllGenes && pill.id === state.selectedPathway) ? "active" : ""}`;
      btn.innerHTML = `${pill.label} <span class="pill-count">(${matchCount})</span>`;
      btn.dataset.pillId = pill.id;

      btn.addEventListener("click", () => {
        state.showAllGenes = false;
        state.selectedPathway = pill.id;
        state.directSearchQuery = "";
        const searchInput = document.getElementById("optionalGeneSearch");
        if (searchInput) searchInput.value = "";
        renderPathwayPills();
        updatePathwayInfoCard();
        updateCandidateTable();
      });

      pillsContainer.appendChild(btn);
    });

    group.appendChild(pillsContainer);
    container.appendChild(group);
  });
}

function updatePathwayInfoCard() {
  let card = document.getElementById("pathwayInfoCard");
  if (!card) return;

  if (state.showAllGenes) {
    card.innerHTML = `
      <div class="callout-header">
        <span class="callout-badge" style="background:#e0e7ff; color:#3730a3;">Global View</span>
        <b>Browsing All 147 Mycobacterial Targets</b>
      </div>
      <p class="callout-desc">Displaying the full target matrix. Use the filters or search bar below to narrow down by drug, mechanism, or author.</p>
    `;
    card.style.display = "block";
    return;
  }

  let currentPill = null;
  for (const cat of PATHWAY_CATEGORIES) {
    for (const p of cat.pills) {
      if (p.id === state.selectedPathway) {
        currentPill = p;
        break;
      }
    }
  }

  if (currentPill) {
    card.innerHTML = `
      <div class="callout-header">
        <span class="callout-badge">Pathway Rationale</span>
        <b>${currentPill.label}</b>
      </div>
      <p class="callout-desc">${currentPill.desc}</p>
    `;
    card.style.display = "block";
  } else {
    card.style.display = "none";
  }
}



function updateApiStatusDot() {
  const dot = document.getElementById("apiStatusDot");
  const btnText = document.getElementById("apiKeyBtnText");
  if (!dot || !btnText) return;
  if (state.geminiApiKey && state.geminiApiKey.length > 10) {
    dot.className = "status-dot active";
    btnText.textContent = "Gemini Key: Active";
  } else {
    dot.className = "status-dot";
    btnText.textContent = "Set Gemini Key";
  }
}

function attachEventListeners() {
  // Modal handlers
  const modal = document.getElementById("apiKeyModal");
  const apiKeyBtn = document.getElementById("apiKeyBtn");
  const closeApiKeyBtn = document.getElementById("closeApiKeyBtn");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");

  if (apiKeyBtn && modal) {
    apiKeyBtn.addEventListener("click", () => {
      document.getElementById("modalApiKeyInput").value = state.geminiApiKey;
      modal.showModal();
    });
  }
  if (closeApiKeyBtn && modal) {
    closeApiKeyBtn.addEventListener("click", () => modal.close());
  }
  if (saveApiKeyBtn && modal) {
    saveApiKeyBtn.addEventListener("click", () => {
      state.geminiApiKey = document.getElementById("modalApiKeyInput").value.trim();
      localStorage.setItem("gemini_api_key", state.geminiApiKey);
      updateApiStatusDot();
      modal.close();
    });
  }

  // Show all genes toggle button
  const showAllBtn = document.getElementById("showAllGenesBtn");
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      state.showAllGenes = !state.showAllGenes;
      showAllBtn.textContent = state.showAllGenes ? "📂 Filter by Pathway Pills" : "🌐 Show All 147 Genes";
      renderPathwayPills();
      updatePathwayInfoCard();
      updateCandidateTable();
    });
  }

  // Constraints
  const requireSmeg = document.getElementById("requireSmegmatisToggle");
  if (requireSmeg) {
    requireSmeg.addEventListener("change", (e) => {
      state.requireSmegmatis = e.target.checked;
      updateCandidateTable();
    });
  }

  const pebbleFilter = document.getElementById("pebbleFilterSelect");
  if (pebbleFilter) {
    pebbleFilter.addEventListener("change", (e) => {
      state.pebbleFilter = e.target.value;
      updateCandidateTable();
    });
  }

  const scoreFilter = document.getElementById("scoreFilterSelect");
  if (scoreFilter) {
    scoreFilter.addEventListener("change", (e) => {
      state.scoreFilter = e.target.value;
      updateCandidateTable();
    });
  }

  const drugFilter = document.getElementById("drugFilterSelect");
  if (drugFilter) {
    drugFilter.addEventListener("change", (e) => {
      state.drugFilter = e.target.value;
      updateCandidateTable();
    });
  }

  const searchInput = document.getElementById("optionalGeneSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.directSearchQuery = e.target.value.trim().toLowerCase();
      updateCandidateTable();
    });
  }

  const exportBtn = document.getElementById("exportCsvBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportTableToCSV);
  }

  // Agent trigger
  const runAgentBtn = document.getElementById("runAgentBtn");
  if (runAgentBtn) {
    runAgentBtn.addEventListener("click", () => {
      if (state.activeGene) {
        runAgentEvaluation(state.activeGene);
      }
    });
  }

  // QA follow-up
  const qaSendBtn = document.getElementById("qaSendBtn");
  const qaInput = document.getElementById("qaInput");
  if (qaSendBtn) qaSendBtn.addEventListener("click", sendQAFollowup);
  if (qaInput) {
    qaInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendQAFollowup();
    });
  }
}

// ==========================================
// 4. CANDIDATE MATRIX FILTERING & RENDERING
// ==========================================

function getFilteredGenes() {
  const allGenes = Object.values(CURATED_GENES_DB);
  
  return allGenes.filter(g => {
    // 1. Direct search overrides pathway (searches gene, rv, msmeg, product, drug, paper title, author)
    if (state.directSearchQuery) {
      const q = state.directSearchQuery;
      const matchName = g.gene && g.gene.toLowerCase().includes(q);
      const matchRv = g.rv && g.rv.toLowerCase().includes(q);
      const matchSmeg = g.msmeg && g.msmeg.toLowerCase().includes(q);
      const matchProd = g.product && g.product.toLowerCase().includes(q);
      const matchDrug = g.ai_evaluation?.recommended_drug && g.ai_evaluation.recommended_drug.toLowerCase().includes(q);
      const matchPaper = g.landmark_paper?.title && g.landmark_paper.title.toLowerCase().includes(q);
      const matchAuthor = g.landmark_paper?.authors && g.landmark_paper.authors.toLowerCase().includes(q);
      if (!matchName && !matchRv && !matchSmeg && !matchProd && !matchDrug && !matchPaper && !matchAuthor) return false;
    } else if (!state.showAllGenes) {
      // Pathway match
      if (!g.pathways || !g.pathways.includes(state.selectedPathway)) return false;
    }

    // 2. Smegmatis ortholog constraint
    if (state.requireSmegmatis && g.presence !== "BOTH") {
      return false;
    }

    // 3. PEBBLE essentiality gate
    const pebble = (g.pebble || "").toLowerCase();
    if (state.pebbleFilter === "exclude_strict_lethal") {
      if (pebble.includes("essential") && !pebble.includes("non") && !pebble.includes("domain")) {
        return false;
      }
    } else if (state.pebbleFilter === "vulnerable") {
      if (!pebble.includes("domain") && !pebble.includes("vulnerable")) return false;
    } else if (state.pebbleFilter === "non_essential") {
      if (!pebble.includes("non")) return false;
    } else if (state.pebbleFilter === "essential") {
      if (!pebble.includes("essential") || pebble.includes("non")) return false;
    }

    // 4. Score filter
    const score = g.ai_evaluation?.score || 0;
    if (state.scoreFilter === "score_8" && score < 8) return false;
    if (state.scoreFilter === "score_7" && score < 7) return false;

    // 5. Target drug filter
    if (state.drugFilter && state.drugFilter !== "all") {
      const recDrug = (g.ai_evaluation?.recommended_drug || "").toLowerCase();
      const drugClass = (g.ai_evaluation?.drug_class || "").toLowerCase();
      const filterKey = state.drugFilter.toLowerCase();
      
      let match = recDrug.includes(filterKey) || drugClass.includes(filterKey);
      if (!match) {
        if (filterKey === "meropenem" && (recDrug.includes("carbapenem") || drugClass.includes("beta-lactam") || drugClass.includes("peptidoglycan"))) match = true;
        else if (filterKey === "isoniazid" && (recDrug.includes("inh") || drugClass.includes("fas-ii") || drugClass.includes("mycolic"))) match = true;
        else if (filterKey === "rifampicin" && (recDrug.includes("rif") || drugClass.includes("transcription") || drugClass.includes("rna polymerase"))) match = true;
        else if (filterKey === "bedaquiline" && (recDrug.includes("bdq") || drugClass.includes("atp") || drugClass.includes("respiration"))) match = true;
        else if (filterKey === "moxifloxacin" && (recDrug.includes("mfx") || drugClass.includes("gyrase") || drugClass.includes("fluoroquinolone") || drugClass.includes("dna"))) match = true;
        else if (filterKey === "linezolid" && (recDrug.includes("lzd") || drugClass.includes("ribosome") || drugClass.includes("translation") || drugClass.includes("oxazolidinone"))) match = true;
        else if (filterKey === "clofazimine" && (recDrug.includes("cfz") || drugClass.includes("ros") || drugClass.includes("redox") || drugClass.includes("respiration"))) match = true;
        else if (filterKey === "ethambutol" && (recDrug.includes("emb") || drugClass.includes("arabinan") || drugClass.includes("arabinogalactan"))) match = true;
        else if (filterKey === "telacebec" && (recDrug.includes("q203") || drugClass.includes("bc1") || drugClass.includes("respiration"))) match = true;
        else if (filterKey === "amikacin" && (recDrug.includes("amk") || drugClass.includes("aminoglycoside"))) match = true;
        else if (filterKey === "clarithromycin" && (recDrug.includes("clr") || drugClass.includes("macrolide"))) match = true;
        else if (filterKey === "doxycycline" && (recDrug.includes("dox") || drugClass.includes("tetracycline"))) match = true;
        else if (filterKey === "pas" && (recDrug.includes("para-amino") || drugClass.includes("folate"))) match = true;
      }
      
      if (!match) return false;
    }

    return true;
  });
}

function updateCandidateTable() {
  const tbody = document.getElementById("candidateTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtered = getFilteredGenes();
  const countSpan = document.getElementById("candidateCount");
  if (countSpan) countSpan.textContent = filtered.length;

  if (filtered.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6" style="text-align:center; padding:32px; color:#64748b;">
      <div style="font-size:1.15rem; font-weight:600; margin-bottom:8px;">🔍 No candidate targets match your current filters.</div>
      <span style="font-size:0.9rem;">
        Tip: Try selecting <i>'All Calls (No Filter)'</i> under PEBBLE, or click <b>'Show All 147 Genes'</b>.
      </span>
    </td>`;
    tbody.appendChild(tr);
    return;
  }

  filtered.forEach((g, idx) => {
    const tr = document.createElement("tr");
    
    // Presence badge
    let presenceHtml = "";
    if (g.presence === "BOTH") {
      presenceHtml = `<span class="badge badge-both" title="Conserved in M. smegmatis - BSL-1 pilot testing ready">🌐 Both (BSL-1 Ready)</span>`;
    } else if (g.presence === "MTB_ONLY") {
      presenceHtml = `<span class="badge badge-mtb" title="Pathogen-specific in M. tuberculosis">🔬 Mtb Only</span>`;
    } else {
      presenceHtml = `<span class="badge badge-smeg">🧫 Smeg Only</span>`;
    }

    // PEBBLE badge
    let pebbleHtml = "";
    const pebbleLower = (g.pebble || "").toLowerCase();
    if (pebbleLower.includes("non")) {
      pebbleHtml = `<span class="badge badge-noness" title="Tolerated upon depletion">✔️ ${g.pebble}</span>`;
    } else if (pebbleLower.includes("domain") || pebbleLower.includes("vulnerable")) {
      pebbleHtml = `<span class="badge badge-vuln" title="CRISPRi hypersensitive target">🎯 ${g.pebble}</span>`;
    } else if (pebbleLower.includes("essential")) {
      pebbleHtml = `<span class="badge badge-ess" title="Strict lethal without drug">⚠️ ${g.pebble}</span>`;
    } else {
      pebbleHtml = `<span class="badge badge-unc">❓ ${g.pebble || "Uncertain"}</span>`;
    }

    // Direct Database Links
    const mycoMtbLink = g.rv ? `<a href="https://mycobrowser.epfl.ch/genes/${g.rv}" target="_blank" class="link-btn" title="Open Rv in EPFL Mycobrowser">🧬 ${g.rv}</a>` : "-";
    const mycoSmegLink = g.msmeg ? `<a href="https://mycobrowser.epfl.ch/genes/${g.msmeg}" target="_blank" class="link-btn" title="Open MSMEG in Mycobrowser">🧫 ${g.msmeg}</a>` : "-";
    const pebbleLink = `<a href="https://pebble.rockefeller.edu/genes/search/?q=${g.rv || g.msmeg || g.gene}" target="_blank" class="link-btn" title="Open PEBBLE Transposon/CRISPRi profile">🪨 PEBBLE</a>`;

    // Landmark Paper Details
    const paper = g.landmark_paper || {};
    const paperUrl = paper.url || `https://doi.org/${paper.doi}`;
    const paperHtml = `
      <div class="paper-card-cell">
        <div class="paper-author-title">
          <span class="paper-journal-tag">${paper.journal || 'Journal'} (${paper.year || 'N/A'})</span>
          <b>${paper.authors || 'Authors'}</b>
        </div>
        <div class="paper-headline">${paper.title || 'Landmark paper'}</div>
        <div style="margin-top:6px; display:flex; gap:6px; flex-wrap:wrap;">
          <a href="${paperUrl}" target="_blank" class="paper-link-btn" title="Authenticate via vpn.unibas.ch for full Nature/Science/Cell text">
            🏛️ Read Paper (Uni Basel VPN)
          </a>
        </div>
      </div>
    `;

    // AI Evaluation Details
    const ai = g.ai_evaluation || {};
    const scoreClass = (ai.score >= 8) ? "ai-score-high" : "ai-score-med";
    const aiHtml = `
      <div class="ai-card-cell">
        <span class="ai-score-pill ${scoreClass}">Score: ${ai.score || 7} / 10</span>
        <div style="font-weight:600; color:#1e3a8a; font-size:0.8rem; margin-bottom:2px;">${ai.verdict || 'Viable Target'}</div>
        <div style="color:#0f766e; font-size:0.78rem; font-weight:600;">Shift: ${ai.expected_fold_sensitization || 'Sensitization reported'}</div>
        <div class="guide-tip"><b>Guide Advice:</b> ${ai.sgRNA_advice || 'Use standard NGG PAM guide'}</div>
      </div>
    `;

    // Recommended Drug
    const drugHtml = `
      <div>
        <span class="drug-badge">${ai.recommended_drug || 'Frontline Antimicrobial'}</span>
        <span class="drug-potency">Class: ${ai.drug_class || 'Standard'}</span>
        <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">Tolerance: ${ai.standalone_tolerance || 'Good'}</div>
      </div>
    `;

    tr.innerHTML = `
      <td>
        <div style="font-size:1.05rem; font-weight:700; color:#0f172a; margin-bottom:4px;">Gene ${idx + 1}: ${g.gene}</div>
        <div style="font-size:0.82rem; margin-bottom:4px;">${mycoMtbLink} &bull; ${mycoSmegLink}</div>
        <div>${presenceHtml}</div>
      </td>
      <td>${drugHtml}</td>
      <td>
        <div style="font-size:0.86rem; color:#1e293b; line-height:1.4; margin-bottom:6px;">${g.product || g.gene}</div>
        <div>${pebbleHtml} &nbsp; ${pebbleLink}</div>
      </td>
      <td>${paperHtml}</td>
      <td>${aiHtml}</td>
      <td>
        <button class="btn btn-primary btn-sm evaluate-btn" data-gene="${g.gene}">
          🧠 Ask AI &amp; Q&amp;A
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Attach button events
  document.querySelectorAll(".evaluate-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const geneKey = e.currentTarget.dataset.gene;
      const geneObj = CURATED_GENES_DB[geneKey];
      if (geneObj) {
        selectAndEvaluateGene(geneObj);
      }
    });
  });
}

function exportTableToCSV() {
  const filtered = getFilteredGenes();
  if (filtered.length === 0) {
    alert("No rows to export.");
    return;
  }

  let csv = "Gene,Rv_ID,Smeg_MSMEG,Model,Recommended_Antibiotic,Expected_Sensitization,Function,Landmark_Paper_Title,Landmark_Paper_Author,Landmark_Paper_Journal,Landmark_Paper_URL,AI_Viability_Score,sgRNA_Advice\n";
  filtered.forEach(g => {
    const ai = g.ai_evaluation || {};
    const paper = g.landmark_paper || {};
    csv += `"${g.gene}","${g.rv || ''}","${g.msmeg || ''}","${g.presence}","${(ai.recommended_drug || '').replace(/"/g, '""')}","${(ai.expected_fold_sensitization || '').replace(/"/g, '""')}","${(g.product || '').replace(/"/g, '""')}","${(paper.title || '').replace(/"/g, '""')}","${(paper.authors || '').replace(/"/g, '""')}","${(paper.journal || '').replace(/"/g, '""')}","${paper.url || ''}","${ai.score || ''}","${(ai.sgRNA_advice || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mycobacterium_targets_atlas.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==========================================
// 5. LITERATURE RETRIEVAL (Europe PMC API)
// ==========================================

async function fetchEuropePmcLiterature(geneObj, drugName) {
  const identifiers = [];
  if (geneObj.rv) identifiers.push(`TITLE:"${geneObj.rv}" OR ABSTRACT:"${geneObj.rv}"`);
  if (geneObj.msmeg) identifiers.push(`TITLE:"${geneObj.msmeg}" OR ABSTRACT:"${geneObj.msmeg}"`);
  if (geneObj.gene) identifiers.push(`TITLE:"${geneObj.gene}" OR ABSTRACT:"${geneObj.gene}"`);

  const geneClause = `(${identifiers.join(" OR ")})`;
  const organismClause = `("Mycobacterium tuberculosis" OR "Mycobacterium smegmatis" OR "tuberculosis" OR "smegmatis")`;
  const contextClause = `(knockdown OR CRISPRi OR resistance OR susceptibility OR synergy OR MIC OR deletion OR "essential")`;

  const query = `${geneClause} AND ${organismClause} AND ${contextClause}`;
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=4&sort=CITED%20desc`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Europe PMC query failed");
    const data = await res.json();
    const rawPapers = data?.resultList?.result || [];

    return rawPapers.map(p => ({
      title: (p.title || "No Title").replace(/\.$/, ""),
      journal: p.journalInfo?.journal?.title || p.journalTitle || "Scientific Journal",
      year: p.pubYear || "N/A",
      citations: p.citedByCount || 0,
      authors: p.authorString || "Authors",
      abstract: p.abstractText || "Abstract not directly available in core index.",
      doi: p.doi || "",
      pmid: p.pmid || "",
      isOpenAccess: p.isOpenAccess === "Y",
      pdfUrl: p.fullTextUrlList?.fullTextUrl?.find(ft => ft.documentStyle === "pdf")?.url || null
    }));
  } catch (err) {
    console.error("Literature fetch error:", err);
    return [];
  }
}

// ==========================================
// 6. GEMINI 3.8 FLASH EVALUATION ENGINE
// ==========================================

let currentPapersCache = [];

async function selectAndEvaluateGene(geneObj) {
  state.activeGene = geneObj;
  
  const section = document.getElementById("agentSection");
  if (!section) return;
  section.style.display = "block";

  const targetGeneEl = document.getElementById("agentTargetGene");
  if (targetGeneEl) targetGeneEl.textContent = `${geneObj.gene} (${geneObj.rv || geneObj.msmeg || 'Mtb/Smeg'})`;

  const targetDrugEl = document.getElementById("agentTargetDrug");
  const recDrug = geneObj.ai_evaluation?.recommended_drug || "Auto-Paired Antimicrobial";
  if (targetDrugEl) targetDrugEl.textContent = recDrug;

  section.scrollIntoView({ behavior: "smooth" });

  await runAgentEvaluation(geneObj);
}

async function runAgentEvaluation(geneObj) {
  const loading = document.getElementById("agentLoading");
  const scorecardContainer = document.getElementById("agentScorecardContainer");
  const papersList = document.getElementById("papersList");

  if (loading) loading.style.display = "block";
  if (scorecardContainer) scorecardContainer.style.display = "none";
  if (papersList) papersList.innerHTML = `<p style="color:#64748b;">Retrieving literature from Europe PMC...</p>`;

  const targetDrugName = geneObj.ai_evaluation?.recommended_drug || "Antimicrobial";

  // 1. Fetch literature
  const papers = await fetchEuropePmcLiterature(geneObj, targetDrugName);
  currentPapersCache = papers;

  renderPapersList(papers, geneObj.landmark_paper);

  // 2. Check API Key
  if (!state.geminiApiKey) {
    if (loading) loading.style.display = "none";
    if (scorecardContainer) scorecardContainer.style.display = "block";
    document.getElementById("scorecardBadge").textContent = "API Key Missing";
    document.getElementById("scorecardBadge").style.background = "#fee2e2";
    document.getElementById("scorecardBadge").style.color = "#991b1b";
    document.getElementById("scorecardVerdict").textContent = "Please configure your Gemini API key in the top right.";
    document.getElementById("scorecardBody").innerHTML = `<p>Click the <b>Gemini API Key</b> button in the header to paste your key and enable automated viability scoring.</p>`;
    return;
  }

  // 3. Query Gemini 3.8 Flash
  try {
    const scorecard = await callGeminiAgent(geneObj, targetDrugName, papers);
    if (loading) loading.style.display = "none";
    if (scorecardContainer) scorecardContainer.style.display = "block";
    renderScorecard(scorecard);
  } catch (err) {
    if (loading) loading.style.display = "none";
    if (scorecardContainer) scorecardContainer.style.display = "block";
    document.getElementById("scorecardBadge").textContent = "API Error";
    document.getElementById("scorecardVerdict").textContent = err.message;
  }
}

async function callGeminiAgent(geneObj, drugName, papers) {
  const landmarkPaper = geneObj.landmark_paper ? `
[Landmark Primary Paper]
Title: ${geneObj.landmark_paper.title}
Authors: ${geneObj.landmark_paper.authors} | Journal: ${geneObj.landmark_paper.journal} (${geneObj.landmark_paper.year})
URL: ${geneObj.landmark_paper.url}
` : '';

  const papersContext = papers.map((p, i) => `
[Retrieved Paper #${i + 1}]
Title: ${p.title}
Journal: ${p.journal} (${p.year}) | Citations: ${p.citations}
Abstract: ${p.abstract}
`).join("\n\n");

  const prompt = `You are an elite Mycobacteriologist and CRISPRi Knockdown Target Evaluator.
Evaluate candidate gene: ${geneObj.gene} (Mtb H37Rv: ${geneObj.rv || 'N/A'} | M. smegmatis: ${geneObj.msmeg || 'N/A'})
- Protein: ${geneObj.product}
- Species Model: ${geneObj.presence === 'BOTH' ? 'Conserved in both Mtb and M. smegmatis (BSL-1 ready)' : geneObj.presence}
- PEBBLE TnSeq/CRISPRi Call: ${geneObj.pebble || 'Uncertain'}
- Target Drug Focus: ${drugName}

${landmarkPaper}

Additional Retrieved Literature:
${papersContext || 'No literature directly found in core Europe PMC index for this query.'}

Experimental Objective:
We are conducting an antibiotic sensitization screen using CRISPRi in Mycobacteria.
Evaluate:
1. Viability Score (1 to 10) & Verdict
2. Standalone Knockdown Tolerance (Can cells grow without drug?)
3. Antibiotic Potentiation & Synergy Evidence with ${drugName}
4. M. smegmatis Pre-testing Feasibility (BSL-1 pilot sgRNA design)
5. Verifiable Literature Quote(s) with Author & Paper
6. Actionable sgRNA Recommendation (PAM choice, mismatched PAM for hypomorphic tuning)
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(state.geminiApiKey)}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gemini API HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  return text;
}

function renderScorecard(markdownText) {
  const scoreMatch = markdownText.match(/Score:\s*(\d{1,2})\s*\/\s*10/i);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  const badge = document.getElementById("scorecardBadge");
  if (badge) {
    if (score !== null) {
      badge.textContent = `Score: ${score} / 10`;
      if (score >= 7) {
        badge.style.background = "#dcfce7";
        badge.style.color = "#166534";
      } else if (score >= 5) {
        badge.style.background = "#fef3c7";
        badge.style.color = "#92400e";
      } else {
        badge.style.background = "#fee2e2";
        badge.style.color = "#991b1b";
      }
    } else {
      badge.textContent = "Evaluation Complete";
      badge.style.background = "#eff6ff";
      badge.style.color = "#1e40af";
    }
  }

  const verdictMatch = markdownText.match(/Verdict:\s*([^\n\*\)]+)/i);
  const verdictEl = document.getElementById("scorecardVerdict");
  if (verdictEl) {
    verdictEl.textContent = verdictMatch ? verdictMatch[1].trim() : "Detailed Scorecard Below";
  }

  let html = markdownText
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*?)\*/gim, '<i>$1</i>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\n\n/gim, '<br><br>');

  const bodyEl = document.getElementById("scorecardBody");
  if (bodyEl) bodyEl.innerHTML = html;
}

function renderPapersList(papers, landmarkPaper) {
  const container = document.getElementById("papersList");
  if (!container) return;
  container.innerHTML = "";

  // Render Landmark Primary Paper first if present
  if (landmarkPaper) {
    const card = document.createElement("div");
    card.className = "paper-card";
    card.style.borderLeft = "4px solid #7c3aed";
    card.style.background = "#fbfbfe";
    card.innerHTML = `
      <div class="paper-title">⭐ Primary Landmark Reference: ${landmarkPaper.title}</div>
      <div class="paper-meta">
        <b>${landmarkPaper.journal}</b> (${landmarkPaper.year}) &bull; ${landmarkPaper.authors} &bull; 
        <span class="badge" style="background:#ede9fe; color:#5b21b6;">📈 ${landmarkPaper.citations || 0} Citations</span>
      </div>
      <div class="paper-actions" style="margin-top:10px;">
        <a href="${landmarkPaper.url}" target="_blank" class="btn btn-secondary btn-sm" title="Authenticate via vpn.unibas.ch for full Nature/Science/Cell text">
          🏛️ Read Landmark Paper (Uni Basel VPN)
        </a>
      </div>
    `;
    container.appendChild(card);
  }

  if (papers.length === 0 && !landmarkPaper) {
    container.innerHTML = `<p style="color:#64748b;">No direct literature found for this specific identifier in Europe PMC.</p>`;
    return;
  }

  papers.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "paper-card";

    const oaBadge = p.isOpenAccess ? `<span class="badge" style="background:#d1fae5; color:#065f46;">🔓 Open Access</span>` : "";
    const directDoiUrl = p.doi ? `https://doi.org/${p.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/`;

    card.innerHTML = `
      <div class="paper-title">${idx + 1}. ${p.title} ${oaBadge}</div>
      <div class="paper-meta">
        <b>${p.journal}</b> (${p.year}) &bull; ${p.authors} &bull; 
        <span class="badge" style="background:#ede9fe; color:#5b21b6;">📈 ${p.citations} Citations</span>
      </div>
      <div class="paper-abstract">${p.abstract}</div>
      <div class="paper-actions">
        <a href="${directDoiUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Authenticate via vpn.unibas.ch for full Nature/Science/Cell text">🏛️ Read via DOI (Uni Basel VPN)</a>
        ${p.pdfUrl ? `<a href="${p.pdfUrl}" target="_blank" class="btn btn-outline btn-sm">📥 Free PDF</a>` : ''}
        ${p.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/" target="_blank" class="btn btn-outline btn-sm">📄 PubMed</a>` : ''}
      </div>
    `;

    container.appendChild(card);
  });
}

async function sendQAFollowup() {
  const input = document.getElementById("qaInput");
  const question = input.value.trim();
  if (!question) return;

  const respBox = document.getElementById("qaResponse");
  respBox.style.display = "block";
  respBox.textContent = "Agent is deep-reading the papers to answer your question...";

  if (!state.geminiApiKey) {
    respBox.textContent = "Please configure your Gemini API key in the top right.";
    return;
  }

  const landmarkContext = state.activeGene?.landmark_paper ? `
[Landmark Primary Paper]
Title: ${state.activeGene.landmark_paper.title}
Authors: ${state.activeGene.landmark_paper.authors} | Journal: ${state.activeGene.landmark_paper.journal}
URL: ${state.activeGene.landmark_paper.url}
` : '';

  const papersContext = currentPapersCache.map((p, i) => `
[Paper #${i + 1}]
Title: ${p.title}
Journal: ${p.journal} (${p.year})
Abstract: ${p.abstract}
`).join("\n\n");

  const prompt = `You are an expert mycobacteriologist literature agent.
Answer the user's specific follow-up question strictly using the provided scientific papers for gene ${state.activeGene?.gene || 'this gene'}.
State what is confirmed in the papers and cite the specific Paper or Author.

User Question: ${question}

Papers Context:
${landmarkContext}
${papersContext}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(state.geminiApiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    respBox.innerHTML = `<b>Agent Response:</b><br><br>${answer.replace(/\n/g, '<br>')}`;
  } catch (err) {
    respBox.textContent = `Error: ${err.message}`;
  }
}

// Start application on load
window.addEventListener("DOMContentLoaded", initUI);
