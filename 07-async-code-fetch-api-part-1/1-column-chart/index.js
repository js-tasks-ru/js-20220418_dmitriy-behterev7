import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  constructor(
    {
      data = [],
      label = "",
      value = "",
      link = "",
      formatHeading = (val) => val,
      chartHeight = 50,
    } = {
      data: [],
      label: "",
      value: "",
      link: "",
      formatHeading: (val) => val,
      chartHeight: 50,
    }
  ) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = chartHeight;
    this.element = this.getElement();
    this.divChartColumn = null;
  }

  renderCharts() {
    const maxValue = Math.max(...this.data);
    let scale;
    if (maxValue) {
      scale = 50 / maxValue;
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

    this.data.forEach((val) => {
      let divEl = this.createEl({
        type: "div",
        style: `--value: ${Math.floor(val * scale)}`,
        dataTooltip: `${((val / maxValue) * 100).toFixed(0)}%`,
      });

      this.divChartColumn.append(divEl);
    });
  }

  update(newData) {
    if (!Array.isArray(newData)) {
      return;
    }
    this.data = newData;
    this.renderCharts();
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

  getElement() {
    let div;

    div = this.createEl({
      type: "div",
      className: `column-chart${
        this.data.length === 0 ? " column-chart_loading" : ""
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
