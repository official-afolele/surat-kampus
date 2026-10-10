// 1. Di dalam fungsi addCampus()
const campus: Campus = {
  id: `custom-${Date.now()}`,
  name,
  city: newCampusCity,
  type: newCampusType,
  ownership: newCampusOwnership,
  address: `${newCampusCity}, Kalimantan Barat`,
  website: newCampusWebsite.trim(),
  verification: "Seed - perlu verifikasi" as Campus["verification"]
};

// 2. Di dalam fungsi importCsv()
const imported: Campus[] = lines.slice(1).map((line, i) => {
  const values = parse(line);
  const get = (key: string) => values[headers.indexOf(key)] || "";

  return {
    id: get("id") || `import-${Date.now()}-${i}`,
    name: get("name"),
    city: get("city"),
    type: get("type") || "Belum ditentukan",
    ownership: get("ownership") || "Belum ditentukan",
    address: get("address") || get("city"),
    website: get("website"),
    verification: "Seed - perlu verifikasi" as Campus["verification"]
  };
}).filter(c => c.name && c.city);
