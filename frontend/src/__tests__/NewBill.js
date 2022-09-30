/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should render the form to send a new bill", () => {
      document.body.innerHTML = NewBillUI();
      //to-do write assertion
 
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
  describe("When I upload an incorrect image format", () => {
    test("the border of the input should turn red", () => {
      document.body.innerHTML = NewBillUI();

      // localStorage should be populated with form data
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const inputData = {
        fileName: "pasuneimage.pdf",
        lastModified: 1580400631732, 
        size: 703786, 
        type: 'unknown/ukn'
      }

      //On créé un fichier qui n'est pas une image
      const pasuneimage = new File([""], inputData.fileName, { type : inputData.type, lastModified: inputData.lastModified} )

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        localStorage: window.localStorage,
        onNavigate,
        store: mockStore
      })

      const fileInput = screen.getByTestId("file")
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener("change", handleChangeFile)
      fireEvent.change(fileInput, { target : { files: [pasuneimage] } })     
      expect(handleChangeFile).toHaveBeenCalled();

      //the file is not an image, the border of the input should turn red
      expect(fileInput.classList.contains('red-border')).toBe(true)
    });
  })
  describe("When I upload a correct image format", () => {
    test("The border of the input should be blue", () => {
      document.body.innerHTML = NewBillUI();

      const imageData = {
        fileName: "uneimage.jpg",
        lastModified: 1580400631732, 
        size: 703786, 
        type: 'image/jpg'
      }

      //On créé un fichier qui est une image
      const uneimage = new File([""], imageData.fileName, { type : imageData.type, lastModified: imageData.lastModified} )

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        localStorage: window.localStorage,
        onNavigate,
        store: mockStore
      })

      const fileInput = screen.getByTestId("file")
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener("change", handleChangeFile)
      fireEvent.change(fileInput, { target : { files: [uneimage] } })
      expect(handleChangeFile).toHaveBeenCalled();
      console.log("isValid", newBill.isValid)

      //the file is an image, the border of the input should turn blue
      expect(fileInput.classList.contains('blue-border')).toBe(true)

      const inputData = {
        type: "Transports",
        name:  "Nom de la dépense",
        amount: "100",
        date: "2012-12-21",
        vat: "40",
        pct: "20",
        commentary: "Commentaire",
        status: 'pending'
      }

      const expenseType = screen.getByTestId("expense-type");
      fireEvent.change(expenseType, { target: { value: inputData.type } });
      expect(expenseType.value).toBe(inputData.type);

      const expenseName = screen.getByTestId("expense-name");
      fireEvent.change(expenseName, { target: { value: inputData.name } });
      expect(expenseName.value).toBe(inputData.name);
      
      const datePicker = screen.getByTestId("datepicker"); 
      fireEvent.change(datePicker, { target: { value: inputData.date } });
      expect(datePicker.value).toBe(inputData.date);

      const amount = screen.getByTestId("amount"); 
      fireEvent.change(amount, { target: { value: inputData.amount } });
      expect(amount.value).toBe(inputData.amount);

      const vat = screen.getByTestId("vat");
      fireEvent.change(vat, { target: { value: inputData.vat } });
      expect(vat.value).toBe(inputData.vat);

      const pct = screen.getByTestId("pct");
      fireEvent.change(pct, { target: { value: inputData.pct } });
      expect(pct.value).toBe(inputData.pct);

      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("after I submit, It should render Bills page", () => {
    expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  })
})


// test d'intégration POST
describe("Given I am connected as an employee", () => {
  describe("When I submit a new bill", () => {
    test("the bill should be created", async () => {
      const updateBill = mockStore.bills().update()
      const newBill = await updateBill.then((res)=> res)
      console.log(newBill)
      expect(newBill.id).toEqual("47qAXb6fIm2zOKkLzMro")
    })
  })
})

describe("When an error occurs on API", () => {
  test("Then an error is returned", async () => {
    
    jest.spyOn(mockStore, 'bills')
    // console.error = jest.fn()

    // localStorage should be populated with form data
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    document.body.innerHTML = `<div id="root"></div>`

    router()
    

    mockStore.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 500"))
        }
      }
    })
    window.onNavigate(ROUTES_PATH['NewBill'])
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})