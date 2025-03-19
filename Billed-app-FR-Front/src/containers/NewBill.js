
// Importation des constantes de navigation et de la classe Logout
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

// Définition de la classe NewBill pour gérer la création d'une nouvelle note de frais
export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document // Référence au document HTML
    this.onNavigate = onNavigate // Fonction pour naviguer entre les pages
    this.store = store // Simule une base de données/API

    // Sélection du formulaire et ajout d'un écouteur d'événement sur la soumission
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)

    // Sélection de l'input fichier et ajout d'un écouteur sur le changement de fichier
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)

    // Initialisation des variables pour stocker les infos du fichier
    this.fileUrl = null
    this.fileName = null
    this.billId = null

    // Gestion de la déconnexion
    new Logout({ document, localStorage, onNavigate })
  }

  // Fonction exécutée lorsqu'un fichier est sélectionné
  handleChangeFile = e => {
    e.preventDefault() // Empêche l'action par défaut du navigateur

    // Récupération du fichier sélectionné
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]

    // Vérification du type de fichier
    const allowedExtensions = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedExtensions.includes(file.type)) {
    alert("Format de fichier non supporté. Veuillez sélectionner un fichier JPEG, JPG ou PNG.");
    e.target.value = ""; // Réinitialise le champ fichier
    return;
    }

    // Extraction du nom du fichier à partir du chemin
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]

    // Création d'un objet FormData pour envoyer le fichier
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file) // Ajout du fichier
    formData.append('email', email) // Ajout de l'email de l'utilisateur

    // 📌 Envoi du fichier à l'API (simulée via `store`)
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true // Empêche l'ajout automatique du Content-Type par le navigateur
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl) // Affichage de l'URL du fichier dans la console
        this.billId = key // Stockage de l'identifiant de la note de frais
        this.fileUrl = fileUrl // Stockage de l'URL du fichier
        this.fileName = fileName // Stockage du nom du fichier
      }).catch(error => console.error(error)) // Gestion des erreurs
  }

  // Fonction exécutée lors de la soumission du formulaire
  handleSubmit = e => {
    e.preventDefault() // Empêche le rechargement de la page

    // Affichage dans la console de la date sélectionnée
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)

    // Récupération de l'email de l'utilisateur
    const email = JSON.parse(localStorage.getItem("user")).email

    // Création d'un objet `bill` contenant toutes les informations de la note de frais
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value, // Type de dépense
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value, // Nom de la dépense
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value), // Montant
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value, // Date
      vat: e.target.querySelector(`input[data-testid="vat"]`).value, // TVA
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20, // Pourcentage (par défaut 20)
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value, // Commentaire
      fileUrl: this.fileUrl, // URL du fichier joint
      fileName: this.fileName, // Nom du fichier joint
      status: 'pending' // Statut de la note de frais (en attente de validation)
    }

    // Envoi de la note de frais pour mise à jour dans la base de données
    this.updateBill(bill)

    // Redirection vers la page des notes de frais
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // Fonction pour mettre à jour la note de frais dans la base de donnée
  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), // Conversion de l'objet `bill` en JSON
        selector: this.billId // Utilisation de l'identifiant de la note de frais
      })
      .then(() => {
        // Redirection vers la page des notes de frais après la mise à jour
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error)) // Gestion des erreurs
    }
  }
}