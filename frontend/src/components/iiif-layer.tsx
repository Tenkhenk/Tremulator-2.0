import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface Props {
  url: string;
}

export const IIIFLayer: React.FC<Props> = (props: Props) => {
  const { url } = props;
  const map = useMap();

  useEffect(() => {
    const l = (L.tileLayer as any).iiif(url, {});
    l.addTo(map);
    // clean method
    return () => {
      map.removeLayer(l);
    };
  }, [url, map]);
  return null;
};
