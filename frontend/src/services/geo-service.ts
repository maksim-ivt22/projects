import api from "../lib/api-client";

export const UNKNOWN_ADDRESS = "Адрес не определён";

export type ReverseGeocodeResponse = {
  address?: string;
  detail?: string;
  raw?: unknown;
};

class GeoService {
  async reverseGeocode(lat: number, lon: number): Promise<string> {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
    });

    const response = await api.get<ReverseGeocodeResponse>(
      `geo/reverse/?${params.toString()}`,
    );

    return response.data.address?.trim() || UNKNOWN_ADDRESS;
  }
}

export default new GeoService();
