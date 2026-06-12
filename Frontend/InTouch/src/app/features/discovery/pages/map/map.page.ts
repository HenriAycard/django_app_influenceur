import {
  ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild,
  inject, signal
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flashOutline, locationOutline, closeOutline, arrowForwardOutline, mapOutline } from 'ionicons/icons';
import maplibregl from 'maplibre-gl';
import { ApiVenueService } from 'src/app/services/api/api-venue.service';
import { VenueMapMarker } from 'src/app/shared/models';

const TYPE_EMOJI: Record<string, string> = {
  'hotel': '🏨', 'restaurant': '🍽️', 'clothing store': '👗',
  'sports studio': '🤸', 'coffee shop': '☕', 'spa': '💆',
  'retail store': '🛍️', 'fitness center': '🏋️', 'art gallery': '🖼️',
  'bakery': '🥐', 'gym': '💪', 'barbershop': '💈',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonContent, IonSpinner, IonIcon],
})
export class MapPage implements OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  protected readonly loading = signal(true);
  protected readonly empty = signal(false);
  protected readonly error = signal(false);
  protected readonly venueCount = signal(0);
  protected readonly selected = signal<VenueMapMarker | null>(null);

  private map?: maplibregl.Map;
  private markers: { marker: maplibregl.Marker; venue: VenueMapMarker }[] = [];
  private activeEl: HTMLElement | null = null;

  private readonly api = inject(ApiVenueService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    addIcons({ flashOutline, locationOutline, closeOutline, arrowForwardOutline, mapOutline });
  }

  ionViewDidEnter(): void {
    this.initMap();
  }

  ionViewWillLeave(): void {
    this.destroyMap();
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  protected dismiss(): void {
    this.selected.set(null);
    this.activeEl?.classList.remove('map-marker--active');
    this.activeEl = null;
  }

  protected openVenue(id: number): void {
    this.router.navigate(['venue', id], { relativeTo: this.route });
  }

  protected typeEmoji(name: string | null | undefined): string {
    return TYPE_EMOJI[(name ?? '').toLowerCase()] ?? '📍';
  }

  private initMap(): void {
    this.loading.set(true);
    this.error.set(false);
    this.empty.set(false);
    this.selected.set(null);

    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [2.3522, 46.2276],
      zoom: 5,
      attributionControl: false,
    });

    this.map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    this.map.on('load', () => {
      this.api.findVenueMapMarkers().subscribe({
        next: (venues) => {
          this.loading.set(false);
          this.venueCount.set(venues.length);
          if (!venues.length) { this.empty.set(true); return; }
          this.addMarkers(venues);
          this.fitBounds(venues);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
    });

    // Tap on map → dismiss card
    this.map.on('click', () => this.dismiss());
  }

  private addMarkers(venues: VenueMapMarker[]): void {
    if (!this.map) return;

    for (const v of venues) {
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.innerHTML = `<span class="map-marker-emoji">${this.typeEmoji(v.typeVenue?.name)}</span>`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectVenue(v, el);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([v.longitude, v.latitude])
        .addTo(this.map!);

      this.markers.push({ marker, venue: v });
    }
  }

  private selectVenue(v: VenueMapMarker, el: HTMLElement): void {
    this.activeEl?.classList.remove('map-marker--active');
    el.classList.add('map-marker--active');
    this.activeEl = el;
    this.selected.set(v);
    this.map?.flyTo({ center: [v.longitude, v.latitude], zoom: 14, duration: 500 });
  }

  private fitBounds(venues: VenueMapMarker[]): void {
    if (!this.map || venues.length === 0) return;
    if (venues.length === 1) {
      this.map.flyTo({ center: [venues[0].longitude, venues[0].latitude], zoom: 13 });
      return;
    }
    const lngs = venues.map(v => v.longitude);
    const lats = venues.map(v => v.latitude);
    this.map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 80, maxZoom: 13 }
    );
  }

  private destroyMap(): void {
    for (const { marker } of this.markers) marker.remove();
    this.markers = [];
    this.map?.remove();
    this.map = undefined;
    this.activeEl = null;
  }
}
