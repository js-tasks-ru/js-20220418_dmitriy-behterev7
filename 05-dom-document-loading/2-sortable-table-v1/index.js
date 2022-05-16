export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.element = this.renderTable();
    this.subElements = this.initSubElements();
  }

  sort(fieldValue, orderValue) {
    let headerIndex = this.headerConfig.findIndex(
      (val) => val.id === fieldValue
    );
    if (headerIndex === -1) return;

    let column = this.headerConfig[headerIndex];
    if (column && !column.sortable) {
      // console.log("can't sort!");
      return;
    }

    // reset order property
    this.headerConfig.forEach((val) => delete val.order);

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
    };
  }

  init() {
    this.remove();
    this.element = this.renderTable();
    this.initSubElements();
    let root = document.getElementById("root");
    root?.append(this.element);
  }

  destroy() {
    this.remove();
  }

  remove() {
    if (!this.element) {
      return null;
    }

    this.element.remove();
  }

  renderTable() {
    let elTable = document.createElement("div");
    elTable.className = "sortable-table";

    //++ render header
    let elHeader = document.createElement("div");
    elHeader.dataset.element = "header";
    elHeader.classList.add("sortable-table__header");
    elHeader.classList.add("sortable-table__row");

    this.headerConfig.forEach((headerCell) => {
      let elHeaderCell = document.createElement("div");

      elHeaderCell.className = "sortable-table__cell";
      elHeaderCell.dataset.id = headerCell.id;
      elHeaderCell.dataset.sortable = headerCell.sortable;
      if (headerCell.order) {
        elHeaderCell.dataset.order = headerCell.order;
      }

      let elHeaderCellName = document.createElement("span");
      elHeaderCellName.append(document.createTextNode(headerCell.title));

      elHeaderCell.append(elHeaderCellName);

      elHeader.append(elHeaderCell);
    });

    elTable.append(elHeader);
    //--
    //++ render data
    let elData = document.createElement("div");
    elData.className = "sortable-table__body";
    elData.dataset.element = "body";

    this.data.forEach((dataVal) => {
      let elDataHref = document.createElement("a");
      elDataHref.href = `/products/${dataVal.id}`;
      elDataHref.className = "sortable-table__row";

      this.headerConfig.forEach((headerConfigData) => {
        if (
          headerConfigData.template &&
          typeof headerConfigData.template === "function"
        ) {
          let tmpDiv = document.createElement("div");
          tmpDiv.innerHTML = headerConfigData.template(
            dataVal[headerConfigData.id]
          );

          elDataHref.append(tmpDiv.firstElementChild); // можно ли так делать?
        } else {
          let elDataCell = document.createElement("div");
          elDataCell.className = "sortable-table__cell";

          elDataCell.append(
            document.createTextNode(dataVal[headerConfigData.id])
          );

          elDataHref.append(elDataCell);
        }
      });

      elData.append(elDataHref);
    });

    elTable.append(elData);
    //--

    return elTable;
  }
}
