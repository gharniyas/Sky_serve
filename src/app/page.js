"use client";

import { fetchDatas } from "@/queries";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import FileUploadForm from "@/components/FileUploadForm";
import Header from "@/components/layout/Header";
import WithAuth from "./WithAuth";
import { useCookies } from "react-cookie";
const Map = dynamic(() => import("../components/Map"), { ssr: false });

const Home = () => {
  const [cookies] = useCookies();
  const userId = cookies.userId;

  // Fetch data using react-query
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["GET_ALL_DATAS", userId],
    queryFn: () => fetchDatas({ userId }),
    enabled: !!userId,
  });

  // State for map center, zoom, and features
  const [center, setCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(5);
  const [allFeatures, setAllFeatures] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const newFeatures = [];
      const bounds = new mapboxgl.LngLatBounds();

      data.forEach((geoJsonData) => {
        if (geoJsonData.features) {
          newFeatures.push(...geoJsonData.features);

          geoJsonData.features.forEach((feature) => {
            const { coordinates } = feature.geometry;

            if (feature.geometry.type === "Point") {
              bounds.extend(coordinates);
            } else if (
              feature.geometry.type === "LineString" ||
              feature.geometry.type === "Polygon"
            ) {
              coordinates.flat().forEach((coord) => bounds.extend(coord));
            }
          });
        }
      });

      setAllFeatures(newFeatures);

      if (newFeatures.length > 0) {
        const mapCenter = bounds.getCenter();
        setCenter([mapCenter.lng, mapCenter.lat]);

        // Dynamically calculate zoom based on the bounds
        const mapZoom = Math.min(
          14,
          12 -
            Math.log2(
              bounds.getNorthEast().distanceTo(bounds.getSouthWest()) / 5000
            )
        );
        setZoom(mapZoom);
      }
    }
  }, [data]);

  // Render loading or error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data</div>;

  return (
    <div className="overflow-hidden">
      <header>
        <Header refetch={refetch} />
      </header>
      <Map
        latitude={center[1]}
        longitude={center[0]}
        zoom={zoom}
        geoJsonData={{ type: "FeatureCollection", features: allFeatures }}
      />
    </div>
  );
};

export default WithAuth(Home);
