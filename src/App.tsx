  const exportCsv = () => {
    const rows = [
      [
        "id",
        "name",
        "city",
        "type",
        "ownership",
        "address",
        "website",
        "verification",
      ],
      ...campuses.map((c) => [
        c.id,
        c.name,
        c.city,
        c.type,
        c.ownership,
        c.address,
        c.website,
        c.verification,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    saveAs(
      new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8",
      }),
      "kampus-kalimantan-barat.csv"
    );
  };

  const importCsv = async (file?: File) => {
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim());

      if (lines.length < 2) {
        setToast("File CSV tidak memiliki data");
        return;
      }

      const parse = (line: string): string[] => {
        const result: string[] = [];
        let value = "";
        let quoted = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            if (quoted && line[i + 1] === '"') {
              value += '"';
              i++;
            } else {
              quoted = !quoted;
            }
          } else if (char === "," && !quoted) {
            result.push(value.trim());
            value = "";
          } else {
            value += char;
          }
        }

        result.push(value.trim());
        return result;
      };

      const headers = parse(lines[0]).map((header, index) =>
        index === 0
          ? header.replace(/^\uFEFF/, "").toLowerCase()
          : header.toLowerCase()
      );

      if (!headers.includes("name") || !headers.includes("city")) {
        setToast("CSV harus memiliki kolom name dan city");
        return;
      }

      const imported: Campus[] = lines
        .slice(1)
        .map((line, index): Campus => {
          const values = parse(line);

          const get = (key: string): string => {
            const position = headers.indexOf(key);
            return position >= 0 ? values[position] || "" : "";
          };

          const verification: Campus["verification"] =
            get("verification") === "Terverifikasi"
              ? "Terverifikasi"
              : "Seed - perlu verifikasi";

          return {
            id: get("id") || `import-${Date.now()}-${index}`,
            name: get("name"),
            city: get("city"),
            type: get("type") || "Belum ditentukan",
            ownership: get("ownership") || "Belum ditentukan",
            address: get("address") || get("city"),
            website: get("website"),
            verification,
          };
        })
        .filter((campus) => campus.name && campus.city);

      setCampuses((old) => {
        const names = new Set(old.map((campus) => campus.name.toLowerCase()));

        return [
          ...old,
          ...imported.filter(
            (campus) => !names.has(campus.name.toLowerCase())
          ),
        ];
      });

      setToast(`${imported.length} baris CSV diperiksa; duplikat dilewati`);
    } catch (error) {
      console.error("Gagal mengimpor CSV:", error);
      setToast("Gagal membaca file CSV");
    }
  };
