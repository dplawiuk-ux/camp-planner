import CampingTrips from './pages/CampingTrips';
import Documents from './pages/Documents';
import Shed from './pages/Shed';
import TripDetails from './pages/TripDetails';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CampingTrips": CampingTrips,
    "Documents": Documents,
    "Shed": Shed,
    "TripDetails": TripDetails,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "CampingTrips",
    Pages: PAGES,
    Layout: __Layout,
};