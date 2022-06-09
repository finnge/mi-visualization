# Data on the daily number of new reported COVID-19 cases and deaths by EU/EEA country

https://www.ecdc.europa.eu/en/publications-data/data-daily-new-cases-covid-19-eueea-country

```
DESCRIPTION AND DISCLAIMER

The downloadable data file contains information on newly reported COVID-19 cases
and deaths in EU/EEA countries. Each row contains the corresponding data for a
certain day and per country. The file is updated daily. You may use the data in
line with ECDC’s copyright policy.


SOURCE

ECDC uses multiple information sources per country. The information sources are
Ministries of Health or National Public Health Institutes (websites, twitter official
accounts or Facebook official accounts). More information is available at
https://www.ecdc.europa.eu/en/covid-19/data-collection.


INTERPRETATION OF COVID-19 DATA

The data included in this file is collected by the ECDC Epidemic Intelligence from
various sources and is affected by the local testing strategy, laboratory capacity
and the effectiveness of surveillance systems. Comparing the epidemiological situation
regarding COVID-19 between countries should therefore not be based on these rates
alone. However, at the individual country level, this indicator may be useful for
monitoring the national situation over time.

Testing policies and the number of tests performed per 100 000 persons, vary
markedly across the EU/EEA. More extensive testing will inevitably lead to more
cases being detected.

The daily reported COVID-19 cases and deaths number should be used in combination
with other factors including testing policies, number of tests performed, test
positivity, excess mortality and rates of hospital and Intensive Care Unit (ICU)
admissions, when analysing the epidemiological situation in a country. Most of
these indicators are presented for EU/EEA Member States in the Country Overview report.

Even when using several indicators in combination, comparisons between countries
should be done with caution and relevant epidemiological expertise.
```

| Variable | Definition | Code |
|----------|------------|------|
| `dateRep` | Date of reporting `dd/mm/yyyy` | string |
| `day` |  | unit8 |
| `month` |  | unit8 |
| `year` |  | unit16 |
| cases | Number of newly reported cases | int64 |
| `deaths` | Number of newly reported deaths | int64 |
| `countriesAndterritories` | Name of the country or territory | string |
| `geoId` | 2-letter code | string |
| `countriesAndterritoryCode` | 3-letter ISO code | string |
| `popData2020` | Eurostat 2020 data | int64 |
| `continentExp` | Name of the continent reporting | string |
