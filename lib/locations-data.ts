import locationsDataRaw from "@/app/data/locations.json";

export interface LocationItem {
  id: number;
  level: number;
  name: string;
  use: boolean;
}

const locationsData = locationsDataRaw as LocationItem[];

export const getGovernorates = () => {
  const level2 = locationsData.filter((item) => item.level === 2 && item.use);
  const govs = Array.from(
    new Set(level2.map((item) => item.name.split(",")[1].trim())),
  ).sort();
  return govs;
};

export const getDelegations = (governorate: string) => {
  if (!governorate) return [];
  return locationsData
    .filter(
      (item) =>
        item.level === 2 && item.use && item.name.endsWith(`, ${governorate}`),
    )
    .map((item) => item.name.split(",")[0].trim())
    .sort();
};

export const getCities = (delegation: string, governorate: string) => {
  if (!delegation || !governorate) return [];
  return locationsData
    .filter(
      (item) =>
        item.level === 3 &&
        item.use &&
        item.name.endsWith(`, ${delegation}, ${governorate}`),
    )
    .map((item) => item.name.split(",")[0].trim())
    .sort();
};
