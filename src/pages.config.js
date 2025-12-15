import CampingTrips from './pages/CampingTrips';
import TripDetails from './pages/TripDetails';
import Shed from './pages/Shed';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CampingTrips": CampingTrips,
    "TripDetails": TripDetails,
    "Shed": Shed,
}

export const pagesConfig = {
    mainPage: "CampingTrips",
    Pages: PAGES,
    Layout: __Layout,
};