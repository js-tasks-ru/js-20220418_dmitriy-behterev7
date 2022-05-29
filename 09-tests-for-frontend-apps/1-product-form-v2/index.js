import SortableList from "../2-sortable-list/index.js";
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  constructor(productId) {
    this.productId = productId;

    // скелет формы с данными по-умолчанию
    this.dataForm = {
      images: [],
    };

    this.defaultFormData = {
      title: "",
      description: "",
      quantity: 1,
      subcategory: "",
      status: 1,
      price: 100,
      discount: 0,
    };

    this.categories = [];

    this.subElements = {};
  }

  uploadImage = async () => {
    // код с лекции
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*"; // только изображения

    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (!file) {
        return;
      }

      fileInput.remove(); // удалим из Dom

      const imageListContainer = this.element.querySelector(
        '[data-element="imageListContainer"] .sortable-list'
      );

      // реализация через FormData
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
        });

        //console.log("ссылка на изображение: ", res.data.link);
        imageListContainer.append(
          this.createImageListElement(res.data.link, file.name)
        );
      } catch (err) {
        console.error("Произошла ошибка при аплоадинге картинки", err.message);
      }
    };

    fileInput.hidden = true; // прячем

    document.body.append(fileInput); // препод: требование для IE

    fileInput.click(); // эмулируем клик
  };

  submitUpdatedForm = (event) => {
    event.preventDefault();

    this.save();
  };

  async save() {
    const {
      title,
      description,
      quantity,
      subcategory,
      status,
      price,
      discount,
    } = this.form.elements;

    const jsonData = {
      id: this.id,
      title: title.value,
      description: description.value,
      quantity: quantity.value,
      subcategory: subcategory.value,
      status: status.value,
      price: price.value,
      discount: discount.value,
      images: [],
    };

    // соберем изображения
    const imagesElements = this.element.querySelectorAll(
      '[data-element="imageListContainer"] .sortable-table__cell-img'
    );

    for (const imgEl of imagesElements) {
      jsonData.images.push({
        url: imgEl.src,
        source: imgEl.alt,
      });
    }

    // попытка отправки
    try {
      await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(jsonData),
      });

      const custEvent = this.productId
        ? new CustomEvent("product-updated", { detail: this.productId })
        : new CustomEvent("product-saved");
      this.element.dispatchEvent(custEvent);
    } catch (error) {
      console.log("Произошла ошибка", error.message);
    }
  }

  async fetchCategories() {
    return await fetchJson(
      `${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`
    );
  }

  async render() {
    // получим категории
    this.categories = await this.fetchCategories();

    //console.log("categories:");
    //console.dir(this.categories);

    if (this.productId) {
      // если задан id товара, то получим сведения по товару
      const product = await fetchJson(
        `${BACKEND_URL}/api/rest/products?id=${this.productId}`
      );

      //console.log("product");
      console.dir(product);

      // подготовим данные для формы
      if (!product) {
        console.error("нет данных по продукту!");
        // если данных нет, то принудительно установим форму как null
        this.dataForm = null;
      } else {
        this.dataForm = Array.isArray(product) ? product[0] : product;
      }
    }

    this.initializeElementOfForm();
    //++ upd 20220525 construct images nodes
    const imgEls = [];

    this.dataForm.images.forEach((imgObj) => {
      const _imgEl = document.createElement("div");
      _imgEl.innerHTML = this.getImageInnerHTML(imgObj);
      imgEls.push(_imgEl.firstElementChild);
    });

    const imageContainer = this.element.querySelector(
      '[data-element="imageListContainer"]'
    );

    //console.dir(imgEls);

    const sortedList = new SortableList({
      items: imgEls,
    });

    // console.dir(sortedList);

    imageContainer.append(sortedList.element);
    // ${this.getImagesInnerHTML()}
    //--
    this.initializeSubelementsOfForm();
    this.attachEventListeners();

    return this.element;
  }

  attachEventListeners() {
    this.form.addEventListener("submit", this.submitUpdatedForm);

    this.uploadImageBtn.addEventListener("click", this.uploadImage);
  }

  createImageListElement(url, source) {
    const divEl = document.createElement("div");
    divEl.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="${source}" src="${url}">
          <span>
            ${source}
          </span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;

    return divEl.firstElementChild;
  }

  getImageInnerHTML(imgObj) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
    <input type="hidden" name="url" value="${imgObj.url}">
    <input type="hidden" name="source" value="${imgObj.source}">
    <span>
      <img src="icon-grab.svg" data-grab-handle="" alt="grab">
      <img class="sortable-table__cell-img" alt="${imgObj.source}" src="${imgObj.url}">
      <span>
        ${imgObj.source}
      </span>
    </span>
    <button type="button">
      <img src="icon-trash.svg" data-delete-handle="" alt="delete">
    </button>
  </li>`;
  }

  getImagesInnerHTML() {
    //console.dir(this.dataForm.images);
    return this.dataForm.images.reduce((acc, imgObj) => {
      return (
        acc +
        `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${imgObj.url}">
          <input type="hidden" name="source" value="${imgObj.source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="${imgObj.source}" src="${imgObj.url}">
            <span>
              ${imgObj.source}
            </span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>
      `
      );
    }, "");
  }

  getCategoriesInnerHTML() {
    //console.dir(this.categories);

    let categoriesInnerHTML = "";

    this.categories.forEach((categoryObj) => {
      categoriesInnerHTML += categoryObj.subcategories.reduce(
        (acc, subcategoryObj) => {
          return (
            acc +
            `
              <option value="${categoryObj.id}" ${
              subcategoryObj.id === this.dataForm.subcategory ||
              this.defaultFormData.subcategory
                ? "selected"
                : ""
            }>
                ${categoryObj.title} &gt; ${subcategoryObj.title}
              </option>
            `
          );
        },
        ""
      );
    });

    return categoriesInnerHTML;
  }

  initializeSubelementsOfForm() {
    const allDataEl = this.element.querySelectorAll("[data-element]");

    //console.log(this.element);

    for (const el of allDataEl) {
      this.subElements[el.dataset.element] = el;
    }
  }

  initializeElementOfForm() {
    this.element = document.createElement("div");

    if (!this.dataForm) {
      this.element.innerHTML = `
      <div>
        <p>Товар c id "${this.productId}" не найден!</p>
      </div>
      `;
    } else {
      this.element.innerHTML = `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required
              type="text"  
              name="title"
              class="form-control"
              placeholder="Название товара"
              id="title"
              value="${
                this.dataForm.title
                  ? escapeHtml(this.dataForm.title)
                  : this.defaultFormData.title
              }">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea 
            required
            class="form-control"
            name="description"
            data-element="productDescription"
            placeholder="Описание товара"
            id="description">
            ${
              this.dataForm.description
                ? escapeHtml(this.dataForm.description)
                : this.defaultFormData.description
            }
          </textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
          </div>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory">
              ${this.getCategoriesInnerHTML()}
            </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required
              id="price"
              name="price"
              type="number"
              class="form-control"
              placeholder="${this.defaultFormData.price}"
              value="${
                this.dataForm.price
                  ? this.dataForm.price
                  : this.defaultFormData.price
              }">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required
              id="discount"
              name="discount"
              type="number"
              class="form-control"
              value="${
                this.dataForm.price
                  ? this.dataForm.discount
                  : this.defaultFormData.discount
              }"
              placeholder="${this.defaultFormData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required
            id="quantity"
            name="quantity"
            type="number"
            class="form-control"
            value="${
              this.dataForm.quantity
                ? this.dataForm.quantity
                : this.defaultFormData.quantity
            }"
            placeholder="${this.defaultFormData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? "Сохранить товар" : "Создать новый"}
          </button>
        </div>
      </form>
    </div>
    `;

      // инициализируем ссылку на форму (NodeElement)
      this.form = this.element.querySelector('[data-element="productForm"]');

      // инициализируем ссылку на загрузку изображения
      this.uploadImageBtn = this.element.querySelector(
        '[data-element="uploadImage"]'
      );
    }
  }

  destroy() {
    // удалим обработчики
    this.form.removeEventListener("submit", this.submitUpdatedForm);
    this.uploadImageBtn.removeEventListener("upload", this.uploadImage);

    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    this.element.remove();
  }
}
