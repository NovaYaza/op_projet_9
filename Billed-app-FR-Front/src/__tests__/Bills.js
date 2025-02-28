/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { bills } from "../fixtures/bills.js"

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  let billsInstance;
  let onNavigate;

  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

    document.body.innerHTML = BillsUI({ data: bills });

    onNavigate = jest.fn();
    billsInstance = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
  });

  describe("When I click on the 'New Bill' button", () => {
    test("Then it should navigate to the NewBill page", () => {
      const newBillButton = screen.getByTestId("btn-new-bill");
      fireEvent.click(newBillButton);
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });

  describe("When I click on the eye icon", () => {
    test("Then it should open a modal with the bill image", () => {
      $.fn.modal = jest.fn(); // Mock Bootstrap modal

      document.body.innerHTML = `
        <div data-testid="icon-eye" data-bill-url="https://test.com/test.png"></div>
        <div id="modaleFile">
          <div class="modal-body"></div>
        </div>
      `;

      const eyeIcon = screen.getByTestId("icon-eye");
      billsInstance.handleClickIconEye(eyeIcon);

      expect(document.querySelector(".modal-body").innerHTML).toContain("https://test.com/test.png");
      expect($.fn.modal).toHaveBeenCalledWith("show");
    });
  });

  describe("When getBills is called", () => {
    test("Then it should return formatted bills", async () => {
      const bills = await billsInstance.getBills();
      expect(bills).toBeDefined();
      expect(bills[0].dateFr).toBe("4 Avr. 2004");
      expect(bills[0].status).toBe("En attente");
    });

    test("Then it should log an error if date formatting fails", async () => {
      const corruptedBill = { date: "invalid-date", status: "pending" };
      jest.spyOn(mockStore.bills(), "list").mockResolvedValueOnce([corruptedBill]);
      console.log = jest.fn();

      const bills = await billsInstance.getBills();

      expect(console.log).toHaveBeenCalledWith(expect.any(Error), "for", corruptedBill);
      expect(bills[0].date).toBe("invalid-date");
    });

    test("Then it should return undefined if store is not defined", async () => {
      billsInstance.store = null;
      const bills = await billsInstance.getBills();
      expect(bills).toBeUndefined();
    });
  });
});
