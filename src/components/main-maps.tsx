"use client";
import { FC, useEffect, useRef, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import MapButton from "@/components/map-button";
import classes from "../utils/styles.module.css";
import AddPinModal from "@/components/add-pin-modal";
import { useJsApiLoader } from "@react-google-maps/api";
import { Library } from "@googlemaps/js-api-loader";
import { mapStyles } from "@/utils/allConstants.constants";
import { Avatar, ChakraProvider, Input, Link } from "@chakra-ui/react";
import { IMainMaps } from "@/utils/alltypes.types";
import { db } from "@/app/firebase";

async function fetchPinsData() {
  const querySnapShot = await getDocs(collection(db, "pins"));
  const data: any = [];
  querySnapShot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
}

interface PinData {
  id: string;
  location: string;
  country: string;
  lng: number;
  lat: number;
  city: string;
  sId: string;
  name: string;
}

const MainMaps: FC<IMainMaps> = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const placesRef = useRef<HTMLInputElement>(null);
  const [pins, setPins] = useState([]);
  const [addPinModal, setAddPinModal] = useState(false);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["core", "marker", "places", "maps"],
  });

  useEffect(() => {
    fetchPinsData()
      .then((result) => {
        setPins(result);
      })
      .catch((e) => console.log(e));
  }, []);

  const groupPinsByCountry = (pins: PinData[]): Record<string, PinData[]> => {
    return pins.reduce((acc, pin) => {
      const country = pin.country || "Unknown";
      if (!acc[country]) acc[country] = [];
      acc[country].push(pin);
      return acc;
    }, {} as Record<string, PinData[]>);
  };

  const groupPinsByCity = (pins: PinData[]): Record<string, PinData[]> => {
    return pins.reduce((acc, pin) => {
      const city = pin.city?.trim() || "Unknown";
      if (!acc[city]) acc[city] = [];
      acc[city].push(pin);
      return acc;
    }, {} as Record<string, PinData[]>);
  };

  const groupPinsByArea = (pins: PinData[]): PinData[] => {
    const grouped: Record<string, PinData> = {};
    pins.forEach((pin) => {
      const key = `${pin.lat.toFixed(3)}_${pin.lng.toFixed(3)}`;
      if (!grouped[key]) grouped[key] = pin;
    });
    return Object.values(grouped);
  };

  const getContinentFromLatLng = (lat: number, lng: number): string => {
    if (lat >= -60 && lat <= 90 && lng >= -180 && lng <= 180) {
      if (lat >= -60 && lat <= 15 && lng >= -170 && lng <= -30) {
        return "South America";
      }
      if (lat >= 15 && lat <= 90 && lng >= -170 && lng <= -30) {
        return "North America";
      }
      if (lat >= -35 && lat <= 35 && lng >= -30 && lng <= 50) {
        return "Africa";
      }
      if (lat >= 35 && lat <= 70 && lng >= -10 && lng <= 50) {
        return "Europe";
      }
      if (lat >= -10 && lat <= 50 && lng >= 50 && lng <= 150) {
        return "Asia";
      }
      if (lat >= -50 && lat <= -10 && lng >= 110 && lng <= 180) {
        return "Australia";
      }
      if (lat <= -60) {
        return "Antarctica";
      }
    }
    return "Unknown";
  };

  const groupPinsByContinent = (pins: PinData[]): Record<string, PinData[]> => {
    return pins.reduce((acc, pin) => {
      const continent = getContinentFromLatLng(pin.lat, pin.lng);
      if (!acc[continent]) acc[continent] = [];
      acc[continent].push(pin);
      return acc;
    }, {} as Record<string, PinData[]>);
  };

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const mapOptions = {
        center: {
          lat: 32.531995,
          lng: 14.690836,
        },
        zoom: 2.5,
        mapId: "MY-MAP-1234",
        // mapTypeId: "ROADMAP",
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      const groupedByCountry = groupPinsByCountry(pins);
      const groupedByContinent = groupPinsByContinent(pins);

      // Initialize arrays to store markers and polygons
      let markers: google.maps.Marker[] = [];
      let polygons: google.maps.Polygon[] = [];

      // Function to clear markers and polygons
      const clearMarkersAndPolygons = () => {
        markers.forEach((marker) => marker.setMap(null));
        markers = [];
        polygons.forEach((polygon) => polygon.setMap(null));
        polygons = [];
      };

      const createContinentMarkers = () => {
        clearMarkersAndPolygons();
        Object.entries(groupedByContinent).forEach(
          ([continent, continentPins]) => {
            const marker = new google.maps.Marker({
              position: {
                lat: continentPins[0].lat,
                lng: continentPins[0].lng,
              },
              map,
              label:
                continentPins.length > 1
                  ? {
                      text: `${continentPins.length}`,
                      color: "white",
                    }
                  : null,
              icon:
                continentPins.length > 1
                  ? {
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: "#333333",
                      fillOpacity: 1,
                      strokeColor: "white",
                      strokeWeight: 4,
                      scale: 20,
                    }
                  : {
                      url: "/images/simplePin.png",
                      scaledSize: new google.maps.Size(30, 30),
                    },
            });
            marker.addListener("click", () => {
              map.setCenter(marker.getPosition() as google.maps.LatLng);
              map.setZoom(3);
              clearMarkersAndPolygons();
              createCountryMarkers();
            });

            marker.addListener("mouseover", () => {
              highlightArea(continentPins, map);
            });
  

            markers.push(marker);
          }
        );
      };

      const createCountryMarkers = () => {
        clearMarkersAndPolygons();
        Object.entries(groupedByCountry).forEach(([country, countryPins]) => {
          const marker = new google.maps.Marker({
            position: { lat: countryPins[0].lat, lng: countryPins[0].lng },
            map,
            //label: `${countryPins.length}`,
            label:
              countryPins.length > 1
                ? {
                    text: `${countryPins.length}`,
                    color: "white",
                  }
                : null,
            icon:
              countryPins.length > 1
                ? {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#333333",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 4,
                    scale: 20,
                  }
                : {
                    url: "/images/simplePin.png",
                    scaledSize: new google.maps.Size(30, 30),
                  },
          });
          marker.addListener("click", () => {
            map.setCenter(marker.getPosition() as google.maps.LatLng);
            map.setZoom(6);
            const groupedByCity = groupPinsByCity(countryPins);
            clearMarkersAndPolygons();
            createCityMarkers(groupedByCity);
          });

          marker.addListener("mouseover", () => {
            highlightArea(countryPins, map);
          });

          marker.addListener("mouseout", () => {
            clearMarkersAndPolygons();
            createCountryMarkers();
          });

          markers.push(marker);
        });
      };

      const createCityMarkers = (groupedByCity: Record<string, PinData[]>) => {
        Object.entries(groupedByCity).forEach(([city, cityPins]) => {
          const marker = new google.maps.Marker({
            position: { lat: cityPins[0].lat, lng: cityPins[0].lng },
            map,
            label:
              cityPins.length > 1
                ? {
                    text: `${cityPins.length}`,
                    color: "white",
                  }
                : null,
            icon:
              cityPins.length > 1
                ? {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#333333",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 4,
                    scale: 20,
                  }
                : {
                    url: "/images/simplePin.png",
                    scaledSize: new google.maps.Size(30, 30),
                  },
          });
          marker.addListener("click", () => {
            map.setCenter(marker.getPosition() as google.maps.LatLng);
            map.setZoom(10);
            const groupedByArea = groupPinsByArea(cityPins);
            clearMarkersAndPolygons();
            createAreaMarkers(groupedByArea);
          });

          marker.addListener("mouseover", () => {
            highlightArea(cityPins, map);
          });

          marker.addListener("mouseout", () => {
            clearMarkersAndPolygons();
            createCityMarkers(groupedByCity);
          });
          markers.push(marker);
        });
      };

      const createAreaMarkers = (groupedByArea: PinData[]) => {
        groupedByArea.forEach((pin) => {
          const marker = new google.maps.Marker({
            position: { lat: pin.lat, lng: pin.lng },
            map,
            //label: pin.name,
            icon: {
              url: "/images/simplePin.png",
              scaledSize: new google.maps.Size(30, 30),
            },
          });
          const infoWindow = new google.maps.InfoWindow({
            content: `<div id='infoWindowContainer'><div><img id="avatar" src="/images/people.png" alt="Avatar"></div><div><div>${pin.name}</div><div><a id="infoLink" href="https://www.skool.com/${pin.sId}?t=posts"  target="_blank">${pin.sId}</a></div></div></div>`,
          });
          marker.addListener("click", () => {
            const zoomLevel = map.getZoom();
            map.setCenter(marker.getPosition() as google.maps.LatLng);
            map.setZoom(14);
            if (zoomLevel === 14) {
              infoWindow.open(map, marker);
            }
          });
          markers.push(marker);
        });
      };

      createCountryMarkers();

      const highlightArea = (countryPins: PinData[], map: google.maps.Map) => {
        const paths = countryPins.map((pin) => {
          return { lat: pin.lat, lng: pin.lng };
        });

        const polygon = new google.maps.Polygon({
          paths,
          strokeColor: "#0000FF",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#0000FF",
          fillOpacity: 0.35,
        });

        polygon.setMap(map);
        polygons.push(polygon);
      };

      // Event listener for zoom change
      map.addListener("zoom_changed", () => {
        const zoomLevel: any = map.getZoom();
        if (zoomLevel <= 2) {
          clearMarkersAndPolygons();
          createContinentMarkers();
        } else if (zoomLevel < 6) {
          clearMarkersAndPolygons();
          createCountryMarkers();
        } else if (zoomLevel < 10) {
          clearMarkersAndPolygons();
          const groupedByCity = groupPinsByCity(pins);
          createCityMarkers(groupedByCity);
        }
      });
    }
  }, [isLoaded, pins]);

  if (loadError) {
    return <div>Error loading maps</div>;
  }
  return (
    <>
      {isLoaded && (
        <ChakraProvider>
          <div style={{ height: "100vh" }} ref={mapRef} />
          <div className={classes.mapButtonContainer}>
            <MapButton openAddPinModal={() => setAddPinModal(true)} />
          </div>
          <AddPinModal
            isOpen={addPinModal}
            onClose={(val) => {
              setAddPinModal(val);
              fetchPinsData()
                .then((result) => {
                  setPins(result);
                })
                .catch((e) => console.log(e));
            }}
            isLoaded={isLoaded}
            placesRef={placesRef}
          />
        </ChakraProvider>
      )}
    </>
  );
};

export default MainMaps;
