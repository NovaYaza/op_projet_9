/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI";

// Déclaration du mock du store
const mockStore = {
  bills: jest.fn(() => ({
    create: jest.fn(() =>
      Promise.resolve({ fileUrl: "https://test.com/test.png", key: "12345" })
    ),
    update: jest.fn(() => Promise.resolve({})), // Ajout du mock de update
  })),
};

// Mock du module store après avoir défini mockStore
jest.mock("../app/store.js", () => ({
  bills: () => mockStore.bills(),
}));

describe("Given I am connected as an employee", () => {
  let newBill;
  let onNavigate;

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

    onNavigate = jest.fn();
    localStorage.setItem("user", JSON.stringify({ email: "test@test.com" }));

    newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage,
    });
  });

  describe("When I add a file", () => {
    test("Then handleChangeFile should store file information", () => {
      document.body.innerHTML = NewBillUI();
    
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });
    
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
    
      const fileInput = screen.getByTestId("file");
      const file = new File(["dummy content"], "test.png", { type: "image/png" });
    
      fileInput.addEventListener("change", handleChangeFile);
      
      // Simule l'ajout du fichier
      fireEvent.change(fileInput, { target: { files: [file] } });
    
      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("test.png"); // Vérifie que le fichier est bien ajouté
    });
    


    test("Then handleChangeFile should handle API errors", async () => {
      mockStore.bills = jest.fn(() => ({
        create: jest.fn(() => Promise.reject(new Error("Erreur API"))),
      }));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const fileInput = screen.getByTestId("file");
      const file = new File(["test"], "test.png", { type: "image/png" });
      Object.defineProperty(fileInput, "files", { value: [file] });

      fireEvent.change(fileInput);

      await new Promise(process.nextTick);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});




