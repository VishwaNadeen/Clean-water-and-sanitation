const WORLD_LOCATION_BASE_URL = "https://countriesnow.space/api/v0.1/countries";
const SRI_LANKA_LOCATION_URL =
  "https://cdn.jsdelivr.net/npm/get-srilanka-districts-cities@1.0.3/Data/cities.min.js";
const SRI_LANKA_NAME = "Sri Lanka";

let countriesAndStatesCache = null;
let sriLankaHierarchyCache = null;

function sortStrings(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

async function readJson(response) {
  const data = await response.json();

  if (!response.ok || data?.error) {
    throw new Error(data?.msg || "Failed to load location data.");
  }

  return data;
}

async function loadCountriesAndStates() {
  if (!countriesAndStatesCache) {
    countriesAndStatesCache = fetch(`${WORLD_LOCATION_BASE_URL}/states`)
      .then(readJson)
      .then((payload) => (Array.isArray(payload?.data) ? payload.data : []))
      .catch((error) => {
        countriesAndStatesCache = null;
        throw error;
      });
  }

  return countriesAndStatesCache;
}

async function loadSriLankaHierarchy() {
  if (!sriLankaHierarchyCache) {
    sriLankaHierarchyCache = fetch(SRI_LANKA_LOCATION_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load Sri Lanka location data.");
        }

        return response.text();
      })
      .then((source) => {
        const moduleCode = source.replace("module.exports=", "return ");
        const evaluator = new Function(moduleCode);
        return evaluator()[0] || {};
      })
      .catch((error) => {
        sriLankaHierarchyCache = null;
        throw error;
      });
  }

  return sriLankaHierarchyCache;
}

export async function fetchWorldCountries() {
  const countries = await loadCountriesAndStates();

  return sortStrings(
    countries
      .map((country) => country?.name || country?.country || "")
      .filter(Boolean)
  );
}

export async function fetchWorldStates(countryName) {
  if (!countryName) return [];

  if (countryName === SRI_LANKA_NAME) {
    const hierarchy = await loadSriLankaHierarchy();
    return sortStrings(Object.keys(hierarchy));
  }

  const countries = await loadCountriesAndStates();
  const selectedCountry = countries.find(
    (country) => (country?.name || country?.country || "") === countryName
  );

  if (!selectedCountry) return [];

  return sortStrings(
    (selectedCountry?.states || [])
      .map((state) => state?.name || state?.state || "")
      .filter(Boolean)
  );
}

export async function fetchWorldCities(countryName, stateName) {
  if (!countryName || !stateName) return [];

  if (countryName === SRI_LANKA_NAME) {
    const hierarchy = await loadSriLankaHierarchy();
    const province = hierarchy?.[stateName] || {};
    const allCities = Object.values(province).flatMap((cities) =>
      Array.isArray(cities) ? cities : []
    );

    return sortStrings(allCities);
  }

  const response = await fetch(`${WORLD_LOCATION_BASE_URL}/state/cities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country: countryName,
      state: stateName,
    }),
  });

  const payload = await readJson(response);
  return sortStrings(Array.isArray(payload?.data) ? payload.data : []);
}

export async function fetchWorldDistricts(countryName, stateName) {
  if (!countryName || !stateName) return [];

  if (countryName !== SRI_LANKA_NAME) {
    return [];
  }

  const hierarchy = await loadSriLankaHierarchy();
  const province = hierarchy?.[stateName] || {};
  return sortStrings(Object.keys(province));
}

export async function fetchWorldCitiesByDistrict(countryName, stateName, districtName) {
  if (!countryName || !stateName) return [];

  if (countryName !== SRI_LANKA_NAME) {
    return fetchWorldCities(countryName, stateName);
  }

  if (!districtName) {
    return [];
  }

  const hierarchy = await loadSriLankaHierarchy();
  const districtCities = hierarchy?.[stateName]?.[districtName] || [];
  return sortStrings(Array.isArray(districtCities) ? districtCities : []);
}
