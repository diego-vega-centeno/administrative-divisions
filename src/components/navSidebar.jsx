import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { navSideBox, navSideBarButton, navSideBarIcon, navSideItem } from "../styles/navSidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";

export default function NavSidebar() {
  const [open, setOpen] = useState(false);
  const toggleDrawer = (bool) => () => setOpen(bool);

  const navList = (
    <Box sx={navSideBox} onClick={toggleDrawer(false)}>
      <List>
        {['About', 'Log in', 'Favorites'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton sx={navSideItem}>
              {text}
            </ListItemButton>
          </ListItem>
        ))
        }
      </List>
    </Box>
  )

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)} sx={navSideBarButton}>
        <FontAwesomeIcon style={navSideBarIcon} icon={faBars} />
      </IconButton>
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        anchor="right"
      >
        {navList}
      </Drawer>
    </div>
  )
}