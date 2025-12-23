import CampingTrips from './pages/CampingTrips';
import Documents from './pages/Documents';
import Shed from './pages/Shed';
import Profile from './pages/Profile';
import TripDetails from './pages/TripDetails';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CampingTrips": CampingTrips,
    "Documents": Documents,
    "Shed": Shed,
    "Profile": Profile,
    "TripDetails": TripDetails,
}

export const pagesConfig = {
    mainPage: "CampingTrips",
    Pages: PAGES,
    Layout: __Layout,
};