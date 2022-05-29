import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

async function scrollHandler() {
  const { bottom } = this.element.getBoundingClientRect();

  // console.log("высота документа", document.documentElement.clientHeight);
  // console.log(
  //   "расстояние от верхней границы браузера до нижней границы таблицы с контентом",
  //   bottom
  // );
  //console.log(bottom, document.documentElement.clientHeight);

  if (this.loadingData || this.isSortLocally) {
    // грузятся данные или локальная сортировка
    return;
  }

  if (bottom < document.documentElement.clientHeight) {
    this.loadingData = true;

    console.log("loading data...");

    this._start = this._end;
    this._end = this._start + this._step;

    const loadedData = await fetchJson(this.compoundUrl());

    const body = this.element.querySelector('[data-element="body"]');
    body.innerHTML += this.addTableRows(loadedData);

    // ES6 конкатенируем массивы
    this.data = [...this.data, ...loadedData];

    this.loadingData = false;
  }
}

function sortHandler({ target }) {
  const headerDiv = target.closest(
    ".sortable-table__header .sortable-table__cell"
  );

  if (!headerDiv) {
    return;
  }

  const {
    id: headerId,
    sortable: headerSortable,
    order: headerOrder,
  } = headerDiv.dataset;

  if (!headerId) {
    return;
  }

  if (!headerSortable) {
    return;
  }

  // append style span...
  let newOrder;
  switch (headerOrder) {
    case "asc":
      newOrder = "desc";
      break;
    case "desc":
      newOrder = "asc";
      break;
    default:
      newOrder = "desc";
  }

  this.sorted = {
    id: headerId,
    order: newOrder,
  };

  // признак сортировки на заголовке таблицы
  headerDiv.dataset.order = newOrder;

  // удалим из DOM текущую стрелку
  const arrow = this.element.querySelector('[data-element="arrow"]');
  arrow.remove();

  // добавим стрелку на текущий заголовок таблицы
  const arrowDiv = document.createElement("div");
  arrowDiv.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`;
  headerDiv.append(arrowDiv.firstElementChild);

  // sort
  if (this.isSortLocally) {
    this.sortOnClient(headerId, newOrder);
  } else {
    this.sortOnServer(headerId, newOrder);
  }
}

export default class SortableTable {
  loadingData = false;

  constructor(
    headersConfig,
    {
      data = [],
      sorted = {
        id: headersConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      url = "",
      isSortLocally = false,
    } = {}
  ) {
    this.headerConfig = headersConfig;
    this.data = data;
    //this._initialData = JSON.parse(JSON.stringify(data)); // deep copy
    // перенесено в render()
    //this.element = this.renderTable();
    //this.initSubElements();
    //this.setEventListeners();
    this.sorted = sorted;

    this.url = url;

    // параметры для сортировки на сервере
    this._start = 0;
    this._end = 30;
    this._step = 30;

    this.isSortLocally = isSortLocally;

    this.render();
    // if (sorted.id && sorted.order) {
    //   if (isSortLocally) {
    //     this.sortOnClient(sorted.id, sorted.order);
    //   } else {
    //     this.sortOnServer(sorted.id, sorted.order);
    //   }
    // }
  }

  compoundUrl() {
    return (
      BACKEND_URL +
      "/" +
      this.url +
      "?_sort=" +
      this.sorted.id +
      "&_order=" +
      this.sorted.order +
      "&_start=" +
      this._start +
      "&_end=" +
      this._end
    );
  }

  async render() {
    this.element = this.renderTable();
    this.subElements = this.initSubElements();

    // нужно получить данные
    this.data = await fetchJson(this.compoundUrl());
    //console.dir(this.data);

    const body = this.element.querySelector('[data-element="body"]');
    body.innerHTML = this.addTableRows(this.data);

    this.setEventListeners();
  }

  async sortOnServer(id, order) {
    this.data = await fetchJson(this.compoundUrl());

    const body = this.element.querySelector('[data-element="body"]');
    body.innerHTML = this.addTableRows(this.data);
  }

  setEventListeners() {
    this._sortHandler = sortHandler.bind(this);
    this._scrollHandler = scrollHandler.bind(this);

    const header = this.element.querySelector('[data-element="header"]');
    header.addEventListener("pointerdown", this._sortHandler);

    document.addEventListener("scroll", this._scrollHandler);
  }

  sortOnClient(fieldValue, orderValue) {
    let headerIndex = this.headerConfig.findIndex(
      (val) => val.id === fieldValue
    );
    if (headerIndex === -1) return;

    let column = this.headerConfig[headerIndex];
    if (column && !column.sortable) {
      return;
    }

    // reset order property
    // уберу старую логику
    // this.headerConfig.forEach((val) => delete val.order);

    if (orderValue === "") {
      //this.data = this._initialData;
      //this.init();
      return;
    }

    // скопирую глубоко. Сортировка меняет исходный массив
    // Дмитрий - deep copy, дорогая операция
    // const _initialData = JSON.parse(JSON.stringify(this.data));
    // shallow copy подойдет также
    const _initialData = [...this.data];

    let sortType = column.sortType;
    switch (sortType) {
      case "string":
        _initialData.sort((a, b) => {
          if (orderValue === "asc") {
            return a[fieldValue].localeCompare(b[fieldValue], ["ru", "en"], {
              caseFirst: "upper",
            });
          } else {
            return b[fieldValue].localeCompare(a[fieldValue], ["ru", "en"], {
              caseFirst: "upper",
            });
          }
        });
        break;
      case "number":
        _initialData.sort((a, b) => {
          if (orderValue === "asc") {
            return a[fieldValue] - b[fieldValue];
          } else {
            return b[fieldValue] - a[fieldValue];
          }
        });
        break;
      case "date":
        this.data = this.data.sort((a, b) => {
          if (orderValue === "asc") {
            return new Date(a[fieldValue]) - new Date(b[fieldValue]);
          } else {
            return new Date(b[fieldValue]) - new Date(a[fieldValue]);
          }
        });
        break;
      default:
        // сортировка по-умолчанию
        _initialData.sort();
    }

    // переделал на this.sorted - там будет храниться текущий порядок соритровки по конкретному столбцу
    //this.headerConfig[headerIndex].order = orderValue;

    // закомментировал исх. вызов
    //this.init();

    // отсортировали, теперь перепропишем исх. строки
    const body = this.element.querySelector('[data-element="body"]');
    body.innerHTML = this.addTableRows(_initialData);
  }

  initSubElements() {
    if (!(this.element instanceof Element)) return;
    return {
      body: this.element.querySelector(".sortable-table__body"),
      header: this.element.querySelector(".sortable-table__header"),
    };
    // console.dir(this.subElements);
  }

  init() {
    this.remove();
    this.element = this.renderTable();
    this.initSubElements();
    let root = document.getElementById("root");
    root?.append(this.element);

    this.setEventListeners();
  }

  destroy() {
    this.remove();
  }

  remove() {
    if (!this.element) {
      return null;
    }

    // удалим обработчики
    const header = this.element.querySelector('[data-element="header"]');
    header.removeEventListener("click", this._sortHandler);

    document.removeEventListener("scroll", this._scrollHandler);

    this.element.remove();
  }

  renderTable() {
    let elTable = document.createElement("div");
    elTable.className = "sortable-table";

    let headerCellInnerHtml = "";

    //++ render table header
    this.headerConfig.forEach((headerCell) => {
      const orderCell =
        this.sorted.id === headerCell.id ? this.sorted.order : "asc";

      headerCellInnerHtml += `
        <div class="sortable-table__cell" data-id="${
          headerCell.id
        }" data-sortable="${headerCell.sortable}" data-order="${orderCell}">
          <span>
            ${headerCell.title}
          </span>
          ${
            this.sorted.id === headerCell.id
              ? '<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>'
              : ""
          } 
        </div>
      `;
    });

    let elTableHeaderInnerHTML = `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${headerCellInnerHtml}  
      </div>
    `;
    //--
    //++ render table data
    let elTableDataInnerHTML = `
      <div class="sortable-table__body" data-element="body">
        ${this.addTableRows(this.data)}
      </div>
    `;
    //--

    elTable.innerHTML = elTableHeaderInnerHTML + elTableDataInnerHTML;

    return elTable;
  }

  addTableRows(data) {
    let dataCellInnerHtml = "";
    data.forEach((dataVal) => {
      let dataHrefCellInnerHtml = "";

      this.headerConfig.forEach((headerConfigData) => {
        if (
          headerConfigData.template &&
          typeof headerConfigData.template === "function"
        ) {
          dataHrefCellInnerHtml += `
              ${headerConfigData.template(dataVal[headerConfigData.id])}
          `;
        } else {
          dataHrefCellInnerHtml += `
             <div class="sortable-table__cell">
              ${dataVal[headerConfigData.id]}
             </div>
          `;
        }
      });

      dataCellInnerHtml += `
        <a href="/products/${dataVal.id}" class="sortable-table__row">
          ${dataHrefCellInnerHtml}
        </a>
      `;
    });

    return dataCellInnerHtml;
  }
}
