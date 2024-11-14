"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { fetchMarkers } from "@/queries";
import { useCookies } from "react-cookie";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

const Map = ({ latitude, longitude, zoom, geoJsonData }) => {
  const [cookies] = useCookies();
  const userId = cookies.userId;
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [latLng1, setLatLng1] = useState(null);
  const [latLng2, setLatLng2] = useState(null);
  const [distance, setDistance] = useState(null);
  const [geoJsonInfo, setGeoJsonInfo] = useState(null);
  const queryClient = useQueryClient();

  const mutationAddMarker = useMutation({
    mutationFn: (data) =>
      axios.post(`/api/marker?userId=${cookies.userId}`, data, {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      console.log("Marker added successfully");
      queryClient.invalidateQueries(["GET_ALL_MARKERSDATAS"]);
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });

  const mutationDeleteMarker = useMutation({
    mutationFn: (markerId) =>
      axios.delete(`/api/delete_markers`, { data: { id: markerId } }),
    onSuccess: () => {
      console.log("Marker deleted successfully");
      queryClient.invalidateQueries(["GET_ALL_MARKERSDATAS"]);
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const {
    data: markers_data,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["GET_ALL_MARKERSDATAS", userId],
    queryFn: () => fetchMarkers({ userId }),
    onSuccess: (data) => {
      console.log("Fetched markers data:", data);
    },
  });

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [longitude, latitude],
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on("load", () => {
      map.current.on("dblclick", (e) => {
        const { lng, lat } = e.lngLat;
        mutationAddMarker.mutate({ docs: [{ Longitude: lng, Latitude: lat }] });

        const newMarker = createMarker(lng, lat);
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      });
    });
  }, [latitude, longitude, zoom]);

  const updateMarkerCoordinates = (id, lat, lng) => {
    axios
      .put("/api/edit_markers", {
        id,
        updatedData: { Latitude: lat, Longitude: lng },
      })
      .then((response) => {
        if (response.data.success) {
          console.log("Marker updated successfully in the database.");
        } else {
          console.error("Failed to update marker:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Update error:", error);
      });
  };

  const createMarker = (lng, lat, id) => {
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map.current);

    marker._id = id;

    marker.on("dragend", () => {
      const { lng: newLng, lat: newLat } = marker.getLngLat();
      updateMarkerCoordinates(id, newLat, newLng);
    });

    const infoCard = document.createElement("div");
    infoCard.innerHTML = `<p>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(
      4
    )}</p>`;
    infoCard.style.position = "absolute";
    infoCard.style.background = "white";
    infoCard.style.padding = "5px";
    infoCard.style.borderRadius = "3px";
    infoCard.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";
    infoCard.style.display = "none";
    marker.getElement().appendChild(infoCard);

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "🗑";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.position = "absolute";
    deleteButton.style.background = "white";
    deleteButton.style.border = "none";
    deleteButton.style.padding = "5px";
    deleteButton.style.borderRadius = "3px";
    deleteButton.style.display = "none";

    marker.getElement().addEventListener("mouseenter", () => {
      infoCard.style.display = "block";
      deleteButton.style.display = "block";
      deleteButton.style.left = "-10px";
      deleteButton.style.top = "-10px";
      marker.getElement().appendChild(deleteButton);
    });

    marker.getElement().addEventListener("mouseleave", () => {
      infoCard.style.display = "none";
      deleteButton.style.display = "none";
      if (deleteButton.parentNode) {
        deleteButton.parentNode.removeChild(deleteButton);
      }
    });

    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      handleDeleteMarker(marker, id);
    });

    marker.getElement().addEventListener("click", () => {
      const clickedMarker = { lat, lng };
      setSelectedMarkers((prevSelected) => {
        const updatedMarkers = [...prevSelected, clickedMarker];
        if (updatedMarkers.length > 2) updatedMarkers.shift();

        if (updatedMarkers.length === 2) {
          const [marker1, marker2] = updatedMarkers;
          setLatLng1(marker1);
          setLatLng2(marker2);

          const calculatedDistance = getDistanceFromLatLonInKm(
            marker1.lat,
            marker1.lng,
            marker2.lat,
            marker2.lng
          );
          setDistance(calculatedDistance);
        }

        return updatedMarkers;
      });
    });

    return marker;
  };

  const handleDeleteMarker = (marker, id) => {
    mutationDeleteMarker.mutate(id);
    marker.remove();
    setMarkers((prevMarkers) => prevMarkers.filter((m) => m !== marker));
  };

  const resetDistanceCalculation = () => {
    setLatLng1(null);
    setLatLng2(null);
    setDistance(null);
    setSelectedMarkers([]);
  };

  useEffect(() => {
    if (!map.current || !markers_data) return;

    markers_data.forEach((marker) => {
      const { Longitude, Latitude, _id } = marker;
      if (Longitude !== undefined && Latitude !== undefined) {
        const newMarker = createMarker(Longitude, Latitude, _id);
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      }
    });
  }, [markers_data]);

  useEffect(() => {
    if (!map.current) return;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        trash: true,
      },
    });

    map.current.addControl(draw);

    if (geoJsonData.features.length >= 1) {
      function extractPolygonCoordinates(geoJson) {
        const polygonCoordinates = [];
        for (let feature of geoJson.features) {
          if (feature.geometry.type === "Polygon") {
            polygonCoordinates.push(feature.geometry.coordinates);
          }
        }
        return polygonCoordinates;
      }

      const coordinat = extractPolygonCoordinates(geoJsonData);
      const coordinates = coordinat[0][0];
      console.log(coordinates);

      const Coordinates = [
        [
          [coordinates[0][0], coordinates[0][1]],
          [coordinates[1][0], coordinates[1][1]],
          [coordinates[2][0], coordinates[2][1]],
          [coordinates[3][0], coordinates[3][1]],
          [coordinates[0][0], coordinates[0][1]],
        ],
      ];
      draw.add({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: Coordinates,
        },
      });
    } else {
      console.log("Feature or geometry is undefined");
    }

    const initializeDrawData = () => {
      if (geoJsonData && geoJsonData.features) {
        geoJsonData.features.forEach((feature) => {
          draw.add(feature);
        });
      }
    };

    const updateGeoJsonData = () => {
      const data = draw.getAll();
      const filteredFeatures = data.features.filter(
        (feature) =>
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "LineString"
      );

      const updatedData = {
        type: "FeatureCollection",
        features: filteredFeatures,
      };

      const sourceId = `geojson - data - source`;

      if (map.current.getSource(sourceId)) {
        map.current.getSource(sourceId).setData(updatedData);
      }
    };

    const addSourceAndLayers = () => {
      const sourceId = `geojson - data - source`;

      if (!map.current.getSource(sourceId)) {
        map.current.addSource(sourceId, {
          type: "geojson",
          data: geoJsonData,
        });
      }

      if (!map.current.getLayer("lines")) {
        map.current.addLayer({
          id: "lines",
          type: "line",
          source: sourceId,
          filter: ["==", "$type", "LineString"],
          paint: {
            "line-width": 3,
            "line-color": "#3bb2d0",
          },
        });
      }

      if (!map.current.getLayer("polygons")) {
        map.current.addLayer({
          id: "polygons",
          type: "fill",
          source: sourceId,
          filter: ["==", "$type", "Polygon"],
          paint: {
            "fill-opacity": 0.0,
            "fill-color": "#888",
          },
        });
      }
    };

    map.current.on("mouseenter", "lines", (e) => {
      map.current.getCanvas().style.cursor = "pointer";
      const coordinates = e.features[0].geometry.coordinates;
      const type = e.features[0].geometry.type;
      setGeoJsonInfo({ type, coordinates });
    });

    map.current.on("mouseenter", "polygons", (e) => {
      map.current.getCanvas().style.cursor = "pointer";
      const coordinates = e.features[0].geometry.coordinates;
      const type = e.features[0].geometry.type;
      setGeoJsonInfo({ type, coordinates });
    });

    map.current.on("mouseleave", "lines", () => {
      map.current.getCanvas().style.cursor = "";
      setGeoJsonInfo(null);
    });

    map.current.on("mouseleave", "polygons", () => {
      map.current.getCanvas().style.cursor = "";
      setGeoJsonInfo(null);
    });

    map.current.on("load", () => {
      addSourceAndLayers();
      initializeDrawData();

      map.current.on("draw.create", updateGeoJsonData);
      map.current.on("draw.update", updateGeoJsonData);
      map.current.on("draw.delete", updateGeoJsonData);
    });

    return () => {
      map.current.off("draw.create", updateGeoJsonData);
      map.current.off("draw.update", updateGeoJsonData);
      map.current.off("draw.delete", updateGeoJsonData);
      if (draw) map.current.removeControl(draw);
    };
  }, [geoJsonData]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-[550px]"></div>
      {geoJsonInfo && (
        <div className="absolute bottom-10 left-2 p-2 bg-white rounded-md shadow-md">
          <p>Type: {geoJsonInfo.type}</p>
          <p>Coordinates: {JSON.stringify(geoJsonInfo.coordinates)}</p>
        </div>
      )}
      {latLng1 && latLng2 && distance !== null && (
        <div className="absolute bottom-12 left-2 p-2 bg-white rounded-md shadow-md">
          <p>
            Distance between markers: {distance.toFixed(2)} km /{" "}
            {distance.toFixed(2) * 0.621} miles
          </p>
          <button
            onClick={resetDistanceCalculation}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default Map;
