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

  // sort
  this.sort(headerId, newOrder);
}

export default class SortableTable {
  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this._initialData = JSON.parse(JSON.stringify(data)); // deep copy
    this.element = this.renderTable();
    this.initSubElements();
    this.setEventListeners();
    if (sorted.id && sorted.order) {
      this.sort(sorted.id, sorted.order);
    }
  }

  setEventListeners() {
    this._sortHandler = sortHandler.bind(this);

    document.addEventListener("pointerdown", this._sortHandler);
  }

  sort(fieldValue, orderValue) {
    let headerIndex = this.headerConfig.findIndex(
      (val) => val.id === fieldValue
    );
    if (headerIndex === -1) return;

    let column = this.headerConfig[headerIndex];
    if (column && !column.sortable) {
      return;
    }

    // reset order property
    this.headerConfig.forEach((val) => delete val.order);

    if (orderValue === "") {
      this.data = this._initialData;
      this.init();
      return;
    }

    let sortType = column.sortType;
    switch (sortType) {
      case "string":
        this.data = this.data.sort((a, b) => {
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
        this.data = this.data.sort((a, b) => {
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
        //return;
        this.data = this.data.sort();
    }

    this.headerConfig[headerIndex].order = orderValue;

    this.init();
  }

  initSubElements() {
    if (!(this.element instanceof Element)) return;
    this.subElements = {
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

    document.removeEventListener("click", this._sortHandler);
    this.element.remove();
  }

  renderTable() {
    let elTable = document.createElement("div");
    elTable.className = "sortable-table";

    let headerCellInnerHtml = "";

    //++ render header
    this.headerConfig.forEach((headerCell) => {
      headerCellInnerHtml += `
        <div class="sortable-table__cell" data-id="${
          headerCell.id
        }" data-sortable="${headerCell.sortable}" data-order="${
        headerCell.order ? headerCell.order : ""
      }">
          <span>
            ${headerCell.title}
          </span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow">
            </span>
          </span>
        </div>
      `;
    });

    let elTableHeaderInnerHTML = `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${headerCellInnerHtml}  
      </div>
    `;
    //--
    //++ render data
    let dataCellInnerHtml = "";

    this.data.forEach((dataVal) => {
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

    let elTableDataInnderHTML = `
      <div class="sortable-table__body" data-element="body">
        ${dataCellInnerHtml}
      </div>
    `;

    elTable.innerHTML = elTableHeaderInnerHTML + elTableDataInnderHTML;

    return elTable;
  }
}
