import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "common": {
        "edit": "Edit",
        "delete": "Delete",
        "cancel": "Cancel",
        "save": "Save",
        "close": "Close",
        "add": "Add",
        "remove": "Remove",
        "back": "Back",
        "loading": "Loading",
        "confirm": "Confirm",
        "search": "Search",
        "filter": "Filter",
        "all": "All",
        "notes": "Notes",
        "status": "Status",
        "name": "Name",
        "done": "Done",
        "export": "Export",
        "upload": "Upload"
      },
      "nav": {
        "trips": "Trips",
        "shed": "Shed",
        "documents": "Documents",
        "profile": "Profile"
      },
      "trip": {
        "title": "Trip",
        "trips": "Trips",
        "myTrips": "My Camping Trips",
        "newTrip": "New Trip",
        "editTrip": "Edit Trip",
        "deleteTrip": "Delete Trip",
        "tripDetails": "Trip Details",
        "tripCode": "Trip Code",
        "joinTrip": "Join Trip",
        "location": "Location",
        "startDate": "Start Date",
        "endDate": "End Date",
        "paddleIn": "Paddle-in Trip",
        "planning": "Planning",
        "completed": "Completed",
        "backToTrips": "Back to Trips",
        "tripNotFound": "Trip not found",
        "deleteTripConfirm": "This will permanently delete \"{name}\" and all its data. This action cannot be undone.",
        "coverImage": "Cover Image"
      },
      "members": {
        "title": "Trip Members",
        "addMembers": "Add Trip Members",
        "tripLeader": "Trip Leader",
        "packLeader": "Pack Leader",
        "camper": "Camper",
        "jrCamper": "Jr Camper",
        "memberDetails": "Member Details",
        "memberLevel": "Member Level",
        "allocations": "Allocations",
        "tentAssigned": "Tent Assigned",
        "noTent": "No Tent",
        "watercraftAssigned": "Watercraft Assigned",
        "noWatercraft": "No Watercraft",
        "committedToBring": "Committed to Bring",
        "excludeFromExpenses": "Exclude from expenses",
        "noExpenses": "No Expenses",
        "manageRoles": "Manage Roles",
        "changeRole": "Change Role",
        "noMembers": "No members yet"
      },
      "sections": {
        "team": "Team",
        "gear": "Gear",
        "meals": "Meals",
        "expenses": "Expenses",
        "documents": "Documents",
        "chat": "Chat"
      },
      "tent": {
        "title": "Sleeping Arrangements",
        "addTent": "Add Tent",
        "tentAllocation": "Tent Allocation",
        "customTent": "Custom Tent",
        "fromShed": "From Shed",
        "tentName": "Tent Name",
        "capacity": "Capacity",
        "people": "people",
        "assigned": "Assigned",
        "unassigned": "Unassigned Members",
        "summary": "Tent Summary",
        "totalCapacity": "Total Capacity",
        "totalAssigned": "Total Assigned"
      },
      "watercraft": {
        "title": "Watercraft Allocation",
        "addWatercraft": "Add Watercraft",
        "customWatercraft": "Custom Watercraft",
        "fromShed": "From Shed",
        "watercraftName": "Watercraft Name",
        "capacity": "Capacity",
        "people": "people",
        "assigned": "Assigned",
        "unassigned": "Unassigned Members",
        "summary": "Watercraft Summary",
        "totalCapacity": "Total Capacity",
        "totalAssigned": "Total Assigned",
        "full": "Full"
      },
      "gear": {
        "title": "Shared Gear",
        "addGear": "Add Gear",
        "requestGear": "Request Gear",
        "gearType": "Gear Type",
        "rental": "Rental",
        "assignMembers": "Assign Members",
        "noGear": "No shared gear yet",
        "requests": "Gear Requests",
        "openRequests": "Open Requests",
        "confirmedItems": "Confirmed Items",
        "volunteer": "I can bring this",
        "confirmRequest": "Confirm Request",
        "declined": "Declined",
        "confirmed": "Confirmed",
        "types": {
          "tents": "Tents",
          "watercraft": "Watercraft",
          "sleeping": "Sleeping",
          "fire": "Fire",
          "water": "Water",
          "kitchen": "Kitchen",
          "other": "Other"
        }
      },
      "meals": {
        "title": "Meal Plan",
        "addMeal": "Add Meal",
        "requestSharedFood": "Request Shared Food",
        "dayNumber": "Day {{number}}",
        "mealType": "Meal Type",
        "itemName": "Item Name",
        "assignMember": "Assign Member",
        "sharedFood": "Shared Food",
        "myMeals": "My Meals",
        "openRequests": "Open Requests",
        "confirmedItems": "Confirmed Items",
        "accept": "Accept",
        "decline": "Decline",
        "types": {
          "breakfast": "Breakfast",
          "lunch": "Lunch",
          "dinner": "Dinner",
          "dessert": "Dessert"
        }
      },
      "expenses": {
        "title": "Expense Tracker",
        "addExpense": "Add Expense",
        "editExpense": "Edit Expense",
        "description": "Description",
        "amount": "Amount",
        "category": "Category",
        "paidBy": "Paid By",
        "splitBetween": "Split Between",
        "date": "Date",
        "receipt": "Receipt",
        "uploadReceipt": "Upload Receipt",
        "memberBalances": "Member Balances",
        "owes": "owes",
        "isOwed": "is owed",
        "settled": "Settled up",
        "expensesByCategory": "Expenses by Category",
        "total": "Total",
        "exportPDF": "Export PDF",
        "noExpenses": "No expenses yet",
        "categories": {
          "food": "Food",
          "accommodation": "Accommodation",
          "gear_rental": "Gear Rental",
          "transportation": "Transportation",
          "permits": "Permits",
          "activities": "Activities",
          "other": "Other"
        }
      },
      "documents": {
        "title": "Documents",
        "myDocuments": "My Documents",
        "addDocument": "Add Document",
        "uploadDocument": "Upload Document",
        "documentName": "Document Name",
        "selectTrip": "Select Trip (Optional)",
        "viewDocument": "View Document",
        "noDocuments": "No documents yet",
        "categories": {
          "permit": "Permit",
          "booking": "Booking",
          "parking_pass": "Parking Pass",
          "map": "Map",
          "directions": "Directions",
          "photo": "Photo",
          "other": "Other"
        }
      },
      "chat": {
        "title": "Trip Chat",
        "general": "General",
        "admin": "Admin Only",
        "typeMessage": "Type a message...",
        "send": "Send",
        "noMessages": "No messages yet"
      },
      "shed": {
        "title": "Gear Shed",
        "myGear": "My Gear",
        "addEquipment": "Add Equipment",
        "editEquipment": "Edit Equipment",
        "equipmentName": "Equipment Name",
        "equipmentType": "Equipment Type",
        "scanPhoto": "Scan Photo",
        "noEquipment": "No equipment yet",
        "startBuilding": "Start building your gear collection"
      },
      "profile": {
        "title": "Profile",
        "displayName": "Display Name",
        "email": "Email",
        "alternateEmails": "Alternate Emails",
        "addEmail": "Add Email",
        "logout": "Logout"
      },
      "auth": {
        "login": "Login",
        "notRegistered": "Not Registered",
        "pleaseRegister": "Please register to access this app"
      }
    }
  },
  fr: {
    translation: {
      "common": {
        "edit": "Modifier",
        "delete": "Supprimer",
        "cancel": "Annuler",
        "save": "Enregistrer",
        "close": "Fermer",
        "add": "Ajouter",
        "remove": "Retirer",
        "back": "Retour",
        "loading": "Chargement",
        "confirm": "Confirmer",
        "search": "Rechercher",
        "filter": "Filtrer",
        "all": "Tout",
        "notes": "Notes",
        "status": "Statut",
        "name": "Nom",
        "done": "Terminé",
        "export": "Exporter",
        "upload": "Téléverser"
      },
      "nav": {
        "trips": "Voyages",
        "shed": "Remise",
        "documents": "Documents",
        "profile": "Profil"
      },
      "trip": {
        "title": "Voyage",
        "trips": "Voyages",
        "myTrips": "Mes voyages de camping",
        "newTrip": "Nouveau voyage",
        "editTrip": "Modifier le voyage",
        "deleteTrip": "Supprimer le voyage",
        "tripDetails": "Détails du voyage",
        "tripCode": "Code du voyage",
        "joinTrip": "Joindre le voyage",
        "location": "Lieu",
        "startDate": "Date de début",
        "endDate": "Date de fin",
        "paddleIn": "Voyage en canot",
        "planning": "Planification",
        "completed": "Terminé",
        "backToTrips": "Retour aux voyages",
        "tripNotFound": "Voyage introuvable",
        "deleteTripConfirm": "Ceci supprimera définitivement « {{name}} » et toutes ses données. Cette action ne peut pas être annulée.",
        "coverImage": "Image de couverture"
      },
      "members": {
        "title": "Membres du voyage",
        "addMembers": "Ajouter des membres",
        "tripLeader": "Chef de voyage",
        "packLeader": "Chef de groupe",
        "camper": "Campeur",
        "jrCamper": "Jr Campeur",
        "memberDetails": "Détails du membre",
        "memberLevel": "Niveau du membre",
        "allocations": "Attributions",
        "tentAssigned": "Tente assignée",
        "noTent": "Pas de tente",
        "watercraftAssigned": "Embarcation assignée",
        "noWatercraft": "Pas d'embarcation",
        "committedToBring": "Engagé à apporter",
        "excludeFromExpenses": "Exclure des dépenses",
        "noExpenses": "Pas de dépenses",
        "manageRoles": "Gérer les rôles",
        "changeRole": "Changer le rôle",
        "noMembers": "Aucun membre pour le moment"
      },
      "sections": {
        "team": "Équipe",
        "gear": "Équipement",
        "meals": "Repas",
        "expenses": "Dépenses",
        "documents": "Documents",
        "chat": "Clavardage"
      },
      "tent": {
        "title": "Couchage",
        "addTent": "Ajouter une tente",
        "tentAllocation": "Attribution des tentes",
        "customTent": "Tente personnalisée",
        "fromShed": "De la remise",
        "tentName": "Nom de la tente",
        "capacity": "Capacité",
        "people": "personnes",
        "assigned": "Assigné",
        "unassigned": "Membres non assignés",
        "summary": "Résumé des tentes",
        "totalCapacity": "Capacité totale",
        "totalAssigned": "Total assigné"
      },
      "watercraft": {
        "title": "Attribution des embarcations",
        "addWatercraft": "Ajouter une embarcation",
        "customWatercraft": "Embarcation personnalisée",
        "fromShed": "De la remise",
        "watercraftName": "Nom de l'embarcation",
        "capacity": "Capacité",
        "people": "personnes",
        "assigned": "Assigné",
        "unassigned": "Membres non assignés",
        "summary": "Résumé des embarcations",
        "totalCapacity": "Capacité totale",
        "totalAssigned": "Total assigné",
        "full": "Complet"
      },
      "gear": {
        "title": "Équipement partagé",
        "addGear": "Ajouter équipement",
        "requestGear": "Demander équipement",
        "gearType": "Type d'équipement",
        "rental": "Location",
        "assignMembers": "Assigner des membres",
        "noGear": "Aucun équipement partagé",
        "requests": "Demandes d'équipement",
        "openRequests": "Demandes ouvertes",
        "confirmedItems": "Articles confirmés",
        "volunteer": "Je peux apporter ça",
        "confirmRequest": "Confirmer la demande",
        "declined": "Refusé",
        "confirmed": "Confirmé",
        "types": {
          "tents": "Tentes",
          "watercraft": "Embarcations",
          "sleeping": "Couchage",
          "fire": "Feu",
          "water": "Eau",
          "kitchen": "Cuisine",
          "other": "Autre"
        }
      },
      "meals": {
        "title": "Plan de repas",
        "addMeal": "Ajouter un repas",
        "requestSharedFood": "Demander nourriture partagée",
        "dayNumber": "Jour {{number}}",
        "mealType": "Type de repas",
        "itemName": "Nom de l'article",
        "assignMember": "Assigner un membre",
        "sharedFood": "Nourriture partagée",
        "myMeals": "Mes repas",
        "openRequests": "Demandes ouvertes",
        "confirmedItems": "Articles confirmés",
        "accept": "Accepter",
        "decline": "Refuser",
        "types": {
          "breakfast": "Déjeuner",
          "lunch": "Dîner",
          "dinner": "Souper",
          "dessert": "Dessert"
        }
      },
      "expenses": {
        "title": "Suivi des dépenses",
        "addExpense": "Ajouter une dépense",
        "editExpense": "Modifier la dépense",
        "description": "Description",
        "amount": "Montant",
        "category": "Catégorie",
        "paidBy": "Payé par",
        "splitBetween": "Partager entre",
        "date": "Date",
        "receipt": "Reçu",
        "uploadReceipt": "Téléverser un reçu",
        "memberBalances": "Soldes des membres",
        "owes": "doit",
        "isOwed": "est dû",
        "settled": "Réglé",
        "expensesByCategory": "Dépenses par catégorie",
        "total": "Total",
        "exportPDF": "Exporter en PDF",
        "noExpenses": "Aucune dépense pour le moment",
        "categories": {
          "food": "Nourriture",
          "accommodation": "Hébergement",
          "gear_rental": "Location d'équipement",
          "transportation": "Transport",
          "permits": "Permis",
          "activities": "Activités",
          "other": "Autre"
        }
      },
      "documents": {
        "title": "Documents",
        "myDocuments": "Mes documents",
        "addDocument": "Ajouter un document",
        "uploadDocument": "Téléverser un document",
        "documentName": "Nom du document",
        "selectTrip": "Sélectionner un voyage (optionnel)",
        "viewDocument": "Voir le document",
        "noDocuments": "Aucun document pour le moment",
        "categories": {
          "permit": "Permis",
          "booking": "Réservation",
          "parking_pass": "Passe de stationnement",
          "map": "Carte",
          "directions": "Directions",
          "photo": "Photo",
          "other": "Autre"
        }
      },
      "chat": {
        "title": "Clavardage du voyage",
        "general": "Général",
        "admin": "Admin seulement",
        "typeMessage": "Écrivez un message...",
        "send": "Envoyer",
        "noMessages": "Aucun message pour le moment"
      },
      "shed": {
        "title": "Remise à équipement",
        "myGear": "Mon équipement",
        "addEquipment": "Ajouter équipement",
        "editEquipment": "Modifier équipement",
        "equipmentName": "Nom de l'équipement",
        "equipmentType": "Type d'équipement",
        "scanPhoto": "Scanner une photo",
        "noEquipment": "Aucun équipement pour le moment",
        "startBuilding": "Commencez à bâtir votre collection"
      },
      "profile": {
        "title": "Profil",
        "displayName": "Nom affiché",
        "email": "Courriel",
        "alternateEmails": "Courriels alternatifs",
        "addEmail": "Ajouter un courriel",
        "logout": "Déconnexion"
      },
      "auth": {
        "login": "Connexion",
        "notRegistered": "Non inscrit",
        "pleaseRegister": "Veuillez vous inscrire pour accéder à cette application"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;