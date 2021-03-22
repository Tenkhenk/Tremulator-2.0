import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L, { Layer, LatLngBounds } from "leaflet";
import "leaflet-iiif";
import "leaflet-draw";
import "./quality-toolbar";

interface Props {
  url: string;
  quality?: string;
  setQuality: (quality: string) => void;
  bbox: LatLngBounds | null;
  onMoveEnd?: (e: LatLngBounds) => void;
}

export const IIIFLayer: React.FC<Props> = (props: Props) => {
  const { url, bbox, onMoveEnd, quality, setQuality } = props;

  // state
  const [layer, setLayer] = useState<Layer | null>(null);

  // Map
  const map = useMap();

  // When map or url changed
  //  => reset layer
  useEffect(() => {
    // add IIF layer to leaflet
    const l = new (L.TileLayer as any).Iiif(url, { fitBounds: true, quality: quality ? quality : "default" });
    l.addTo(map);

    // add iiif quality toolbar
    const qualityToolbar = (L.control as any).iiifQuality({ setQuality });
    qualityToolbar.addTo(map);

    // when layer is fully-loaded, set it in the state
    l.on("load", () => {
      setLayer(l);
    });

    // clean method
    return () => {
      try {
        map.removeLayer(l);
        map.removeControl(qualityToolbar);
      } catch (e) {
        console.log(e);
      }
    };
  }, [url, map, quality]);

  // When bbox changed
  //  => move the map and then listen for moves
  useEffect(() => {
    if (layer) {
      if (bbox) map.fitBounds(bbox);
      map.on("moveend", () => {
        if (onMoveEnd) onMoveEnd(map.getBounds());
      });
    }
    return () => {
      map.off("moveend", () => {
        if (onMoveEnd) onMoveEnd(map.getBounds());
      });
    };
  }, [map, layer, bbox, onMoveEnd]);

  return null;
};
