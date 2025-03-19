// Importation des composants nécessaires pour l'affichage
import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"
import Actions from './Actions.js'

// Fonction qui génère une ligne du tableau pour une note de frais
const row = (bill) => {
  let date = bill.dateFr // Date formatée
  if (date == undefined) {date = bill.date} // Utilisation de la date brute si `dateFr` est undefined
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}<!-- Bouton d'action pour voir le justificatif -->
      </td>
    </tr>
    `)
  }

// Fonction qui génère toutes les lignes du tableau à partir des données
const rows = (data) => {
  console.log(data); // Debug : affichage des données des factures dans la console
  if (data) {
    // Tri des factures par date (du plus récent au plus ancien)
    data.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  // Si des factures existent, on les affiche, sinon on renvoie une chaîne vide
  return (data && data.length) ? data.map(bill => row(bill)).join("") : ""
}

// Fonction principale qui génère l'interface des notes de frais
export default ({ data: bills, loading, error }) => {
  
  // Fonction qui génère le code HTML du **modale** pour afficher un justificatif
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)
  
  // Gestion du chargement et des erreurs
  if (loading) {
    return LoadingPage() // Affiche une page de chargement si `loading` est `true`
  } else if (error) {
    return ErrorPage(error) // Affiche une page d'erreur si une erreur est survenue
  }
  
  // Génération de la page des notes de frais
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)} <!-- Insertion des lignes du tableau -->
          </tbody>
          </table>
        </div>
      </div>
      ${modal()} <!-- Ajout du modale pour afficher les justificatifs -->
    </div>`
  )
}