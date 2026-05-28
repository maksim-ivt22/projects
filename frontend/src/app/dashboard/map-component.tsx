"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LatLngTuple } from "leaflet";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Icon } from "@iconify/react";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import { cn } from "../../lib/utils";
import geoService, { UNKNOWN_ADDRESS } from "../../services/geo-service";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const MapComponent = ({ className }: { className?: string }) => {
  const [street, setStreet] = useState("");
  const [position, setPosition] = useState<LatLngTuple>([62.016754, 129.70408]);
  const [locationLoadAttempted, setLocationLoadAttempted] = useState(false);

  const markerRef = useRef<L.Marker>(null);

  function MapEventsHandler() {
    const map = useMapEvents({
      click: ({ latlng }) => {
        setPosition([latlng.lat, latlng.lng]);
        map.flyTo(latlng);
        markerRef.current?.openPopup();
      },
      locationfound: ({ latlng }) => {
        setPosition([latlng.lat, latlng.lng]);
        map.flyTo(latlng);
      },
    });
    return null;
  }

  const LocationFinder = () => {
    const map = useMap();

    useEffect(() => {
      if (!locationLoadAttempted) {
        map.locate({
          setView: false,
          enableHighAccuracy: true,
          maxZoom: 17,
          timeout: 10000,
        });
      }

      setLocationLoadAttempted(true);
    }, [map, locationLoadAttempted]);

    useMapEvents({
      locationfound: ({ latlng }) => {
        if (!locationLoadAttempted) {
          map.flyTo(latlng, 17);
          setLocationLoadAttempted(true);
          setPosition([latlng.lat, latlng.lng]);
        }
      },
      locationerror: (error) => {
        console.log("Location error:", error);
      },
    });

    return null;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      markerRef.current?.openPopup();
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let ignoreResult = false;

    const updateStreet = async () => {
      try {
        const address = await geoService.reverseGeocode(
          position[0],
          position[1],
        );

        if (!ignoreResult) {
          setStreet(address);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);

        if (!ignoreResult) {
          setStreet(UNKNOWN_ADDRESS);
        }
      }
    };

    updateStreet();

    return () => {
      ignoreResult = true;
    };
  }, [position]);

  return (
    <MapContainer
      center={[62.016754, 129.70408]}
      attributionControl={false}
      zoom={20}
      scrollWheelZoom={true}
      className={cn("h-screen w-screen", className)}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapEventsHandler />
      <LocationFinder />
      <Marker position={position} ref={markerRef} opacity={0}>
        <Popup
          className="m-0 p-0"
          closeButton={false}
          autoClose={false}
          offset={[0, 42]}
        >
          <div className="text-black font-sans space-y-1">
            <div>
              <span className="text-base p-0 m-0">{street}</span>
              <br />
              <small className="p-0 m-0 text-[12px]">
                {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </small>
            </div>
            <Button asChild variant={"ghost"} className="cursor-pointer">
              <Link
                href={`/requests/create?address=${encodeURIComponent(street)}&latitude=${position[0]}&longitude=${position[1]}`}
              >
                <Icon
                  className="text-foreground"
                  icon={"solar:document-text-bold"}
                />
                <span className="text-foreground">Оставить заявку</span>
              </Link>
            </Button>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
