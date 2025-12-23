import CampingTrips from './pages/CampingTrips';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import Shed from './pages/Shed';
import TripDetails from './pages/TripDetails';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CampingTrips": CampingTrips,
    "Documents": Documents,
    "Profile": Profile,
    "Shed": Shed,
    "TripDetails": TripDetails,
}

export const pagesConfig = {
    mainPage: "CampingTrips",
    Pages: PAGES,
    Layout: __Layout,
};