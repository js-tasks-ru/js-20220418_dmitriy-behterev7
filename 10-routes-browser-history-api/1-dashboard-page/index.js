import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element;

  subElements = {};

  components = {};

  async updateComponents(from, to) {
    const data = await fetchJson(
      `${BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=30&from=${from.toISOString()}&to=${to.toISOString()}`
    );

    for (let [componentName, componentInstance] of Object.entries(
      this.components
    )) {
      if (componentInstance instanceof RangePicker) {
        continue;
      } else if (componentInstance instanceof SortableTable) {
        componentInstance.update(data);
      } else {
        componentInstance.update(from, to);
      }
    }
  }

  initComponents() {
    const now = new Date();
    const to = new Date();

    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to,
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=30&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true,
    });

    const ordersChart = new ColumnChart({
      url: "api/dashboard/orders",
      range: {
        from,
        to,
      },
      label: "orders",
      link: "#",
    });

    const salesChart = new ColumnChart({
      url: "api/dashboard/sales",
      label: "sales",
      range: {
        from,
        to,
      },
    });

    const customersChart = new ColumnChart({
      url: "api/dashboard/customers",
      label: "customers",
      range: {
        from,
        to,
      },
    });

    this.components = {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
      rangePicker,
    };
  }

  async render() {
    const _el = document.createElement("div");
    _el.innerHTML = this.template();

    this.element = _el.firstElementChild;
    // все data- элементы
    this.subElements = this.getSubElements();

    // инициализация компонентов
    this.initComponents();

    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  template() {
    return `<div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h1 class="block-title">Best sellers</h1>
        <div data-element="sortableTable"></div>
      </div>`;
  }

  renderComponents() {
    // с лекции про компоненты
    Object.keys(this.components).forEach((component) => {
      const root = this.subElements[component];
      const { element } = this.components[component];
      root.append(element);
    });
  }

  getSubElements() {
    // с лекции про компоненты
    const elements = this.element.querySelectorAll("[data-element]");

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  // ф-я стрелка для сохранения контекста
  handleDateSelect = (event) => {
    const { from, to } = event.detail;
    this.updateComponents(from, to);
  };

  initEventListeners() {
    // если пользователь изменил диапазон дат
    this.components.rangePicker.element.addEventListener(
      "date-select",
      this.handleDateSelect
    );
  }

  remove() {
    // если элементы есть, то удалим
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
    this.components.rangePicker.element.removeEventListener(
      "date-select",
      this.handleDateSelect
    );

    // очищаем все компоненты которые создали
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
