export async function getDictionary(locale: string) {
    const l = locale === "en" ? "en" : "es";
    const dict = await import(`../dictionaries/${l}.json`);
    return dict.default;
  }