import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L, { latLng, Layer, LatLng, latLngBounds, LatLngBounds } from "leaflet";
import "leaflet-iiif";
import "leaflet-draw";
import { useQueryParam } from "../../hooks/useQueryParam";

interface Props {
  url: string;
  bbox: LatLngBounds | null;
  onMoveEnd?: (e: LatLngBounds) => void;
  onClick?: () => void;
}

export const IIIFLayer: React.FC<Props> = (props: Props) => {
  const { url, bbox, onMoveEnd, onClick } = props;

  // state
  const [layer, setLayer] = useState<Layer | null>(null);

  // Map
  const map = useMap();

  // When map or url changed
  //  => reset layer
  useEffect(() => {
    // add IIF layer to leaflet
    const l = (L.tileLayer as any).iiif(url, { fitBounds: true });
    l.addTo(map);

    // when layer is fully-loaded, set it in the state
    l.on("load", () => {
      setLayer(l);
    });

    // clean method
    return () => {
      map.removeLayer(l);
    };
  }, [url, map]);

  // When bbox changed
  //  => move the map and then listen for moves
  useEffect(() => {
    if (layer && bbox) {
      map.fitBounds(bbox);
      map.on("moveend", () => {
        if (onMoveEnd) onMoveEnd(map.getBounds());
      });
    }
    return () => {
      map.off("moveend", () => {
        if (onMoveEnd) onMoveEnd(map.getBounds());
      });
    };
  }, [map, layer, bbox]);

  return null;
};
