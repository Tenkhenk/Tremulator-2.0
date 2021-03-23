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
  // juts to know when to invalidate map size
  sideOpened: boolean;
}

export const IIIFLayer: React.FC<Props> = (props: Props) => {
  const { url, bbox, onMoveEnd, quality, setQuality, sideOpened } = props;

  // state
  const [layer, setLayer] = useState<Layer | null>(null);

  // Map
  const map = useMap();

  // WHen size changed (based on sideOpened)
  //  => invalidate map size in a timeout
  useEffect(() => {
    const timeout: number = window.setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [map, sideOpened]);

  // When map or url changed
  //  => reset layer
  useEffect(() => {
    // add IIF layer to leaflet
    const l = new (L.TileLayer as any).Iiif(url, {
      fitBounds: true,
      quality: quality ? quality : "default",
    });
    l.addTo(map);

    // when layer is fully-loaded, set it in the state
    l.on("load", () => {
      setLayer(l);
    });

    // clean method
    return () => {
      try {
        setLayer(null);
        map.removeLayer(l);
      } catch (e) {}
    };
  }, [url, map, quality]);

  // add iiif quality toolbar
  useEffect(() => {
    const qualityToolbar = (L.control as any).iiifQuality({ setQuality });
    qualityToolbar.addTo(map);
    return () => {
      map.removeControl(qualityToolbar);
    };
  }, [setQuality, map]);

  // When bbox changed
  //  => move the map and then listen for moves
  useEffect(() => {
    const mvFn = () => {
      if (onMoveEnd) onMoveEnd(map.getBounds());
    };

    if (layer) {
      if (bbox) map.fitBounds(bbox);
      map.on("moveend", mvFn);
    }
    return () => {
      map.off("moveend", mvFn);
    };
  }, [map, layer, bbox, onMoveEnd]);

  return null;
};
