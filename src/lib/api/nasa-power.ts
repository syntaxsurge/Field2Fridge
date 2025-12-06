const NASA_BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";

export type ClimateSimulationInput = {
  latitude: number;
  longitude: number;
  startDate: string; // YYYYMMDD
  endDate: string; // YYYYMMDD
};

export type ClimateMetrics = {
  startDate: string;
  endDate: string;
  periodDays: number;
  meanTemperatureC: number;
  totalRainfallMm: number;
  meanSolarKwhM2: number;
  droughtDays: number;
};

type NASAResponse = {
  properties?: {
    parameter?: Record<string, Record<string, number>>;
  };
};

export async function fetchDailyClimate(input: ClimateSimulationInput): Promise<ClimateMetrics> {
  const { latitude, longitude, startDate, endDate } = input;

  const params = new URLSearchParams({
    parameters: "T2M_MAX,T2M_MIN,PRECTOT,ALLSKY_SFC_SW_DWN",
    community: "AG",
    longitude: longitude.toString(),
    latitude: latitude.toString(),
    start: startDate,
    end: endDate,
    format: "JSON",
  });

  const res = await fetch(`${NASA_BASE_URL}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`NASA POWER request failed: ${res.status}`);
  }

  const json = (await res.json()) as NASAResponse;
  const param = json?.properties?.parameter ?? {};

  const tMax = param["T2M_MAX"] ?? {};
  const tMin = param["T2M_MIN"] ?? {};
  const rain = param["PRECTOT"] ?? {};
  const solar = param["ALLSKY_SFC_SW_DWN"] ?? {};

  const dates = Object.keys(tMax);
  if (dates.length === 0) {
    throw new Error("No climate data returned from NASA POWER");
  }

  let tempSum = 0;
  let rainSum = 0;
  let solarSum = 0;
  let droughtDays = 0;

  for (const d of dates) {
    const max = Number(tMax[d] ?? 0);
    const min = Number(tMin[d] ?? 0);
    const dailyRain = Number(rain[d] ?? 0);
    const dailySolar = Number(solar[d] ?? 0);

    const mean = (max + min) / 2;
    tempSum += mean;
    rainSum += dailyRain;
    solarSum += dailySolar;

    if (dailyRain < 1) {
      droughtDays++;
    }
  }

  const periodDays = dates.length;

  return {
    startDate,
    endDate,
    periodDays,
    meanTemperatureC: tempSum / periodDays,
    totalRainfallMm: rainSum,
    meanSolarKwhM2: solarSum / periodDays,
    droughtDays,
  };
}
