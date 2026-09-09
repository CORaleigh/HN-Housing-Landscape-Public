/* =============================================================================
 * City of Raleigh — Housing Production Dashboard
 * SHARED configuration — identical for the External and Internal builds.
 *
 * Everything in this file is safe to publish. Anything that differs between the
 * two dashboards (layer URLs, PII field names, on-screen copy) lives in
 * config.external.js / config.internal.js instead.
 *
 * At deploy time exactly one variant is copied in as `config.js`, which is what
 * index.html imports. See build.ps1.
 * ============================================================================= */

/* --- City of Raleigh brand tokens ------------------------------------------ */
export const BRAND = {
  raleighGreen: "#0D6937",
  leafGreen:    "#73AB45",
  midGreen:     "#4C8C40",
  chartreuse:   "#A8C23E",
  teal:         "#189ABC",
  navy:         "#01426A",
  amber:        "#FBAE40",
  rust:         "#A8322D",
  bodyText:     "#414042",
  border:       "#BFBFBF",
  lightFill:    "#F2F2F2",
  greenTint:    "#DAEFD3",
  greenTintAlt: "#F3F9EF",
  white:        "#FFFFFF",
};

/* --- AGOL org + source web map --------------------------------------------- */
export const ORG = "https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services";
export const WEBMAP_ID = "f0787de35a2e4f44bb1c717cbc12683e";

/* --- ArcGIS sign-in --------------------------------------------------------- *
 * Anonymous by default. The Internal build overrides this once an AGOL App ID
 * is registered, which is what lets it read layers that are not shared publicly.
 * appId: null  ->  no sign-in attempted (fine while the layers are public).     */
export const AUTH = {
  appId: null,
  portalUrl: "https://www.arcgis.com",
};

/* --- Map defaults ----------------------------------------------------------- */
export const MAP = {
  basemap: "community",   // "community" (matches web map) | "osm"
  communityStyleUrl: "https://www.arcgis.com/sharing/rest/content/items/188219e2c8e44fe780c2fd3b3bb021f6/resources/styles/root.json",
  center: [-78.6382, 35.7796],   // downtown Raleigh
  zoom: 11,
};

/* --- Housing Development layer --------------------------------------------- *
 * Project-level, not resident-level — no PII, so BOTH builds use the same
 * (real) layer. Only the three resident-level programs differ by build.        */
export const DEV_LAYER = {
  id: "housing_development",
  title: "City Housing Development",
  url: `${ORG}/Housing_Production_Tracker_Housing_Development_Layer/FeatureServer/9`,
  kind: "dev",
  visible: true,
  showOnMap: true,
};

/* Aggregate SUMMARY TABLE — authoritative source for the dashboard charts. */
export const SUMMARY_TABLE = {
  url: `${ORG}/Housing_Production_Tracker_Housing_Production_Tracker/FeatureServer/0`,
  fields: {
    fiscalYear:  "Fiscal_Year",
    endYear:     "End_Year",
    quarter:     "Quarter",
    quarterFY:   "QuarterFY",
    total:       "Total_Complete",
    dateUpdated: "Date_updated",
    hdPipeline:  "Housing_Development_Pipeline",
    hrPipeline:  "Homeowner_Rehab_Pipeline",
  },
  categories: [
    { field: "Housing_Development_New_Construction", label: "New construction",      color: BRAND.raleighGreen },
    { field: "Housing_Development_Preservation",     label: "Preserved",             color: BRAND.leafGreen },
    { field: "Homeowner_Rehabs",                     label: "Home repair",           color: BRAND.chartreuse },
    { field: "Homebuyer_Assistance",                 label: "Homebuyer assistance",  color: BRAND.teal },
    /* The label stays "Other housing impact", but the note has to describe what
     * the number actually is. In the source it is the "Home ownership" column of
     * HN's 5700 Unit Productions sheet, and HN's own detail tab defines it as
     * housing supported by being built on previously city-owned land. The old
     * note called it "a community program we no longer track", which is not the
     * same thing.
     *
     * Careful with "no longer tracked". It is HN's Goal 1 SUMMARY tab that has
     * no column for this, which is why the dashboard shows 0 for FY26. The
     * FY26-FY30 tracker itself does still carry a Homeownership Units column on
     * its Housing Development tab; it is populated on exactly one row, 14 units
     * on a project that is Under Construction. So do not claim the total is
     * closed forever. Say only that the summary does not carry the category. */
    { field: "Other_Housing_Impact",                 label: "Other housing impact",  color: BRAND.amber,
      note: "Homeownership units supported by being built on previously city-owned land, counted from FY 2015-2016 through FY 2024-2025. The FY 2026-FY 2030 production summary does not carry this category, so no new units are being added to it here." },
  ],
};

/* Field-name map for the Housing Development layer (map filters + popups). */
export const DEV_FIELDS = {
  project:        "Project",
  developer:      "Developer",
  address:        "Main_Address",
  status:         "Status",
  projectStatus:  "Project_Status",
  fiscalYear:     "Fiscal_Year",
  totalUnits:     "Total_Units",
  homeownership:  "Homeownership_Units",
  population:     "Population",
  construction:   "Construction_Type",
  developmentType:"Development_Type",
  council:        "Council_District",
  ncod:           "OLAY_NAME",
  loanAmount:     "City_of_Raleigh_Loan_Amount",
  coDate:         "CO_Date",
  fundingSource:  "Funding_Source",
  unrestricted:   "Unrestricted_Units",
  amiBands: [
    ["Units_20_pct_AMI", "≤20%", "#01426A"],
    ["Units_30_pct_AMI", "30%",  "#189ABC"],
    ["Units_40_pct_AMI", "40%",  "#4C8C40"],
    ["Units_50_pct_AMI", "50%",  "#73AB45"],
    ["Units_60_pct_AMI", "60%",  "#A8C23E"],
    ["Units_70_pct_AMI", "70%",  "#FBAE40"],
    ["Units_80_pct_AMI", "80%",  "#E07B39"],
  ],
  fundingAmounts: [
    ["Local",                                  "Local"],
    ["f_2020_Bond",                            "2020 Bond"],
    ["HOME",                                   "HOME"],
    ["Community_Development_Block_Grant_CDBG",  "CDBG"],
    ["Dedicated_Affordable_Housing_Fund_DAHF",  "Dedicated Affordable Housing Fund (DAHF)"],
    ["Other",                                  "Other (CDBG, ERA2, etc.)"],
  ],
};

/* --- City funding sources (map filter) -------------------------------------
 * One entry per fundable source. `field` is the broken-out amount column and
 * `values` are the exact Funding_Source text values that mean the same source,
 * so a record matches if EITHER carries it. A row can be tagged "Multiple" in
 * Funding_Source, which says nothing on its own — hence "Multiple" is
 * deliberately absent here; those rows are matched through `field` instead.
 *
 * The same column is typed differently across layers (some are String where a
 * column happened to be empty at publish). applyFilters checks each layer's
 * real field type and drops the numeric half of the test where it would be
 * invalid, so a mistyped column degrades to a text-only match rather than
 * erroring the whole query.                                                  */
export const FUNDING_SOURCES = [
  { label: "Local",     field: "Local",                                  values: ["Local"] },
  { label: "2020 Bond", field: "f_2020_Bond",                            values: ["2020 Bond"] },
  { label: "HOME",      field: "HOME",                                   values: ["HOME"] },
  { label: "CDBG",      field: "Community_Development_Block_Grant_CDBG", values: ["Community Development Block Grant (CDBG)"] },
  { label: "DAHF",      field: "Dedicated_Affordable_Housing_Fund_DAHF", values: ["Dedicated Affordable Housing Fund (DAHF)"] },
  { label: "Other",     field: "Other",                                  values: ["Other"] },
];

/* --- Resident-level field maps --------------------------------------------- *
 * These are the fields present on BOTH the de-identified and the real layers.
 * The Internal build spreads extra PII keys (borrower, address, …) on top; the
 * popup code renders those rows only when the key exists, so the External build
 * needs no mode check — the field simply isn't there.                          */
export const REHAB_FIELDS_BASE = {
  fiscalYear: "Fiscal_Year", rehabType: "Rehab_Type", totalUnits: "Total_Units",
  ami: "AMI", status: "Status", projectStatus: "Project_Status",
  loanAmount: "City_of_Raleigh_Loan_Amount", fundingSource: "Funding_Source",
  council: "Council_District", ncod: "OLAY_NAME", note: "Note",
  amiBands: ["Units_20_pct_AMI","Units_30_pct_AMI","Units_40_pct_AMI","Units_50_pct_AMI","Units_60_pct_AMI","Units_70_pct_AMI","Units_80_pct_AMI"],
};
export const HBA_FIELDS_BASE = {
  fiscalYear: "Fiscal_Year", totalUnits: "Total_Units", ami: "AMI",
  projectStatus: "Project_Status",
  loanAmount: "City_of_Raleigh_Loan_Amount", fundingSource: "Funding_Source",
  council: "Council_District", ncod: "OLAY_NAME",
  amiBands: ["Units_20_pct_AMI","Units_30_pct_AMI","Units_40_pct_AMI","Units_50_pct_AMI","Units_60_pct_AMI","Units_70_pct_AMI","Units_80_pct_AMI"],
};
export const OTHER_FIELDS_BASE = {
  fiscalYear: "Fiscal_Year", totalUnits: "Total_Units", status: "Status",
  projectStatus: "Project_Status", notes: "Notes",
  council: "Council_District", ncod: "OLAY_NAME",
};

/* --- HUD / non-City subsidized housing (live HUD services) ----------------- *
 * `extra` here is the PUBLIC-facing field set. The Internal build appends more
 * detail per layer (see config.internal.js).                                   */
export const HUD_BASE = "https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services";
export const WAKE = "STATE2KX='37' AND CURCNTY_NM LIKE 'Wake%'";

/* HUD stores authority names in full federal form. Shorten them for display.
 * This layer is NOT all RHA — 12 of the 15 Wake records are the Raleigh
 * authority and 3 are the county's (Garner / Wake Forest / Wendell), which is
 * why the layer keeps its "(incl. RHA)" name and the popup names the specific
 * authority. Values not listed fall through unchanged, so an authority that
 * appears later still shows its real name rather than being dropped.          */
export const HOUSING_AUTHORITY_LABELS = {
  "Housing Authority of the City of Raleigh": "Raleigh Housing Authority (RHA)",
  "Housing Authority of the County of Wake":  "Wake County Housing Authority",
};

export const HUD_LAYERS_BASE = [
  {
    id: "hud_public_housing",
    /* Must stay identical to this layer's legend entry in index.html — the same
     * string is the filter toggle label, so a mismatch reads as two layers.    */
    title: "HUD Public Housing properties",
    url: `${HUD_BASE}/Public_Housing_Developments/FeatureServer/0`,
    where: WAKE, style: "square", color: "#01426A",
    /* Unit counts are deliberately off this popup: `units` is null so no "Units"
     * row renders, and ACC units is not in `extra`. Housing authority stays. */
    name: ["PROJECT_NAME", "FORMAL_PARTICIPANT_NAME"], addr: ["STD_ADDR", "STD_CITY"], units: null,
    extra: [["Housing authority", "FORMAL_PARTICIPANT_NAME", HOUSING_AUTHORITY_LABELS]],
    visible: false,
  },
  {
    id: "hud_mf_assisted",
    title: "Multifamily Assisted (Section 8, 202, 811)",
    url: `${HUD_BASE}/Multifamily_Properties_Assisted/FeatureServer/0`,
    where: WAKE, style: "diamond", color: "#189ABC",
    /* Unit counts are deliberately off this popup as well — neither assisted
     * units nor total units render. Category stays. */
    name: ["PROPERTY_NAME_TEXT"], addr: ["ADDRESS_LINE1_TEXT", "PLACED_BASE_CITY_NAME_TEXT"], units: null,
    extra: [["Category", "PROPERTY_CATEGORY_NAME"]],
    visible: false,
  },
  {
    id: "hud_lihtc",
    title: "Low Income Housing Tax Credit properties (LIHTC)",
    url: `${HUD_BASE}/LIHTC/FeatureServer/0`,
    where: "PROJ_ST='NC' AND CURCNTY_NM LIKE 'Wake%'", style: "triangle", color: "#FBAE40",
    name: ["PROJECT"], addr: ["PROJ_ADD", "PROJ_CTY"], units: null,
    extra: [["Year placed in service", "YR_PIS"]],
    visible: false,
  },
  {
    id: "hud_insured_mf",
    title: "HUD-Insured Multifamily",
    url: `${HUD_BASE}/HUD_Insured_Multifamily_Properties/FeatureServer/0`,
    /* Not rust — the BRT reference layer below is #A8322D, and two rust symbols
     * on the map at once are indistinguishable. #99bbff matches the "Not
     * specified" slice in the funding pie. This is a stroke-only "x", so the
     * colour is applied to the outline rather than the fill (see hudMarker).    */
    where: WAKE, style: "x", color: "#99bbff",
    name: ["PROPERTY_NAME_TEXT"], addr: ["ADDRESS_LINE1_TEXT", "PLACED_BASE_CITY_NAME_TEXT"], units: "MAXIMUM_CONTRACT_UNIT_COUNT",
    extra: [["Program", "PROGRAM_TYPE1"]],
    visible: false,
  },
];

/* --- Reference / boundary layers (live City services) ---------------------- */
export const REFERENCE_LAYERS = [
  {
    /* `localData` -> shipped as GeoJSON in this repo rather than fetched from
     * `url`. maps.raleighnc.gov is blocked at the browser level for at least
     * some clients when the page is served from the public GitHub Pages
     * domain, so both boundary layers silently failed to load on the live site
     * while working from localhost. `url` is kept as the provenance record and
     * is what refresh_boundary_data.py re-pulls from.
     *
     * minScale/maxScale: 0 = no restriction either direction, explicit rather
     * than relying on whatever the source service happens to publish -- per
     * 2026-08-12 request, both boundary layers must render at any zoom. */
    id: "council_districts", title: "City Council Districts", type: "feature",
    url: "https://maps.raleighnc.gov/arcgis/rest/services/Boundaries/MapServer/2",
    localData: "./council_districts.geojson",
    kind: "boundary", color: "#01426A", labelField: "COUNCIL_DIST", visible: true,
    minScale: 0, maxScale: 0,
  },
  {
    /* The source service publishes minScale: 76800 (only draws once zoomed in
     * closer than ~1:76,800) — the app opens around 1:288,895, so checking this
     * box did nothing and looked broken. Only 26 polygons citywide, so drawing
     * them at every zoom isn't cluttered; overridden to 0 below. */
    id: "ncods", title: "Neighborhood Conservation Overlay Districts (NCODs)", type: "feature",
    url: "https://maps.raleighnc.gov/arcgis/rest/services/Planning/Overlays/MapServer/9",
    localData: "./ncods.geojson",
    kind: "boundary", color: "#189ABC", labelField: "OLAY_NAME", visible: false,
    minScale: 0, maxScale: 0,
  },
  {
    id: "transit_routes", title: "Transit Routes (GoRaleigh)", type: "feature",
    url: "https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/GoRaleigh_Routes/FeatureServer/0",
    kind: "transit", color: "#73AB45", width: 1.5, visible: false,
  },
  {
    id: "brt", title: "Bus Rapid Transit corridors (Wake BRT)", type: "feature",
    url: "https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Bus_Rapid_Transit_Corridors/FeatureServer/0",
    kind: "transit", color: "#A8322D", width: 4, labelField: "Name", visible: false,
  },
  /* ---- Census (ACS) choropleths ------------------------------------------
   * Both layers are Esri "Living Atlas" ACS views published by esri_demographics.
   * They share the same tract geometry and GEOID, so they line up exactly, but
   * they are two separate services and therefore two separate toggles.
   *
   * TRACT, not block group. The previous layer here
   * (RaleighBlockGroups_2014_2018_AllFields) was block group, but it mixed ACS
   * 2014-2018 tenure percentages with Esri MODELLED current-year estimates
   * (the _CY fields), and it carried no cost-burden data at all. These layers
   * are wholly ACS tabulations. The cost is resolution: Raleigh is 293 block
   * groups but only 119 tracts, roughly 2.5 to 1, so the map reads smoother and
   * small-area contrasts around individual projects get averaged away.
   *
   * Both are "(Latest)" views, meaning Esri repoints them at each new ACS
   * 5-year release. Field NAMES are stable (they are census table codes) but the
   * VINTAGE moves without warning, which is why the panel note reads the year
   * from the service instead of hardcoding it.
   *
   * Both are national. `where` is REQUIRED: without it these are ~85,000-tract
   * queries per indicator.
   *
   * `ratio` indicators declare their numerator and denominator fields once;
   * index.html generates BOTH the Arcade valueExpression that draws the map and
   * the JavaScript that computes class breaks from that one declaration, so the
   * two can never drift apart.
   */
  {
    id: "acs_housing", title: "ACS Housing Characteristics (by census tract)", type: "feature",
    url: "https://P3ePLMYs2RVChkJx.svcs.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Population_and_Housing_Basics_View_Boundaries/FeatureServer/2",
    kind: "choropleth", defaultIndicator: "pct_owner_occ",
    where: "State = 'North Carolina' AND County = 'Wake County'",
    indicators: [
      { id: "pct_owner_occ",    label: "Owner-Occupied Share of Occupied Units",  field: "B25003_calc_pctOwnE", format: "percent" },
      { id: "pct_renter_occ",   label: "Renter-Occupied Share of Occupied Units", format: "percent",
        ratio: { num: ["B25003_003E"], den: ["B25003_001E"] } },
      { id: "renter_units",     label: "Renter-Occupied Housing Units (count)",   field: "B25003_003E", format: "number" },
      { id: "median_hh_income", label: "Median Household Income",                 field: "B19049_001E", format: "currency" },
      { id: "median_home_value",label: "Median Home Value (owner-occupied)",      field: "B25077_001E", format: "currency" },
      /* CONTRACT rent, not gross rent: this is the rent charged to the tenant
       * and it EXCLUDES tenant-paid utilities. No ACS Living Atlas layer
       * publishes median GROSS rent, so the label must keep saying contract.
       * Note the cost-burden layer below IS computed on gross rent (B25070), so
       * rent level and rent burden here rest on different bases. */
      { id: "median_contract_rent", label: "Median Contract Rent (excludes utilities)", field: "B25058_001E", format: "currency" },
      { id: "pct_vacant",       label: "Vacant Share of All Housing Units",       format: "percent",
        ratio: { num: ["B25002_003E"], den: ["B25002_001E"] } },
    ],
    tableFields: ["GEOID", "NAME", "County"],
    ramp: ["#F3F9EF", "#DAEFD3", "#A8C23E", "#73AB45", "#4C8C40", "#0D6937"],
    visible: false,
  },
  {
    id: "acs_cost_burden", title: "ACS Housing Cost Burden (by census tract)", type: "feature",
    url: "https://P3ePLMYs2RVChkJx.svcs.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Housing_Costs_View_Boundaries/FeatureServer/2",
    kind: "choropleth", defaultIndicator: "pct_renter_cb",
    where: "State = 'North Carolina' AND County = 'Wake County'",
    indicators: [
      /* Esri's own B25070_calc_pctGE30pctE divides by B25070_001E, which
       * INCLUDES the "not computed" households (B25070_011E): renters whose
       * rent-to-income ratio the Census could not calculate, mostly zero or
       * negative reported income. Verified against all 230 Wake County tracts,
       * 0 mismatches against that formula. Including them in the base deflates
       * the rate. Median effect countywide is only 0.84 points, but the tail is
       * severe: tract 37183053804 reads 33.8% from Esri's field versus 80.0%
       * with "not computed" excluded, because 41 of its 71 renter households are
       * uncomputable. So we exclude them, which is also how HUD reports it. */
      /* minDen: a rate needs a base to mean anything. Wake tract 37183053901
       * has SIX renter households and all six are burdened, so it renders 100%
       * and lands in the darkest class next to tracts with 800 renters. Verified
       * on the live service: 37183053006 is 33 of 33, 37183980100 is 5 of 5.
       * Below 30 households the map shows the tract as suppressed and the table
       * says how many households there actually were. */
      { id: "pct_renter_cb", label: "Renter Households Paying 30%+ of Income on Housing", format: "percent",
        ratio: { num: ["B25070_007E", "B25070_008E", "B25070_009E", "B25070_010E"],
                 den: ["B25070_001E"], denMinus: ["B25070_011E"], minDen: 30 } },
      /* There is NO all-owner cost-burden field. B25091 splits owners into
       * with-mortgage and without-mortgage and Esri publishes a percentage for
       * each half separately, against its own half as denominator (verified).
       * The halves diverge widely (one Wake tract: 13.1% with a mortgage, 29.9%
       * without), so neither can stand in for "owners". Combine the two COUNTS
       * over all owner households instead. B25091_002E + B25091_013E equals
       * B25091_001E in all 230 tracts, so the two parts are exhaustive. _012E
       * and _023E are the two "not computed" cells, excluded to match the renter
       * metric above; countywide they are only 0.54% of owners. */
      { id: "pct_owner_cb", label: "Owner Households Paying 30%+ of Income on Housing", format: "percent",
        ratio: { num: ["B25091_calc_numMortGE30pctE", "B25091_calc_numNoMortGE30pctE"],
                 den: ["B25091_001E"], denMinus: ["B25091_012E", "B25091_023E"], minDen: 30 } },
      /* SEVERE burden, 50%+ of income. Same denominators as the 30%+ pair above
       * so the two read as a nested pair rather than two unrelated rates. Esri
       * publishes no calc field for either, but the underlying cells are there:
       * B25070_010E is the renter 50%+ cell, and B25091_011E / B25091_022E are
       * the owner 50%+ cells for with- and without-mortgage households. */
      { id: "pct_renter_scb", label: "Renter Households Paying 50%+ of Income on Housing", format: "percent",
        ratio: { num: ["B25070_010E"],
                 den: ["B25070_001E"], denMinus: ["B25070_011E"], minDen: 30 } },
      { id: "pct_owner_scb", label: "Owner Households Paying 50%+ of Income on Housing", format: "percent",
        ratio: { num: ["B25091_011E", "B25091_022E"],
                 den: ["B25091_001E"], denMinus: ["B25091_012E", "B25091_023E"], minDen: 30 } },
    ],
    tableFields: ["GEOID", "NAME", "County"],
    /* Warm ramp, deliberately not the green used above: on this layer a high
     * value is a bad outcome, and reusing the "more is greener" ramp would read
     * as the opposite. */
    ramp: ["#FDF3EF", "#FBDFD3", "#F3B49B", "#E07B5C", "#C4502F", "#A8322D"],
    visible: false,
  },
];

/* --- Remote data sources for the chart sections -----------------------------
 * The three bond fetches used to be hardcoded URLs inside index.html, which
 * meant a build could not point them anywhere else. They live here now.
 *
 * `adaptRows` is the hook that lets a build read a DIFFERENTLY SHAPED table
 * without touching the page: it receives the raw attribute rows and returns
 * rows in the shape the charts already expect. Null here, because these are the
 * original tables and they are already in that shape.                          */
export const DATA_SOURCES = {
  summary: {
    url: SUMMARY_TABLE.url,
    query: `where=1%3D1&outFields=*&orderByFields=${SUMMARY_TABLE.fields.endYear},${SUMMARY_TABLE.fields.quarter}&returnGeometry=false&f=json`,
    adaptRows: null,
  },
  bondTotals: {
    url: `${ORG}/f_2020_Bond_Tracker_Bond_2020_Totals/FeatureServer/0`,
    query: "where=1%3D1&outFields=Bond_2020_Category,Fiscal_Year,End_Year,Total_Units,Funds_Available,Funds_Committed&orderByFields=End_Year&returnGeometry=false&f=json",
    adaptRows: null,
  },
  bondUnits: {
    url: `${ORG}/f_2020_Bond_Tracker_Bond_2020_Totals/FeatureServer/0`,
    query: "where=1%3D1&outFields=Bond_2020_Category,Total_Units&returnGeometry=false&f=json",
    adaptRows: null,
  },
  bondProjects: {
    url: `${ORG}/f_2020_Bond_Tracker_Housing_Development_2020/FeatureServer/0`,
    query: "where=1%3D1&outFields=*&returnGeometry=false&f=json",
    adaptRows: null,
  },
};
