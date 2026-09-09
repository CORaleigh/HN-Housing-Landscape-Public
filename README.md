# Raleigh Housing Landscape — Public Dashboard

Live at <https://CORaleigh.github.io/HN-Housing-Landscape-Public/>

A public dashboard of the City of Raleigh's affordable and city-supported housing:
what has been produced by fiscal year, how it was funded, where the developments
are, and how the 2020 housing bond has been committed.

## What this repository holds

Static files only. No data lives here. Everything on screen is queried at page
load from ArcGIS Online feature services owned by the City of Raleigh, all of
them shared publicly and read only.

| File | Purpose |
| --- | --- |
| `index.html` | The whole dashboard: map, charts, tables |
| `config.js` | Which services to read and what to call things |
| `config.base.js` | Shared configuration the above builds on |
| `styles.css` | Presentation |
| `council_districts.geojson`, `ncods.geojson` | Boundary reference layers, drawn locally so the map does not depend on a service for them |

## Where the numbers come from

Seven hosted services, published from a single reconciled workbook rather than
hand-keyed:

- `HN_Production_By_Year` — units produced, by fiscal year and category
- `HN_Funding_By_Year` — city funding by fiscal year and programme
- `HN_Development_Projects` — the current-year development pipeline
- `HN_Bond_Category_Totals` — 2020 bond committed funds and units by category
- `HN_Bond_By_Fiscal_Year` — the same categories broken down by year
- `HN_Bond_Projects` — bond development projects
- `HN_City_Housing_Development` — city-funded developments as mapped points

Those come from four authoritative source workbooks maintained by the Housing
and Community Development Department and by Finance. Production figures
reconcile to the department's own published fiscal-year totals, and the bond
subtotals match the figures the department confirmed in writing.

## Editing

This folder is generated. Do not edit it by hand. The source lives in the
Housing Dashboard working repository, where `build.ps1 -Variant coraleigh`
produces exactly what is here. Pushing to `main` deploys through GitHub Actions.

## A note on the data

City funding is broken out by the fund that actually paid for it. Where a source
records a single figure without naming a fund, the dashboard says so rather than
assigning it to one. Unit counts are counted at certificate of occupancy, which
is why a development can appear on the map long before its units appear in the
production totals.
