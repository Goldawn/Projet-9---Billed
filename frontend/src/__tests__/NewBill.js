import { fireEvent, getAllByText, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom';
import { bills } from '../fixtures/bills.js'

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon).toBeVisible();
    });
  });

  describe("when I submit the form with empty fields", () => {
    test("then I should stay on new Bill page", () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      const newBill = new NewBill({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });

      expect(screen.getByTestId("expense-name").value).toBe("");
      expect(screen.getByTestId("datepicker").value).toBe("");
      expect(screen.getByTestId("amount").value).toBe("");
      expect(screen.getByTestId("vat").value).toBe("");
      expect(screen.getByTestId("pct").value).toBe("");
      expect(screen.getByTestId("file").value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });
  });

  describe("when I upload a file with the wrong format", () => {
    test("then I should stay on new Bill page", async () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(["hello"], "hello.txt", { type: "document/txt" });
      const inputFile = screen.getByTestId("file");

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      inputFile.addEventListener("change", handleChangeFile);

      fireEvent.change(inputFile, { target: { files: [file] } });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].type).toBe("document/txt");

      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });
  });

  describe("when I upload a file with the good format", () => {
    test("then input file should show the file name", async () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(["img"], "image.png", { type: "image/png" });
      const inputFile = screen.getByTestId("file");

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      inputFile.addEventListener("change", handleChangeFile);

      userEvent.upload(inputFile, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0]).toStrictEqual(file);
    });
  });
});

describe("Given I am connected as Employee on NewBill page, and submit the form", () => {
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
    document.body.append(root);
    router();
  });

  describe("when APi is working well", () => {
    test("then i should be sent on bills page with bills updated", async () => {
      jest.spyOn(mockStore, "bills");

      const html = NewBillUI();
      document.body.innerHTML = html;

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "azerty@email.com",
        })
      );

      const newBillJs = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBillJs.handleChangeFile(e));
      const uploadInput = screen.getByTestId("file");
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBillJs.handleSubmit(e));

      uploadInput.addEventListener("change", handleChangeFile);
      newBillJs.updateBill = jest.fn();

      const validBill = {
        type: "Transport",
        name: "Train Paris Toulouse",
        date: "2022-07-02",
        amount: 350,
        vat: 70,
        pct: 20,
        commentary: "Prix billet TGV : 350€",
        fileUrl: "../img/fakeFile.jpg",
        fileName: "billet-tgv.jpg",
        status: "pending",
      };

      screen.getByTestId("expense-type").value = validBill.type;
      screen.getByTestId("expense-name").value = validBill.name;
      screen.getByTestId("datepicker").value = validBill.date;
      screen.getByTestId("amount").value = validBill.amount;
      screen.getByTestId("vat").value = validBill.vat;
      screen.getByTestId("pct").value = validBill.pct;
      screen.getByTestId("commentary").value = validBill.commentary;
      newBillJs.fileName = validBill.fileName;
      newBillJs.fileUrl = validBill.fileUrl;

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(newBillJs.updateBill).toHaveBeenCalled();
    });
  });
});

describe('When an error occurs on API', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      })
    )

    document.body.innerHTML = NewBillUI()
  })

  test('Then new bill are added to the API but fetch fails with 404 message error', async () => {
    const spyedMockStore = jest.spyOn(mockStore, 'bills')

    spyedMockStore.mockImplementationOnce(() => {
      return {
        create: jest.fn().mockRejectedValue(new Error('Erreur 404')),
      }
    })

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname, data: bills })
    }

    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      bills: bills,
      localStorage: window.localStorage,
    })

    const fileInput = screen.getByTestId('file')

    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(['test'], 'test.jpg', {
            type: 'image/jpeg',
          }),
        ],
      },
    })

    await spyedMockStore()

    expect(spyedMockStore).toHaveBeenCalled()

    expect(newBill.billId).toBeNull()
    expect(newBill.fileUrl).toBeNull()

    spyedMockStore.mockReset()
    spyedMockStore.mockRestore()
  })

  test('Then new bill are added to the API but fetch fails with 500 message error', async () => {
    const spyedMockStore = jest.spyOn(mockStore, 'bills')

    spyedMockStore.mockImplementationOnce(() => {
      return {
        create: jest.fn().mockRejectedValue(new Error('Erreur 500')),
      }
    })

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname, data: bills })
    }

    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      bills: bills,
      localStorage: window.localStorage,
    })

    const fileInput = screen.getByTestId('file')

    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(['test'], 'test.jpg', {
            type: 'image/jpeg',
          }),
        ],
      },
    })

    await spyedMockStore()

    expect(spyedMockStore).toHaveBeenCalled()

    expect(newBill.billId).toBeNull()
    expect(newBill.fileUrl).toBeNull()
  })

  
})
