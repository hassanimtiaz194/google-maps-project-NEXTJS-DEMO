import React, { FC, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { Input, Box, Text } from "@chakra-ui/react";
import classes from "../utils/styles.module.css";
import "../utils/globals.css";
import { ILocationSearchInput } from "@/utils/alltypes.types";

const LocationSearchInput: FC<ILocationSearchInput> = ({ onValueChange }) => {
  const [autocomplete, setAutocomplete] = useState<any>(null);

  const onLoad = (autocomplete: any) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      // Access latitude and longitude from the place object
      const address = place.formatted_address;
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();
      let city = "";
      let country = "";
  
      // Iterate through address components to find city and country
      place.address_components.forEach((component: any) => {
        const types = component.types;
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("country")) {
          country = component.long_name;
        }
      });
      if (onValueChange) onValueChange(address, latitude, longitude, city, country);
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  return (
    <Box>
      <Text className={classes.modallabel}>Location:</Text>
      <Autocomplete
        className={classes.autocompleteContainer}
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <Input
          placeholder="Type to search..."
          // variant="filled"
          size="md"
          // width="100%"
          backgroundColor="#F4F4F5"
        />
      </Autocomplete>
    </Box>
  );
};

export default LocationSearchInput;
