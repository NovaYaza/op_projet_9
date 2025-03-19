// Importation des constantes et fonctions nécessaires
import { ROUTES_PATH } from '../constants/routes.js'  // Contient les chemins de navigation
import { formatDate, formatStatus } from "../app/format.js"  // Fonctions pour formater la date et le statut
import Logout from "./Logout.js"  // Gestion de la déconnexion

// Définition de la classe Bills
export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document // Référence au document HTML
    this.onNavigate = onNavigate // Fonction pour changer de page
    this.store = store // Stockage des données (API simulée)

    // Sélection du bouton "Nouvelle note de frais" et ajout d'un écouteur d'événement
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)

    // Sélection de toutes les icônes "oeil" pour afficher les justificatifs
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })

    // Instanciation de la gestion de la déconnexion
    new Logout({ document, localStorage, onNavigate })
  }

  // Fonction appelée lorsque l'utilisateur clique sur "Nouvelle note de frais"
  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill']) // Redirige vers la page de création de note de frais
  }

  // Fonction appelée lorsqu'on clique sur l'icône "oeil"
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url") // Récupère l'URL du justificatif
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5) // Définit la largeur de l'image à 50% du modal
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`) // Insère l'image dans la modale
    $('#modaleFile').modal('show') // Affiche la modale
  }

  // Fonction pour récupérer les notes de frais depuis le store (base de données)
  getBills = () => {
    if (this.store) {
      return this.store
      .bills() // Accès aux factures
      .list() // Récupération de la liste des factures
      .then(snapshot => { // Une fois les données récupérées
        const bills = snapshot // On traite chaque facture
          .map(doc => {
            try {
              return {
                ...doc, // On garde toutes les propriétés existantes
                date: doc.date, // Date brute
                dateFr: formatDate(doc.date), // Date formatée en français
                status: formatStatus(doc.status) // Statut traduit
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              // Gestion des erreurs si la date est corrompue ou mal formatée
              console.log(e,'for',doc) // Affichage de l'erreur dans la console
              return {
                ...doc,
                date: doc.date, // Retourne la date brute non formatée
                status: formatStatus(doc.status) // Statut traduit
              }
            }
          })
          console.log('length', bills.length) // Affiche le nombre de factures récupérées
        return bills // Retourne la liste des factures
      })
    }
  }
}
