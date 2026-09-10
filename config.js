/* =============================================================================
 * PUBLIC build for the City of Raleigh GitHub organisation
 * https://CORaleigh.github.io/HN-Housing-Landscape-Public/
 *
 * A second public dashboard that reads ONLY the seven HN_ services published on
 * 9 September 2026 from Dashboard Tables ALL (authoritative).xlsx. It does not
 * touch any of the layers the existing dashboards use, so both can run at once.
 *
 * What is different from the older public build, and why:
 *
 *  1. The development layer is HN_City_Housing_Development, not the tracker
 *     layer. 79 points instead of 78, because 3800 Polly Street was missing from
 *     the old one, and every point is geocoded and district-checked.
 *
 *  2. Funding is broken out by REAL fund. The old layer had no Penny (736) and
 *     no Program Income (724) field, so Penny money sat in the DAHF field. That
 *     is corrected here, which is why the fund field names all change.
 *
 *  3. The three resident-level programmes are gone from the map entirely. The
 *     old public build carried de-identified point layers for them and hid them
 *     with showOnMap:false so the charts could still query them. Those charts
 *     now read HN_Production_By_Year instead, so the layers are not needed at
 *     all and no resident-level data is loaded by this page.
 *
 *  4. The chart tables are shaped differently from the ones the page was written
 *     against, so each source carries an `adaptRows` function. Reshaping happens
 *     here; index.html is shared with the other builds and stays generic.
 * ============================================================================= */

import {
  BRAND, ORG, SUMMARY_TABLE as SUMMARY_BASE, DEV_FIELDS as DEV_FIELDS_BASE,
  REHAB_FIELDS_BASE, HBA_FIELDS_BASE, OTHER_FIELDS_BASE, HUD_LAYERS_BASE,
} from "./config.base.js";

export * from "./config.base.js";

export const MODE = "public-coraleigh";

/* The page imports these four names whatever the build. No resident-level layer
 * is loaded here, so the three programme field maps describe nothing on screen;
 * they are exported only so the module contract holds. HUD reference layers are
 * unchanged, they are Esri's national layers rather than ours.                  */
export const REHAB_FIELDS = { ...REHAB_FIELDS_BASE };
export const HBA_FIELDS   = { ...HBA_FIELDS_BASE };
export const OTHER_FIELDS = { ...OTHER_FIELDS_BASE };
export const HUD_LAYERS   = HUD_LAYERS_BASE;

/* Anonymous. Every HN_ service is shared publicly, verified 9 September 2026. */
export const AUTH = { appId: null, portalUrl: "https://www.arcgis.com" };

/* --- The one mapped layer --------------------------------------------------- */
export const DEV_LAYER = {
  id: "housing_development",
  title: "City Housing Development",
  url: `${ORG}/HN_City_Housing_Development/FeatureServer/0`,
  kind: "dev",
  visible: true,
  showOnMap: true,
};

export const HOUSING_LAYERS = [DEV_LAYER];

/* --- Field map for that layer ----------------------------------------------- *
 * Same keys as the base build so the popup and filter code is unchanged. Two
 * real differences: the fund columns are per fund, and there is no overlay name
 * field, because a neighbourhood overlay name is a spatial join result rather
 * than something the source records.                                            */
export const DEV_FIELDS = {
  ...DEV_FIELDS_BASE,
  ncod: null,
  /* Units produced in the fiscal year, which is how the department counts and
   * how the tables above count. Total_Units is the finished building's size, and
   * the source leaves it blank on nine completed rows. */
  unitsCounted: "Units_Counted_This_Fiscal_Year",
  /* DAHF is not listed. Housing confirmed on 9 September 2026 that DAHF and Penny
   * are the same source, so the money is all in Penny_736 and a separate DAHF row
   * would show one fund twice under two names. The field still exists on the
   * service, always empty, so the schema does not shift under anything reading it.
   * The label carries both names so a reader looking for DAHF finds it.        */
  fundingAmounts: [
    ["Penny_736",          "Penny for Housing / DAHF (736)"],
    ["Program_Income_724", "Program Income (724)"],
    ["Bond_2020_726",      "2020 Bond (726)"],
    ["Bond_Prior_To_2020", "Earlier housing bond"],
    ["HOME_751",           "HOME (751)"],
    ["CDBG",               "CDBG"],
    ["Other",              "Other"],
    ["Unspecified",        "Fund not recorded in the source"],
  ],
};

/* Map filter. `values` still matches the Funding_Source text where a layer
 * carries one, but on this layer the amount columns are the reliable test.     */
export const FUNDING_SOURCES = [
  /* One entry per real fund. DAHF folds into Penny, per Housing on 9 September
   * 2026, so filtering on Penny returns the DAHF-funded projects too. A separate
   * DAHF filter would have matched nothing. */
  { label: "Penny for Housing / DAHF", field: "Penny_736",          values: ["Dedicated Affordable Housing Fund (DAHF)"] },
  { label: "Program Income",           field: "Program_Income_724", values: [] },
  { label: "2020 Bond",                field: "Bond_2020_726",      values: ["2020 Bond"] },
  { label: "Earlier bond",             field: "Bond_Prior_To_2020", values: [] },
  { label: "HOME",                     field: "HOME_751",           values: ["HOME"] },
  { label: "CDBG",                     field: "CDBG",               values: ["Community Development Block Grant (CDBG)"] },
  { label: "Other",                    field: "Other",              values: ["Other"] },
];

/* --- Production summary ----------------------------------------------------- *
 * HN_Production_By_Year is one row per fiscal year PER CATEGORY. The charts were
 * written against one row per year with a column per category, so the adapter
 * pivots. Keeping the old column names means every chart, tile and table below
 * needs no change at all.                                                       */
const CAT_TO_FIELD = {
  "New construction":     "Housing_Development_New_Construction",
  "Preserved":            "Housing_Development_Preservation",
  "Home repair":          "Homeowner_Rehabs",
  "Homebuyer assistance": "Homebuyer_Assistance",
  "Other housing impact": "Other_Housing_Impact",
};

export const SUMMARY_TABLE = {
  ...SUMMARY_BASE,
  url: `${ORG}/HN_Production_By_Year/FeatureServer/0`,
};

const pivotProduction = (rows) => {
  const byYear = new Map();
  rows.forEach((r) => {
    const end = Number(r.Fiscal_Year_End) || 0;
    if (!end) return;
    if (!byYear.has(end)) {
      byYear.set(end, {
        Fiscal_Year: r.Fiscal_Year_Label || r.Fiscal_Year,
        End_Year: end,
        Quarter: "All",
        QuarterFY: "Combined or YE",
        Date_updated: null,
        Total_Complete: 0,
        Housing_Development_Pipeline: 0,
        Homeowner_Rehab_Pipeline: 0,
      });
    }
    const row = byYear.get(end);
    const f = CAT_TO_FIELD[String(r.Category || "").trim()];
    if (!f) return;
    const n = Number(r.Units) || 0;
    row[f] = (row[f] || 0) + n;
    row.Total_Complete += n;
  });
  return [...byYear.values()].sort((a, b) => a.End_Year - b.End_Year);
};

/* --- Bond sources ----------------------------------------------------------- *
 * Three separate tables now, where the old build had one. Each adapter renames
 * to the column names the page expects; no number is altered.                   */
const bondCat = (r) => r.Bond_Category_Published || r.Bond_Category;

export const DATA_SOURCES = {
  summary: {
    url: `${ORG}/HN_Production_By_Year/FeatureServer/0`,
    query: "where=1%3D1&outFields=*&orderByFields=Fiscal_Year_End&returnGeometry=false&f=json",
    adaptRows: pivotProduction,
  },
  bondTotals: {
    url: `${ORG}/HN_Bond_Category_Totals/FeatureServer/0`,
    query: "where=1%3D1&outFields=*&returnGeometry=false&f=json",
    /* Drop the TOTAL row: the page sums the category rows itself, so leaving it
     * in would double every bond figure on screen. */
    adaptRows: (rows) => rows
      .filter((r) => String(r.Bond_Category || "").trim().toUpperCase() !== "TOTAL")
      .map((r) => ({
        Bond_2020_Category: r.Bond_Category,
        Total_Units: Number(r.Total_Units) || 0,
        Funds_Available: Number(r.Budget) || 0,
        Funds_Committed: Number(r.Funds_Committed) || 0,
      })),
  },
  bondUnits: {
    url: `${ORG}/HN_Bond_Category_Totals/FeatureServer/0`,
    query: "where=1%3D1&outFields=Bond_Category,Total_Units&returnGeometry=false&f=json",
    adaptRows: (rows) => rows
      .filter((r) => String(r.Bond_Category || "").trim().toUpperCase() !== "TOTAL")
      .map((r) => ({
        Bond_2020_Category: r.Bond_Category,
        Total_Units: Number(r.Total_Units) || 0,
      })),
  },
  /* Fixes two things the map-layer sum got wrong. Home Repair and Homebuyer
   * Assistance are not layers on this map, so filtering to either of them
   * produced an empty chart. And the layer sum counted FY2025-2026 pipeline
   * money that no earlier year includes, which made the latest bar tower over
   * the rest for a reason that is a change of method rather than of spending.
   * Include_In_Chart marks the rows that share the older completed-only basis. */
  fundingByYear: {
    url: `${ORG}/HN_Funding_By_Year/FeatureServer/0`,
    query: "where=1%3D1&outFields=*&orderByFields=Fiscal_Year_End&returnGeometry=false&f=json",
    /* Every row comes through, including the ones the chart leaves out. The
     * page needs them to say, in figures, what the newer basis would have
     * shown, which is the whole point of the note under the chart. */
    adaptRows: (rows) => rows.map((r) => ({
      program: r.Program,
      fiscalYear: r.Fiscal_Year_Label || r.Fiscal_Year,
      amount: Number(r.City_Funding) || 0,
      records: Number(r.Records) || 0,
      basis: r.Construction_Basis,
      inChart: String(r.Include_In_Chart || "").trim() === "Yes",
    })),
  },
  bondProjects: {
    url: `${ORG}/HN_Bond_Projects/FeatureServer/0`,
    query: "where=1%3D1&outFields=*&returnGeometry=false&f=json",
    adaptRows: (rows) => rows.map((r) => ({
      Project: r.Project,
      Status: r.Project_Status || r.Construction_Status,
      Bond_2020_Category: bondCat(r),
      Total_Units: Number(r.Units_Counted_In_Category) || 0,
      Funds_Committed: Number(r.Funds_Committed) || 0,
      Fiscal_Year: r.Fiscal_Year_Funded,
      End_Year: Number(r.Fiscal_Year_End) || null,
      Developer: r.Developer,
      Council_District: r.Council_District,
    })),
  },
};

/* --- On-screen copy --------------------------------------------------------- */
export const UI = {
  docTitle: "Raleigh Housing Landscape | Public Dashboard",
  versionLabel: "Public version",
  versionKind: "public",
  showSourceNotes: false,
  showPipelineFinancials: false,

  citywideCaveatHtml:
    "The data feeding this dashboard and the below tables are updated quarterly. " +
    "The latest update reflects the Housing and Community Development Department's " +
    "production data from FY 2015-2016 through the end of Quarter 4 Fiscal Year 2025-2026 (June 30, 2026).",

  dataNotesHtml:
    'AMI affordability breakdowns show only for <strong>Complete</strong> development ' +
    'projects (per HCD rules). City funding is broken out by the fund that paid for it; ' +
    'where the source records a single figure without naming a fund, it is shown as ' +
    '<strong>Fund not recorded in the source</strong> rather than assigned to a fund. ' +
    'Mapped point counts are geometry and <strong>do not reconcile</strong> to the ' +
    'production totals in the charts below.',

  deidNote: "",

  /* --- City housing by geography ------------------------------------------
   * Three things, all consequences of this build mapping one layer.
   *
   * The NCOD overlay filter is off. A neighbourhood overlay name is a spatial
   * join result rather than anything a source records, so this layer has no such
   * field and the filter offered a single empty option.
   *
   * "(mapped)" is dropped from the tile labels and the chart title. It was there
   * to warn that these were point counts rather than the tracker's reported
   * totals, a contrast that only makes sense when several programmes are drawn
   * side by side.
   *
   * Home Repair, Homebuyer Assistance and Other Housing Impact are omitted
   * rather than drawn as zero. Checked on 9 September 2026: no council district
   * is recorded for them anywhere in the four authoritative workbooks. The one
   * district column that exists, on the FY26-FY30 Homeowner Repair tab, is empty
   * on all 144 rows. The older dashboard filled this in from de-identified point
   * layers built by geocoding resident addresses, which this build deliberately
   * does not load. Zeros would have read as "none in any district", which is a
   * claim the data does not support.                                          */
  /* --- Copy corrected for this build, 9 September 2026 ---------------------
   * Each of these read as false once the layers changed. Checked against the
   * services and the four authoritative workbooks.                          */

  /* Was: "only reflective of funding sources for the year 2025-2026". Not true
   * any more. 55 of the 79 rows carry a named fund, and 16 of those are before
   * FY2025-2026. What IS still true is that a fund is not named on every older
   * row, which is a different and much smaller claim. */
  fundingFilterNoteHtml:
    "City funding is broken out by fund for every year, not just the current one. " +
    "Where the source records a single figure without naming a fund, the project " +
    "will not match any fund filter.",

  /* Was: a note about several city housing layers and which fields each lacks.
   * This map carries one layer, so the whole comparison described nothing. */
  /* Empty, which hides the note. Everything it said was about the AMI band
   * filter, and that filter is switched off on this build, so the note described
   * a control that is not on the page. Restore it alongside showAmiFilter:
   *   "Selecting multiple AMI levels shows any project with at least one unit in
   *    <strong>any</strong> selected band. A development's AMI breakdown is only
   *    published once the project is <strong>Complete</strong>, so an AMI filter
   *    returns completed projects only."                                       */
  filterScopeNoteHtml: "",

  /* States the total and, more usefully, why it is not the figure a reader has
   * just seen above. {projects} and {units} are filled at render time. */
  completedTableNoteHtml:
    "<strong>{projects} completed development projects, {units} units.</strong> " +
    "City housing development only, so home repair, homebuyer assistance and other " +
    "housing impact are not included; the source does not record those project by " +
    "project. Units are counted in the fiscal year the project was completed, the same " +
    "basis as the tables above, and the total matches the department's own published " +
    "development figure. A dash under Population means the department's records hold no " +
    "population for that project, which is the case for five developments that received " +
    "no city funding.",

  /* Was: "Connected to City of Raleigh services (maps.raleighnc.gov and Raleigh
   * AGOL)". Two of these reference layers are files served with the page, and
   * the census layers are Esri's, not the City's. */
  referenceNoteText:
    "Council districts and overlay districts are drawn from boundary files published "
    + "with this page. Transit layers come from the City's ArcGIS Online. Census layers "
    + "come from Esri's American Community Survey service.",

  /* Was: named the old aggregate tracker and reported a quarterly update date
   * this build's table does not carry. The prototype wording is left exactly as
   * it was; changing a disclaimer is not a data decision. */
  footerHtml:
    "Sources: HN_Production_By_Year, HN_Funding_By_Year, HN_Development_Projects, "
    + "HN_Bond_Category_Totals, HN_Bond_By_Fiscal_Year, HN_Bond_Projects and "
    + "HN_City_Housing_Development, published from the Housing and Community Development "
    + "Department's and Finance's own records. Completed units exclude pipeline. "
    + "Mapped point counts are geometry-derived and will not reconcile to the production "
    + "tables. Prototype (V2) — template for staff use, not an approved public release. "
    + "Brand: City of Raleigh (DesignTeam@raleighnc.gov).",

  sidebarFooterHtml:
    "Prototype (V2) — template for staff use, not an approved public release. City "
    + "housing layer served from the Raleigh ArcGIS Online org; boundary files served "
    + "with this page. Brand: City of Raleigh. Design review: DesignTeam@raleighnc.gov.",

  /* --- Samantha's list, 9 September 2026 -----------------------------------
   * Three filters and two whole sections come off before the council retreat.
   * Every one is HIDDEN rather than removed: she wants the filters back in a
   * later iteration, once the funding-source information has been reconciled
   * back in from the Rental Development Tracker. Flip a flag to true and the
   * control returns exactly as it was.
   *
   * The LIHTC filter also had a real bug behind it, which is fixed in the layer
   * rather than here: Development_Type and Funding_Source were the wrong way
   * round, so the filter offered "Rental" and "Rental and homeownership" where
   * it should have offered 4% LIHTC, 9% LIHTC and Non-LIHTC. The popup's LIHTC
   * row was reading the same wrong field. Both now read correctly, so when this
   * filter is switched back on it will work without further change.          */
  showFundingFilter: false,
  showAmiFilter: false,
  showLihtcFilter: false,
  showAffordabilitySection: false,
  showGeographySection: false,

  /* --- Samantha, 10 September 2026 ----------------------------------------
   * FY 2014-2015 comes off the fiscal year filter and off the map. Those three
   * projects, Rich Park, Brighton Pointe and Sunnybrook I, carry no city
   * funding, no LIHTC classification and, in Rich Park's case, a certificate of
   * occupancy dated December 2012, which is two years before the fiscal year it
   * is filed under. Filtered, not deleted: the rows stay in the layer and in the
   * workbook, and one line here brings the year back.
   *
   * A useful side effect. The completed table now reaches exactly as far back as
   * the department's published summary does, so its total lands on 4,697, the
   * department's own development figure, with nothing left to explain. */
  hideFiscalYears: ["FY 2014-2015"],

  /* Funding source and LIHTC come off the completed table, also at Samantha's
   * request. Both are still in the layer, the popup and the workbook. */
  completedTableHideColumns: ["fundingSource", "developmentType"],

  showNcodFilter: false,
  geographyCountSuffix: "",
  geographyTitleSuffix: "",
  geographyScopeNoteHtml:
    "<strong>City housing development only.</strong> Home repair, homebuyer assistance and " +
    "other housing impact are not shown here because no council district is recorded for them " +
    "in the department's source data. Their citywide totals appear in the Housing production " +
    "section above. Counts here include both completed and pipeline units, so they will not " +
    "match those citywide totals.",
};
