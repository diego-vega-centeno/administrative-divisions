import Drawer from "@mui/material/Drawer";
import { useContext, useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { navSideBox, navSideBarButton, navSideBarIcon, navSideItem } from "../styles/navSidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import LoginMenu from './LoginMenu.jsx'
import FavoritesMenu from "./FavoritesMenu.jsx";

import { AuthContext } from "./AuthContext.jsx";

export default function NavSidebar() {
  const [open, setOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isFavoritesMenuOpen, setIsFavoritesMenuOpen] = useState(false);
  const { userData, setUserData, loading } = useContext(AuthContext);

  const toggleDrawer = (bool) => () => setOpen(bool);

  const handleUserStateButton = () => {
    if (userData) {
      logoutUser();
    } else {
      setIsLoginMenuOpen(true);
    }
  }

  const handleFavoritesButton = () => {
    setIsFavoritesMenuOpen(true);
  }

  const logoutUser = async () => {
    try {
      await fetch(import.meta.env.VITE_BACKEND_URL + '/user/logout',
        { credentials: 'include' }
      )
      setUserData(null);
      window.location.reload();
    } catch (error) {
      errorLog(`Logout failed: ${error}`)
    }
  }

  let userState;
  if (loading) userState = 'Loading ...'
  else userState = userData ? 'Log out' : 'Log in'

  const navList = (
    <Box sx={navSideBox} onClick={toggleDrawer(false)}>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleUserStateButton} sx={navSideItem}>
            {userState}
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleFavoritesButton} sx={navSideItem}>
            Favorites
          </ListItemButton>
        </ListItem>
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
      {isLoginMenuOpen && <LoginMenu
        open={isLoginMenuOpen}
        onClose={() => setIsLoginMenuOpen(false)}
      />}
      {isFavoritesMenuOpen && <FavoritesMenu
        open={isFavoritesMenuOpen}
        onClose={() => setIsFavoritesMenuOpen(false)}
      />}
    </div>
  )
}