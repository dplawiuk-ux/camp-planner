import CampingTrips from './pages/CampingTrips';
import TripDetails from './pages/TripDetails';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CampingTrips": CampingTrips,
    "TripDetails": TripDetails,
}

export const pagesConfig = {
    mainPage: "CampingTrips",
    Pages: PAGES,
    Layout: __Layout,
};