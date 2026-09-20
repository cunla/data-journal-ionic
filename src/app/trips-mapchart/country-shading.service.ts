import {Injectable} from '@angular/core';
import {CountryVisit} from './country-days';

const CACHE_KEY = 'countryPlaceIds';

/**
 * Shades countries on a map using Google's own boundaries (data-driven
 * styling). Each country is geocoded once to a Place ID, which the feature
 * layer matches against; the results are cached in localStorage so the same
 * country is never geocoded twice.
 *
 * Requires the COUNTRY feature layer to be enabled for this Map ID in the
 * Google Cloud Console. Where it is not, `available` stays false and the map
 * simply shows no shading.
 */
@Injectable({providedIn: 'root'})
export class CountryShadingService {
  available: boolean | null = null;
  private layer: google.maps.FeatureLayer | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private readonly placeIds = new Map<string, string>();
  private readonly daysByPlaceId = new Map<string, number>();
  private styleFn: ((days: number) => google.maps.FeatureStyleOptions) | null = null;

  constructor() {
    this.loadCache();
  }

  /** Attaches to the map's country layer. Returns false when unavailable. */
  attach(map: google.maps.Map,
         styleFn: (days: number) => google.maps.FeatureStyleOptions): boolean {
    this.styleFn = styleFn;
    try {
      const layer = map.getFeatureLayer(google.maps.FeatureType.COUNTRY);
      if (!layer || layer.isAvailable === false) {
        this.available = false;
        return false;
      }
      this.layer = layer;
      this.applyStyle();
      this.available = true;
      return true;
    } catch (err) {
      console.warn('Country shading is not available for this map', err);
      this.available = false;
      return false;
    }
  }

  /** Geocodes any country not seen before, then restyles the layer. */
  async shade(visits: CountryVisit[]) {
    this.daysByPlaceId.clear();
    for (const visit of visits) {
      const placeId = await this.placeIdFor(visit);
      if (placeId) {
        this.daysByPlaceId.set(placeId, (this.daysByPlaceId.get(placeId) ?? 0) + visit.days);
      }
    }
    this.applyStyle();
  }

  private applyStyle() {
    if (!this.layer || !this.styleFn) {
      return;
    }
    // Reassigning the function is what makes the layer restyle
    this.layer.style = (params: google.maps.FeatureStyleFunctionOptions) => {
      const feature = params.feature as google.maps.PlaceFeature;
      const days = this.daysByPlaceId.get(feature.placeId);
      return days ? this.styleFn(days) : null;
    };
  }

  private async placeIdFor(visit: CountryVisit): Promise<string | null> {
    const key = (visit.countryCode || visit.country).toUpperCase();
    if (this.placeIds.has(key)) {
      return this.placeIds.get(key);
    }
    const placeId = await this.geocodeCountry(visit);
    if (placeId) {
      this.placeIds.set(key, placeId);
      this.saveCache();
    }
    return placeId;
  }

  private async geocodeCountry(visit: CountryVisit): Promise<string | null> {
    try {
      if (!this.geocoder) {
        await google.maps.importLibrary('geocoding');
        this.geocoder = new google.maps.Geocoder();
      }
      const request: google.maps.GeocoderRequest = visit.countryCode
        ? {componentRestrictions: {country: visit.countryCode}}
        : {address: visit.country};
      const {results} = await this.geocoder.geocode(request);
      const country = results.find(result => result.types.includes('country')) ?? results[0];
      return country?.place_id ?? null;
    } catch (err) {
      console.warn(`Could not look up ${visit.country} for shading`, err);
      return null;
    }
  }

  private loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      for (const [key, value] of Object.entries(raw ? JSON.parse(raw) : {})) {
        this.placeIds.set(key, value as string);
      }
    } catch {
      // an unreadable cache just means geocoding again
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(this.placeIds)));
    } catch {
      // storage being unavailable only costs us the cache
    }
  }
}
