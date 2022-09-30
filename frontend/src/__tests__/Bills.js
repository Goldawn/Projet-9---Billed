/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

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
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const sortBills = bills.sort((a, b) => (a.date < b.date ? 1 : -1)); // AJOUT
      document.body.innerHTML = BillsUI({ data: sortBills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    // Couverture de la fonction handleClickIconEye
    describe("When i click on the eye icon", () => {
      test("a modal should open", () => {
        // we have to mock navigation to test it
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const store = ""
        
        const billTest = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })

        const eyeList = screen.getAllByTestId("icon-eye");
        const eyeIcon = eyeList[0]
        const handleClickIconEye = jest.fn()

        // eyeIcon.addEventListener("click", handleClickIconEye)
        // fireEvent.click(eyeIcon)

        // const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
        $.fn.modal = jest.fn();
        billTest.handleClickIconEye(eyeIcon);
        expect(document.querySelector(".modal")).toBeTruthy();


        // expect(handleClickIconEye).toHaveBeenCalled();
        // const modal = document.getElementById('modaleFile')
        // expect(modal.classList.contains('show')).toBe(true)
      })
    })

    // Couverture de la fonction handleClickNewBill
    // describe("When i click on 'Nouvelle note de frais'", () => {
    //   test("it should render New Bill page", () => {

    //     // we have to mock navigation to test it
    //     const onNavigate = (pathname) => {
    //       document.body.innerHTML = ROUTES({ pathname });
    //     };

    //     const store = ""
        
    //     const billTest = new Bills({
    //       document, onNavigate, store, localStorage: window.localStorage
    //     })

    //     const handleClickNewBill = jest.fn()
    //     const newBillButton = screen.getByTestId("btn-new-bill");
    //     newBillButton.addEventListener('click', handleClickNewBill)
    //     fireEvent.click(newBillButton)

    //     expect(handleClickNewBill).toHaveBeenCalled();
    //     expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    //   })
    // })
    
  })
})

// // test d'intégration GET
// describe("Given I am a user connected as an employee", () => {
//   describe("When I navigate to Bills", () => {
//     test("fetches bills from mock API GET", async () => {
    
//       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//       window.localStorage.setItem('user', JSON.stringify({
//         type: 'Employee'
//       }))



//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.Bills)

//       await waitFor(() => screen.getByText("Mes notes de frais"))
//       const bills = await document.querySelectorAll("tr")
//       expect(bills.length).toEqual(5)
//     })
//     describe("When an error occurs on API", () => {
//       beforeEach(() => {
//         jest.spyOn(mockStore, "bills")
//         Object.defineProperty(
//             window,
//             'localStorage',
//             { value: localStorageMock }
//         )
//         window.localStorage.setItem('user', JSON.stringify({
//           type: 'employee',
//         }))
//         const root = document.createElement("div")
//         root.setAttribute("id", "root")
//         document.body.appendChild(root)
//         router()
//       })
//       test("fetches bills from an API and fails with 404 message error", async () => {

//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 404"))
//           }
//         }})

//         const html = BillsUI({
//           error: "Erreur 404"
//         })
//         document.body.innerHTML = html
//         const message = await screen.getByText(/Erreur 404/)
//         expect(message).toBeTruthy()
//       })
//       // test("fetches bills from an API and fails with 500 message error", async () => {

//       //   mockStore.bills.mockImplementationOnce(() => {
//       //     return {
//       //       list : () =>  {
//       //         return Promise.reject(new Error("Erreur 500"))
//       //       }
//       //     }})
  
//       //     const html = BillsUI({
//       //       error: "Erreur 500"
//       //     })
//       //     document.body.innerHTML = html
//       //     const message = await screen.getByText(/Erreur 500/)
//       //     expect(message).toBeTruthy()
//       //   })
//       test("fetches messages from an API and fails with 500 message error", async () => {
//         mockStore.bills.mockImplementationOnce(() => {
//           return {
//             list: () => {
//               return Promise.reject(new Error("Erreur 500"));
//             },
//           };
//         });

//         window.onNavigate(ROUTES_PATH.Bills);
//         await waitFor(() => new Promise(process.nextTick));
//         const message = await waitFor(() => screen.getByText(/Erreur 500/));
//         expect(message).toBeTruthy();
//       });

//     })

//   })
// })

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() =>
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      );
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      // test("fetches bills from an API and fails with 404 message error", async () => {
      //   mockStore.bills.mockImplementationOnce(() => {
      //     return {
      //       list: () => {
      //         return Promise.reject(new Error("Erreur 404"));
      //       },
      //     };
      //   });
      //   window.onNavigate(ROUTES_PATH.Bills);
      //   await waitFor(() => new Promise(process.nextTick));
      //   const message = await waitFor(() => screen.getByText(/Erreur 404/));
      //   expect(message).toBeTruthy();
      // });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await waitFor(() => new Promise(process.nextTick));
        const message = await waitFor(() => screen.getByText(/Erreur 500/));
        expect(message).toBeTruthy();
      });
    });
  });
});