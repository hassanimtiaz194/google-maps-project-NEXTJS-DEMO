"use client";
import { FC, useEffect, useRef, useState } from "react";
import classes from "../utils/styles.module.css";
import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { IAddPinModal } from "@/utils/alltypes.types";
import LocationSearchInput from "./location-search-input";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/app/firebase";

async function addPinsData(
  sId: string,
  name: string,
  location: string,
  lat: number,
  lng: number,
  city: string,
  country: string
) {
  try {
    const docRef = await addDoc(collection(db, "pins"), {
      sId: sId,
      name,
      location,
      lat,
      lng,
      city,
      country,
    });
    console.log("Document Created", docRef.id);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

const AddPinModal: FC<IAddPinModal> = ({
  isOpen = false,
  isLoaded = false,
  onClose,
}) => {
  const [addPins, setAddPins] = useState({
    sId: "",
    name: "",
    location: "",
    lat: 0,
    lng: 0,
    city: "",
    country: "",
  });
  const toast = useToast();
  const [isError, setIsError] = useState(false);

  const handleSubmit = async () => {
    if (addPins.location.trim() === "") {
      setIsError(true);
      return;
    }
    setIsError(false);
    const isDataPosted = await addPinsData(
      addPins.sId,
      addPins.name,
      addPins.location,
      addPins.lat,
      addPins.lng,
      addPins.city,
      addPins.country
    );
    if (isDataPosted) {
      toast({
        title: "location added successfully.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    }
    setAddPins({
      sId: "",
      name: "",
      location: "",
      lat: 0,
      lng: 0,
      city: "",
      country: "",
    });
    if (onClose && isDataPosted) onClose(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (onClose) onClose(!isOpen);
        }}
      >
        <ModalOverlay />
        <ModalContent className={classes.modelContainer}>
          <ModalHeader>Add your location on the map</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box className={classes.modallabel}>Skool ID</Box>
            <Input
              backgroundColor="#F4F4F5"
              size="md"
              placeholder="@ first-last-123456"
              onChange={(e) => setAddPins({ ...addPins, sId: e.target.value })}
            />
            <Box className={classes.modallabel}>Display Name</Box>
            <Input
              backgroundColor="#F4F4F5"
              size="md"
              placeholder="First Last"
              onChange={(e) => setAddPins({ ...addPins, name: e.target.value })}
            />
            <LocationSearchInput
              onValueChange={(
                location: string,
                lat: number,
                lng: number,
                city: string,
                country: string
              ) =>
                setAddPins({ ...addPins, location, lat, lng, city, country })
              }
            />
            {isError && (
              <Box className={classes.modalSublabel} color="red">
                Please select a valid address from location suggestions
              </Box>
            )}
            <Box className={classes.modalSublabel}>
              For your safety, please add an approximate location and NOT your
              exact address.
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              backgroundColor="#000000"
              color="#ffffff"
              borderRadius="16px"
              variant="solid"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddPinModal;
