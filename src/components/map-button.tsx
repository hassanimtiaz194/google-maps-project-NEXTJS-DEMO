import { FC, useState } from "react";
import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon,
} from "@chakra-ui/react";
import { IoMdPin } from "react-icons/io";
import classes from "../utils/styles.module.css";
import { IMapButton } from "@/utils/alltypes.types";
import { HiOutlinePencil } from "react-icons/hi2";

const MapButton: FC<IMapButton> = ({ openAddPinModal }) => {
  const [isClicked, setIsClicked] = useState(false);
  return (
    <Menu>
      <MenuButton
        className={classes.mapMenuButton}
        as={IconButton}
        aria-label="Open menu"
        icon={<Icon color="white" as={IoMdPin} fontSize="22px" />}
        onClick={() => setIsClicked(true)}
        variant="ghost"
      />
      {isClicked && (
        <MenuList placeSelf="auto" padding='10px'>
          <MenuItem
            className={classes.menuItem}
            icon={<Icon fontSize="18px" as={HiOutlinePencil} />}
            onClick={() => {
              if (openAddPinModal) openAddPinModal();
            }}
          >
            Add location
          </MenuItem>
        </MenuList>
      )}
    </Menu>
  );
};

export default MapButton;
