/**
 * @jest-environment jsdom
 *
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import Bills from "../containers/Bills.js"; // Le fichier qu'on teste
import BillsUI from "../views/BillsUI.js"; // Interface utilisateur associée
import { ROUTES_PATH, ROUTES } from "../constants/routes.js"; // Chemins de navigation
import { localStorageMock } from "../__mocks__/localStorage.js"; // Mock de localStorage
import mockStore from "../__mocks__/store.js"; // Mock du store pour éviter d'appeler une vraie API
import { bills } from "../fixtures/bills.js" // Données factices pour les tests

// Simulation du store (API backend)
jest.mock("../app/store", () => mockStore);

describe("When I navigate to Bill", () => { 
   // Test pour récupérer des factures depuis une API et afficher un message d'erreur 404
   test("fetches bills from an API and fails with 404 message error", async () => {
    jest.spyOn( mockStore, 'bills')
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      }
    })

    try {
      document.body.innerHTML = ROUTES({pathname: ROUTES_PATH['Bills'], data: await mockStore.bills().list()})
    } catch (error) {
      expect(error.message).toBe("Erreur 404")
    }
  })

  // Test pour récupérer des factures depuis une API et afficher un message d'erreur 500
    test("fetches bills from an API and fails with 500 message error", async () => {
      jest.spyOn( mockStore, 'bills')
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        }
      })

      try {
        document.body.innerHTML = ROUTES({pathname: ROUTES_PATH['Bills'], data: await mockStore.bills().list()})
      } catch (error) {
        expect(error.message).toBe("Erreur 500")
      }
    })
})

// Début du bloc de test principal
describe("Given I am connected as an employee", () => { // Étant connecté en tant qu'employé
  let billsInstance;
  let onNavigate;

  // Avant chaque test, on prépare l'environnement de test
  beforeEach(() => {
    // Mock de localStorage pour simuler un utilisateur connecté
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

    // Affichage de l'interface utilisateur avec les données factices
    document.body.innerHTML = BillsUI({ data: bills });

    // Mock de la fonction de navigation
    onNavigate = jest.fn();

    // Création d'une nouvelle instance de Bills avec le store mocké
    billsInstance = new Bills({
      document,
      onNavigate,
      store: mockStore, // Simule les appels API
      localStorage: window.localStorage,
    });
  });

  // Test du bouton "Nouvelle note de frais"
  describe("When I click on the 'New Bill' button", () => {
    test("Then it should navigate to the NewBill page", () => { // Ensuite, il faut accéder à la page NewBill
      const newBillButton = screen.getByTestId("btn-new-bill"); // Sélectionne le bouton
      fireEvent.click(newBillButton); // Simule un clic

      // Vérifie que la navigation a bien été déclenchée vers la page NewBill
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });

  // Test de l'icône "oeil" qui ouvre la modal d'image
  describe("When I click on the eye icon", () => {
    test("Then it should open a modal with the bill image", () => {
      $.fn.modal = jest.fn(); // Mock de la fonction modal de Bootstrap

      // Préparation du DOM avec un icône "oeil" et une modal
      document.body.innerHTML = `
        <div data-testid="icon-eye" data-bill-url="https://test.com/test.png"></div>
        <div id="modaleFile">
          <div class="modal-body"></div>
        </div>
      `;

      const eyeIcon = screen.getByTestId("icon-eye"); // Sélectionne l'icône oeil
      billsInstance.handleClickIconEye(eyeIcon); // Simule le clic sur l'icône

      // Vérifie que l'image de la facture est bien affichée dans la modal
      expect(document.querySelector(".modal-body").innerHTML).toContain("https://test.com/test.png");
      // Vérifie que la modal a bien été ouverte
      expect($.fn.modal).toHaveBeenCalledWith("show");
    });
  });

  // Tests de récupération et formatage des factures
  describe("When getBills is called", () => {
    test("Then it should return formatted bills", async () => { // Ensuite, il devrait renvoyer des factures formatées
      // Appelle la méthode getBills et attend la réponse
      const bills = await billsInstance.getBills();

      // Vérifie que les données ont bien été récupérées
      expect(bills).toBeDefined();
      // Vérifie que la date a été formatée en "jour Mois année"
      expect(bills[0].dateFr).toBe("4 Avr. 2004");
      // Vérifie que le statut est bien "En attente"
      expect(bills[0].status).toBe("En attente");
    });

    // Test de gestion des erreurs de formatage des dates
    test("Then it should log an error if date formatting fails", async () => {
      // Crée une facture avec une date invalide
      const corruptedBill = { date: "invalid-date", status: "pending" };

      // Mocke l'API pour qu'elle retourne une facture corrompue
      jest.spyOn(mockStore.bills(), "list").mockResolvedValueOnce([corruptedBill]);
      console.log = jest.fn();

      // Appelle getBills
      const bills = await billsInstance.getBills();

      // Vérifie que l'erreur a bien été affichée dans la console
      expect(console.log).toHaveBeenCalledWith(expect.any(Error), "for", corruptedBill);
      // Vérifie que la date reste non formatée
      expect(bills[0].date).toBe("invalid-date");
    });

    // Test si le store est null
    test("Then it should return undefined if store is not defined", async () => { // Ensuite, il devrait renvoyer undefined si store n'est pas défini
      billsInstance.store = null; // Simule un store inexistant
      const bills = await billsInstance.getBills(); // Appelle getBills

      // Vérifie que la fonction retourne bien undefined
      expect(bills).toBeUndefined();
    });
  });
});
