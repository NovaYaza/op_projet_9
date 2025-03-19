
// Importation des constantes de navigation
import { ROUTES_PATH } from '../constants/routes.js'

// Variable globale pour stocker la page précédente
export let PREVIOUS_LOCATION = ''

// we use a class so as to test its methods in e2e tests
// Définition de la classe Login pour gérer l'authentification
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document // Référence au document HTML
    this.localStorage = localStorage // Accès au localStorage pour stocker l'utilisateur
    this.onNavigate = onNavigate // Fonction pour naviguer entre les pages
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION // Stocke la page précédente
    this.store = store // Simule une base de données/API

    // Sélection et écoute du formulaire de connexion pour les employés
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`)
    formEmployee.addEventListener("submit", this.handleSubmitEmployee)

    // Sélection et écoute du formulaire de connexion pour les administrateurs
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`)
    formAdmin.addEventListener("submit", this.handleSubmitAdmin)
  }

  // Fonction exécutée lorsque l'employé soumet le formulaire de connexion
  handleSubmitEmployee = e => {
    e.preventDefault() // Empêche le rechargement de la page

    // Création d'un objet `user` contenant les informations de connexion
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
      status: "connected" // Statut connecté
    }

    // Stocke les informations de l'utilisateur dans le localStorage
    this.localStorage.setItem("user", JSON.stringify(user))

    // Tente de se connecter avec `login()`, si échec, crée un nouvel utilisateur avec `createUser()`
    this.login(user)
      .catch(
        (err) => this.createUser(user)
      )
      .then(() => {
        // Navigation vers la page des notes de frais
        this.onNavigate(ROUTES_PATH['Bills'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Bills']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION

        // Réinitialisation de l'arrière-plan de la page
        this.document.body.style.backgroundColor="#fff"
      })

  }

  // Fonction exécutée lorsque l'administrateur soumet le formulaire de connexion
  handleSubmitAdmin = e => {
    e.preventDefault() // Empêche le rechargement de la page

    // Création d'un objet `user` contenant les informations de connexion
    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
      status: "connected" // Statut connecté
    }

    // Stocke les informations de l'utilisateur dans le localStorage
    this.localStorage.setItem("user", JSON.stringify(user))

    // Tente de se connecter avec `login()`, si échec, crée un nouvel utilisateur avec `createUser()`
    this.login(user)
      .catch(
        (err) => this.createUser(user)
      )
      .then(() => {
        // Navigation vers le tableau de bord
        this.onNavigate(ROUTES_PATH['Dashboard'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION

        // Réinitialisation de l'arrière-plan de la page
        document.body.style.backgroundColor="#fff"
      })
  }

  // Fonction pour authentifier un utilisateur
  // not need to cover this function by tests
  /* istanbul ignore next */
  login = (user) => {
    if (this.store) {
      return this.store
      .login(JSON.stringify({
        email: user.email,
        password: user.password,
      })).then(({jwt}) => {
        // Stocke le jeton JWT dans le localStorage pour maintenir la session
        localStorage.setItem('jwt', jwt)
      })
    } else {
      return null // Retourne `null` si le `store` n'existe pas
    }
  }

  // Fonction pour créer un nouvel utilisateur dans la base de données simulée
  // not need to cover this function by tests
  /* istanbul ignore next */
  createUser = (user) => {
    if (this.store) {
      return this.store
      .users()
      .create({data:JSON.stringify({
        type: user.type,
        name: user.email.split('@')[0], // Utilise la partie avant @ comme nom
        email: user.email,
        password: user.password,
      })})
      .then(() => {
        console.log(`User with ${user.email} is created`)
        return this.login(user) // Une fois l'utilisateur créé, on tente de le connecter
      })
    } else {
      return null // Retourne `null` si le `store` n'existe pas
    }
  }
}
