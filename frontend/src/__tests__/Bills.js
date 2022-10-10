/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import Bills from '../containers/Bills.js'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom';
import mockStore from "../__mocks__/store"
import { ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";
import userEvent from '@testing-library/user-event'

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toBeVisible() 

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText('Mes notes de frais'))
      const newBillButton = screen.getByText('Nouvelle note de frais')
      expect(newBillButton).toBeTruthy()

      document.body.innerHTML = ''
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})

describe("Given I am a user connected as Employee", () => {
  describe("When I click on \"Nouvelle note de frais\"", () => {
    test("Then It should renders new bill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

      const _bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        bills: bills,
        localStorage: window.localStorage,
      })
      document.body.innerHTML = BillsUI({ data: bills })

      const handleClickNewBill = jest.fn((e) => _bills.handleClickNewBill())
      const newBillButton = screen.getByText('Nouvelle note de frais')
      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()

      const newBillPageTitle = screen.queryByText('Envoyer une note de frais')
      expect(newBillPageTitle).toBeTruthy()

      document.body.innerHTML = ''
    })
  })
})

describe('When I click on eye icon', () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");
  });
  test('Then a modale should appear', async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
      })
    )
    document.body.innerHTML = BillsUI({ data: bills })

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const _bills = new Bills({
      document,
      onNavigate,
      store: null,
      bills: bills,
      localStorage: window.localStorage,
    })

    const handleClickIconEye = jest.fn((icon) => _bills.handleClickIconEye(icon))
    const iconEyeList = screen.getAllByTestId('icon-eye')
    iconEyeList.forEach((iconEye) =>
      iconEye.addEventListener('click', (e) => handleClickIconEye(iconEye))
    )
    userEvent.click(iconEyeList[0])
    expect(handleClickIconEye).toHaveBeenCalled()

    await waitFor(() => document.getElementById('modaleFile'))
    const modal = document.getElementById('modaleFile')
    expect(modal).toBeVisible()
  })
})