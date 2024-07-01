import { MutableRefObject } from "react";

export type IMainMaps = {
  postData?: (
    sId: string,
    name: string,
    location: string,
    lat: number,
    lng: number
  ) => void;
};

export type IAddPinModal = {
  isOpen?: boolean;
  onClose?: (val: boolean) => void;
  isLoaded?: boolean;
  placesRef?: MutableRefObject<HTMLInputElement | null>;
  postData?: (
    sId: string,
    name: string,
    location: string,
    lat: number,
    lng: number
  ) => void;
};

export type IMapButton = {
  openAddPinModal?: () => void;
};

export type ILocationSearchInput = {
  onValueChange?: (location: string, lat: number, lng: number, city: string, country: string) => void;
};
