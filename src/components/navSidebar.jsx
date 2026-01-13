import Drawer from "@mui/material/Drawer";
import { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { navSideBox, navSideBarButton, navSideBarIcon, navSideItem } from "../styles/navSidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import LoginMenu from './loginMenu.jsx'

export default function NavSidebar() {
  const [open, setOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const toggleDrawer = (bool) => () => setOpen(bool);

  const handleLoginButton = () => {
    setIsLoginMenuOpen(true);
  }

  const buttonHandlers = { 'Log in': handleLoginButton, 'About': ()=>{}, 'Favorites': ()=>{} }

  const navList = (
    <Box sx={navSideBox} onClick={toggleDrawer(false)}>
      <List>
        {['About', 'Log in', 'Favorites'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={buttonHandlers[text]} sx={navSideItem}>
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
      <LoginMenu
        open={isLoginMenuOpen}
        onClose={() => setIsLoginMenuOpen(false)}
      />
    </div>
  )
}