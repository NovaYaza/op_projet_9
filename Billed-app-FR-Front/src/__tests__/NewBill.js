/**
 * @jest-environment jsdom
 */

// Importation des modules de test
import { screen, fireEvent } from "@testing-library/dom";
import { ROUTES_PATH } from "../constants/routes.js";
import NewBill from "../containers/NewBill.js"; // Le fichier qu'on teste
import NewBillUI from "../views/NewBillUI"; // L'interface utilisateur de NewBill

// Déclaration du mock du store (simulation de l'API)
const mockStore = {
  bills: jest.fn(() => ({
    create: jest.fn(() =>
      Promise.resolve({ fileUrl: "https://test.com/test.png", key: "12345" }) // Simulation d'une URL de fichier après upload
    ),
    update: jest.fn(() => Promise.resolve({})), // Mock de la mise à jour des données d'une facture
  })),
};

// Mock du module store pour éviter d'appeler une vraie API
jest.mock("../app/store.js", () => ({
  bills: () => mockStore.bills(),
}));

// Début du bloc de test principal
describe("Given I am connected as an employee", () => { // Étant connecté en tant qu'employé
  let newBill;
  let onNavigate;

  // Avant chaque test, on prépare le DOM et les variables nécessaires
  beforeEach(() => {
    document.body.innerHTML = `
      <form data-testid="form-new-bill">
        <input data-testid="file" type="file" />
        <input data-testid="datepicker" type="date" />
        <select data-testid="expense-type"><option>Transports</option></select>
        <input data-testid="expense-name" type="text" />
        <input data-testid="amount" type="number" />
        <input data-testid="vat" type="text" />
        <input data-testid="pct" type="number" />
        <textarea data-testid="commentary"></textarea>
        <button type="submit">Envoyer</button>
      </form>
    `;

    onNavigate = jest.fn(); // Mock de la fonction de navigation
    localStorage.setItem("user", JSON.stringify({ email: "test@test.com" })); // Simule un utilisateur connecté

    // Création d'une nouvelle instance de NewBill
    newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore, // On passe le store mocké pour éviter d'appeler une vraie API
      localStorage,
    });
  });

  // Bloc de test pour l'ajout d'un fichier
  describe("When I add a file", () => { // Quand j'ajoute un fichier
    test("Then handleChangeFile should store file information", () => { // Ensuite, handleChangeFile doit stocker les informations du fichier
      // On affiche l'interface utilisateur
      document.body.innerHTML = NewBillUI();
      
      // Création d'une nouvelle instance de NewBill avec un store mocké
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });
      
      // Espionne la fonction handleChangeFile
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      
      // Sélectionne le champ de fichier et crée un fichier factice
      const fileInput = screen.getByTestId("file");
      const file = new File(["dummy content"], "test.png", { type: "image/png" });
    
      fileInput.addEventListener("change", handleChangeFile); // Ajoute un écouteur d'événement
      
      // Simule l'ajout du fichier
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      // Vérifie que handleChangeFile a bien été appelé
      expect(handleChangeFile).toHaveBeenCalled();
      // Vérifie que le fichier sélectionné a bien le bon nom
      expect(fileInput.files[0].name).toBe("test.png");
    });
    

    // Test pour vérifier que handleChangeFile gère les erreurs API
    test("Then handleChangeFile should handle API errors", async () => {
      // On modifie le mockStore pour qu'il simule une erreur API
      mockStore.bills = jest.fn(() => ({
        create: jest.fn(() => Promise.reject(new Error("Erreur API"))),
      }));

      // Espionne console.error pour vérifier qu'il affiche bien l'erreur
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Sélectionne le champ fichier et simule un fichier
      const fileInput = screen.getByTestId("file");
      const file = new File(["test"], "test.png", { type: "image/png" });

      // Simule l'ajout du fichier
      Object.defineProperty(fileInput, "files", { value: [file] });
      fireEvent.change(fileInput);

      // Attend que la promesse se termine
      await new Promise(process.nextTick);

      // Vérifie que console.error a bien été appelé
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restaure console.error pour ne pas affecter d'autres tests
      consoleErrorSpy.mockRestore();
    });

    // Teste si, lorsqu'on soumet le formulaire, une note de frais est bien créée avec les bonnes données 
    // et si la fonction updateBill est appelée pour mettre à jour la note de frais.
    // test d’intégration sur la route POST pour ajouter une nouvelle note de frais
    test("Then handleSubmit should create a bill with correct data and call updateBill", () => {
      const form = screen.getByTestId("form-new-bill");
    
      // Espionne la fonction updateBill pour voir si elle est bien appelée
      newBill.updateBill = jest.fn();
    
      // Remplit les champs du formulaire
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Train Paris-Lyon";
      screen.getByTestId("amount").value = "100";
      screen.getByTestId("datepicker").value = "2024-02-13";
      screen.getByTestId("vat").value = "20";
      screen.getByTestId("pct").value = "10";
      screen.getByTestId("commentary").value = "Voyage d'affaires";
      newBill.fileUrl = "https://test.com/test.png"; // Simule un fichier ajouté
      newBill.fileName = "test.png";
    
      // Simule la soumission du formulaire
      fireEvent.submit(form);
    
      // Vérifie que updateBill est bien appelé avec les bonnes données
      expect(newBill.updateBill).toHaveBeenCalledWith({
        email: "test@test.com",
        type: "Transports",
        name: "Train Paris-Lyon",
        amount: 100,
        date: "2024-02-13",
        vat: "20",
        pct: 10,
        commentary: "Voyage d'affaires",
        fileUrl: "https://test.com/test.png",
        fileName: "test.png",
        status: "pending",
      });
    
      // Vérifie que la navigation est bien appelée
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
    });
  });
});




