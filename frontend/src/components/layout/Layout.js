import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ContactPhone as ContactPhoneIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { FaGlobe } from 'react-icons/fa';
import logo from '../../logo.png';

 



const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),

    // ✅ Makes it stretch full height
    minHeight: '100vh',

    // ✅ Add gradient background
    background: 'linear-gradient(to right,rgb(28, 106, 71),rgb(109, 196, 155))',

    // ✅ Make background cover full area even if content is short
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',

    // ✅ Responsive fix for mobile
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  })
);


const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Layout = ({ children }) => {
  
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Leads', icon: <PeopleIcon />, path: '/leads' },
    { text: 'Contacts', icon: <ContactPhoneIcon />, path: '/contacts' },
    { text: 'Scheduled Calls', icon: <ScheduleIcon />, path: '/scheduled-calls' },
    { text: 'Call History', icon: <PhoneIcon />, path: '/call-history' },
    { text: 'Instant Leads', icon: <FlashOnIcon />, path: '/instant-leads' },
    { text: 'Get Your Website', icon: <FaGlobe />, path: '/get-website' },
  ];

  if (user?.isAdmin) {
    menuItems.push({ text: 'Admin Panel', icon: <AdminIcon />, path: '/admin' });
  }

  return (
   <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CRM Dashboard
          </Typography>
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls="profile-menu"
            aria-haspopup="true"
          >
            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate('/profile')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>
    <Drawer
  sx={{
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      boxSizing: 'border-box',
      background: 'linear-gradient(135deg,rgb(5, 60, 35),rgb(123, 211, 170))',
      color: 'white',
    },
  }}
  variant="persistent"
  anchor="left"
  open={open}
>
<Box
  display="flex"
  alignItems="center"
  flexDirection="column"
  p={2}
  style={{ backgroundColor: theme.palette.primary.main }}
>
  <img src={logo} alt="Logo" style={{ width: '90px', height: '80px', marginBottom: '10px' }} />
  <Typography variant="h6" style={{ color: 'white' }}>
    {user ? `Hello, ${user.name}` : 'Welcome'}
  </Typography>
</Box>


        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
               <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
               <ListItemText primary={item.text} sx={{ color: 'white' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
};

export default Layout; 
