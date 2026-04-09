export async function fetchCountries() {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,idd,cca2,flags"
  );

  if (!res.ok) {
    throw new Error("Failed to load countries");
  }

  const data = await res.json();

  const countries = data
    .map((country) => {
      const root = country?.idd?.root || "";
      const suffixes = Array.isArray(country?.idd?.suffixes)
        ? country.idd.suffixes
        : [];

      const firstSuffix = suffixes[0] || "";
      const dialCode = root && firstSuffix ? `${root}${firstSuffix}` : "";

      return {
        code: country?.cca2 || "",
        name: country?.name?.common || "",
        flagUrl: country?.flags?.svg || country?.flags?.png || "",
        dialCode,
      };
    })
    .filter((country) => country.name && country.dialCode)
    .sort((a, b) => a.name.localeCompare(b.name));

  return countries;
}
