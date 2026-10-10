const importCsv = async (file?: File) => {
  if (!file) return;

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);

  const parse = (line: string): string[] =>
    line.split(",").map((value) =>
      value.trim().replace(/^"|"$/g, "").replace(/""/g, '"')
    );

  const headers = parse(lines[0]).map((header) =>
    header.toLowerCase()
  );

  const required = ["name", "city"];

  if (!required.every((key) => headers.includes(key))) {
    setToast("CSV wajib memiliki kolom name dan city");
    return;
  }

  const imported: Campus[] = lines
    .slice(1)
    .map((line, index): Campus => {
      const values = parse(line);

      const get = (key: string): string =>
        values[headers.indexOf(key)] || "";

      return {
        id: get("id") || `import-${Date.now()}-${index}`,
        name: get("name"),
        city: get("city"),
        type: get("type") || "Belum ditentukan",
        ownership: get("ownership") || "Belum ditentukan",
        address: get("address") || get("city"),
        website: get("website"),
        verification: "Seed - perlu verifikasi" as const
      };
    })
    .filter((campus) => campus.name && campus.city);

  setCampuses((old) => {
    const names = new Set(
      old.map((campus) => campus.name.toLowerCase())
    );

    return [
      ...old,
      ...imported.filter(
        (campus) => !names.has(campus.name.toLowerCase())
      )
    ];
  });

  setToast(`${imported.length} baris CSV diperiksa; duplikat dilewati`);
};
