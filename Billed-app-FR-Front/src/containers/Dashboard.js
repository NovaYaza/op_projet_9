import { formatDate } from '../app/format.js' // Formatage des dates
import DashboardFormUI from '../views/DashboardFormUI.js' // Interface du formulaire d'édition
import BigBilledIcon from '../assets/svg/big_billed.js' // Icône pour l'affichage des factures
import { ROUTES_PATH } from '../constants/routes.js' // Chemins de navigation
import USERS_TEST from '../constants/usersTest.js' // Liste des utilisateurs de test
import Logout from "./Logout.js" // Gestion de la déconnexion

// Filtre les factures en fonction du statut (pending, accepted, refused)
export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // Environnement de test Jest
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // Environnement de production
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email) // Exclut les utilisateurs de test et l'admin connecté
      }

      return selectCondition
    }) : []
}

// Génère une carte de facture
export const card = (bill) => {
  // Extrait prénom et nom depuis l'email
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
  firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

// Génère toutes les cartes de factures
export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

// Retourne le statut en fonction de l'index
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store

    // Ajout d'événements de clic sur les icônes des statuts de factures
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))

    // Gestion de la déconnexion
    new Logout({ localStorage, onNavigate })
  }

  // Ouvre un justificatif en affichant l'image dans un modal
  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  // Gère l'affichage d'un ticket de facture
  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id
    if (this.counter % 2 === 0) {
      // Met toutes les factures en bleu sauf celle sélectionnée
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })

      // Affiche le formulaire de modification
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      $('.vertical-navbar').css({ height: '150vh' })
      this.counter ++
    } else {
      // Réinitialise l'affichage
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      this.counter ++
    }

    // Ajout d'événements sur les boutons du formulaire
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  }

  // Accepte une facture
  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  // Refuse une facture
  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  // Affiche/masque les factures en fonction du statut sélectionné
  handleShowTickets(e, bills, index) {
    // Ferme toutes les autres listes avant d'ouvrir celle sélectionnée
    for (let i = 1; i <= 3; i++) {
      if (i !== index) {
        $(`#arrow-icon${i}`).css({ transform: 'rotate(90deg)' });
        $(`#status-bills-container${i}`).html("");
      }
    }
  
    if (this.counter === undefined || this.index !== index) this.counter = 0;
    if (this.index === undefined || this.index !== index) this.index = index;
    
    if (this.counter % 2 === 0) {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)' });
      $(`#status-bills-container${this.index}`)
        .html(cards(filteredBills(bills, getStatus(this.index))));
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)' });
      $(`#status-bills-container${this.index}`).html("");
    }
  
    this.counter++;
  
    // Réattache les événements de clic aux tickets
    bills.forEach(bill => {
      $(`#open-bill${bill.id}`).off("click"); // Supprime les anciens événements pour éviter les doublons
      $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills));
    });
  
    return bills;
  }

  // Récupère les factures de tous les utilisateurs
  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => ({
          id: doc.id,
          ...doc,
          date: doc.date,
          status: doc.status
        }))
        return bills
      })
      .catch(error => {
        throw error;
      })
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  // Met à jour une facture dans le store
  updateBill = (bill) => {
    if (this.store) {
    return this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: bill.id})
      .then(bill => bill)
      .catch(console.log)
    }
  }
}
