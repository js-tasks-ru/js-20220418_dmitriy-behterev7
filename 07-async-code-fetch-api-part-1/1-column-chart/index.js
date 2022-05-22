import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  constructor({
    data = [],
    label = "",
    value = "",
    link = "",
    formatHeading = (val) => val,
    chartHeight = 50,
    url = "",
    range = {
      from: new Date(),
      to: new Date(),
    },
  } = {}) {
    this.url = url;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = chartHeight;
    this.data = data;
    this.element = this.getElement();

    // в угоду тестирующей функции, не понимаю, зачем это нужно
    this.subElements = this.getSubelements();

    this.divChartColumn = null;
    this.range = range;

    if (this.url) {
      this.data = this.getData(range.from, range.to);
    }
  }

  getSubelements() {
    const subElements = {};
    const allSubElements = this.element.querySelectorAll("[data-element]");
    allSubElements.forEach((subEl) => {
      subElements[subEl.dataset.element] = subEl;
    });

    return subElements;
  }

  compoundUrl(from, to) {
    return (
      BACKEND_URL +
      "/" +
      this.url +
      "?" +
      "from=" +
      from.toISOString() +
      "&to=" +
      to.toISOString()
    );

    //console.log(URL);
  }

  calcHeaderVal(data) {
    if (Array.isArray(data)) {
      return data.reduce((acc, el) => acc + el, 0);
    } else if (ColumnChart.thisIdObject(data)) {
      return Object.values(data).reduce((acc, val) => acc + val, 0);
    }
  }

  async getData(from, to) {
    this.element.classList.add("column-chart_loading");
    const header = this.element.querySelector('[data-element="header"]');
    header.textContent = "";

    const body = this.element.querySelector('[data-element="body"]');
    // удалим все дочерние элементы из DOM
    body.innerHTML = "";

    // пропишем новые даты
    this.range.from = from;
    this.range.to = to;

    try {
      // ждем результата промиса по загрузке данных
      this.data = await fetchJson(this.compoundUrl(from, to));
      //console.dir(this.data);

      // задать заголовок
      header.textContent = this.formatHeading(this.calcHeaderVal(this.data));

      // задать график на основе данных
      this.renderCharts();
      const divChartContainer = this.element.querySelector(
        ".column-chart__container"
      );

      body.innerHTML = this.divChartColumn.innerHTML;

      // убираем класс загрузки
      this.element.classList.remove("column-chart_loading");
    } catch (err) {
      console.error("произошла ошибка при загрузке данных: ", err.message);
      return;
    }

    return this.data;
  }

  renderCharts() {
    let maxValue = 0;
    if (Array.isArray(this.data)) {
      maxValue = Math.max(...this.data);
    } else if (ColumnChart.thisIdObject(this.data)) {
      maxValue = Math.max(...Object.values(this.data));
    }

    let scale;
    if (maxValue) {
      scale = this.chartHeight / maxValue;
    }

    if (this.divChartColumn) {
      try {
        this.divChartColumn.remove;
      } catch (e) {}
    }

    this.divChartColumn = this.createEl({
      type: "div",
      dataEl: "body",
      className: "column-chart__chart",
    });

    if (Array.isArray(this.data)) {
      this.data.forEach((val) => {
        const divEl = this.createEl({
          type: "div",
          style: `--value: ${Math.floor(val * scale)}`,
          dataTooltip: `${((val / maxValue) * 100).toFixed(0)}%`,
        });

        this.divChartColumn.append(divEl);
      });
    } else if (ColumnChart.thisIdObject(this.data)) {
      for (let [key, val] of Object.entries(this.data)) {
        const divEl = this.createEl({
          type: "div",
          style: `--value: ${Math.floor(val * scale)}`,
          dataTooltip: `<div><small>${key.toLocaleString("default", {
            dateStyle: "medium",
          })}</small></div><strong>${((val / maxValue) * 100).toFixed(
            0
          )}</strong>`,
        });

        this.divChartColumn.append(divEl);
      }
    }
  }

  async update(from, to) {
    return await this.getData(from, to);
    // старый код с прошлой задачи, оставлю
    // if (!Array.isArray(newData)) {
    //   return;
    // }
    // this.data = newData;
    // this.renderCharts();
  }

  destroy() {
    this.remove();
    return null;
  }

  remove() {
    if (!this.element) {
      return null;
    }

    this.element.remove();
  }

  createEl({
    type,
    className = undefined,
    href = undefined,
    txtContent = undefined,
    style = undefined,
    dataEl = undefined,
    dataTooltip = undefined,
  }) {
    if (!type) {
      throw new Error("No type while creating element");
    }
    let el = document.createElement(type);

    if (className) {
      className.split(" ").forEach((clsName) => el.classList.add(clsName));
    }

    if (txtContent) {
      el.append(document.createTextNode(txtContent));
    }

    if (href) {
      el.href = href;
    }

    if (style) {
      el.style = style;
    }

    if (dataEl) {
      el.dataset.element = dataEl;
    }

    if (dataTooltip) {
      el.dataset.tooltip = dataTooltip;
    }

    return el;
  }

  static thisIdObject(obj) {
    if (typeof obj === "object" && !Array.isArray(obj) && obj !== null) {
      return true;
    }

    return false;
  }

  dataIsEmpty() {
    if (Array.isArray(this.data) && this.data.length === 0) {
      return true;
    } else if (
      ColumnChart.thisIdObject(this.data) &&
      Object.keys(this.data).length === 0 &&
      Object.getPrototypeOf(this.data) === Object.prototype
    ) {
      return true;
    }
    // можно еще на другие типы проверить, но в контексте задачи это не требуется

    return false;
  }

  getElement() {
    let div;

    div = this.createEl({
      type: "div",
      className: `column-chart${
        this.dataIsEmpty() ? " column-chart_loading" : ""
      }`,
      style: "--chart-height: 50",
    });

    let divChartTitle = this.createEl({
      type: "div",
      className: "column-chart__title",
      txtContent: `Total ${this.label}`,
    });

    let chartHref = this.createEl({
      type: "a",
      className: "column-chart__link",
      href: this.link,
      txtContent: "View all",
    });

    divChartTitle.append(chartHref);

    div.append(divChartTitle);

    let divChartContainer = this.createEl({
      type: "div",
      className: "column-chart__container",
    });

    let divChartHeader = this.createEl({
      type: "div",
      className: "column-chart__header",
      txtContent: this.formatHeading(this.value),
      dataEl: "header",
    });

    this.renderCharts();

    divChartContainer.append(divChartHeader);
    divChartContainer.append(this.divChartColumn);
    div.append(divChartContainer);

    return div;
  }
}
