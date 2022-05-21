function formatDate(date) {
  return date.toLocaleDateString("ru");
}

function calculateCalendarOffset(dayOfWeek) {
  return dayOfWeek === 0 ? 7 : dayOfWeek;
}

function getLastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export default class RangePicker {
  constructor({ from = new Date(), to = new Date() } = {}) {
    this.element = null;

    this.selectedDates = {
      from,
      to,
    };

    this.chosenMonth = new Date(from);

    this.needsToRerenderCalendarPanel = false;

    this.initializeCalendar();

    this.startSelecting = true;
  }

  clickOnCalendarPanel = (event) => {
    this.renderCalendarPanel();
    const cellEl = event.target.closest(".rangepicker__cell");
    if (!cellEl) {
      return;
    }

    const cellDate = new Date(cellEl.dataset.value);
    if (this.startSelecting) {
      this.startSelecting = false;
      this.selectedDates = {
        from: cellDate,
        to: null,
      };
      this.visualizeSelectedRangeOnCalendarPanel();
    } else {
      if (cellDate > this.selectedDates.from) {
        this.selectedDates.to = cellDate;
      } else {
        this.selectedDates.to = new Date(this.selectedDates.from);
        this.selectedDates.from = cellDate;
      }

      this.startSelecting = true;
      this.visualizeSelectedRangeOnCalendarPanel();
    }

    if (this.selectedDates.from && this.selectedDates.to) {
      // обновим инфу о выбранном диапазоне
      const fromEl = this.element.querySelector(
        '.rangepicker__input [data-element="from"]'
      );
      fromEl.innerHTML = formatDate(this.selectedDates.from);

      const toEl = this.element.querySelector(
        '.rangepicker__input [data-element="to"]'
      );
      toEl.innerHTML = formatDate(this.selectedDates.to);

      // сгенерируем кастомное событие
      const custEvent = new CustomEvent("date-select");
      this.element.dispatchEvent(custEvent);

      // закроем панель
      this.element.classList.remove("rangepicker_open");
    }
  };

  visualizeSelectedRangeOnCalendarPanel() {
    const selectedDateFrom =
      this.selectedDates.from && this.selectedDates.from.toISOString();
    const selectedDateTo =
      this.selectedDates.to && this.selectedDates.to.toISOString();

    const allCellsEls = this.element.querySelectorAll(
      ".rangepicker__selector .rangepicker__cell"
    );
    for (const cellEl of allCellsEls) {
      // удалим все классы выделения
      cellEl.classList.remove("rangepicker__selected-from");
      cellEl.classList.remove("rangepicker__selected-between");
      cellEl.classList.remove("rangepicker__selected-to");

      const cellDate = cellEl.dataset.value;

      if (cellDate === selectedDateFrom) {
        cellEl.classList.add("rangepicker__selected-from");
      } else if (cellDate === selectedDateTo) {
        cellEl.classList.add("rangepicker__selected-to");
      } else if (cellDate >= selectedDateFrom && cellDate <= selectedDateTo) {
        cellEl.classList.add("rangepicker__selected-between");
      }
    }
  }

  renderCalendarPanel() {
    const nextMonth = new Date(this.chosenMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    let selector = this.element.querySelector('[data-element="selector"]');
    if (
      selector.childNodes.length !== 0 &&
      !this.needsToRerenderCalendarPanel
    ) {
      // календарь уже заполнен
      return;
    }

    selector.innerHTML = `
    <div class="rangepicker__selector-arrow"></div>
    <div class="rangepicker__selector-control-left"></div>
    <div class="rangepicker__selector-control-right"></div>
    ${this.fillCalendar(this.chosenMonth)}
    ${this.fillCalendar(nextMonth)}`;

    this.needsToRerenderCalendarPanel = false;

    // навесим события на кнопки
    const prevMonthBtn = this.element.querySelector(
      ".rangepicker__selector-control-left"
    );
    const nextMonthBtn = this.element.querySelector(
      ".rangepicker__selector-control-right"
    );

    prevMonthBtn.addEventListener("click", () => {
      this.needsToRerenderCalendarPanel = true;
      this.chosenMonth.setMonth(this.chosenMonth.getMonth() - 1);
      this.renderCalendarPanel();
    });

    nextMonthBtn.addEventListener("click", () => {
      this.needsToRerenderCalendarPanel = true;
      this.chosenMonth.setMonth(this.chosenMonth.getMonth() + 1);
      this.renderCalendarPanel();
    });

    this.visualizeSelectedRangeOnCalendarPanel();
  }

  initializeCalendar() {
    this.element = document.createElement("div");
    this.element.className = "rangepicker";
    this.element.innerHTML = `
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${formatDate(
            this.selectedDates.from
          )}</span> -
          <span data-element="to">${formatDate(this.selectedDates.to)}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      `;
    //
    //this.renderCalendarPanel();
    //
    this.attachEvents();
  }

  attachEvents() {
    const dataInputEl = this.element.querySelector('[data-element="input"]');
    dataInputEl.addEventListener("click", () => {
      this.renderCalendarPanel();
      this.element.classList.toggle("rangepicker_open");
    });

    const selectorEl = this.element.querySelector('[data-element="selector"]');
    selectorEl.addEventListener("click", this.clickOnCalendarPanel);

    // ToDo - нужно доработать
    document.addEventListener("click", (event) => {
      if (this.element && !this.element.contains(event.target)) {
        //this.element.classList.remove("rangepicker_open");
        // console.log(this.element);
        // console.log(event.target);
        // console.log("кликнули не на панели календаря");
      }
    });
  }

  fillCalendar(onDate) {
    const calculatedDate = new Date(onDate);
    calculatedDate.setDate(1); // на начало месяца
    const monthName = calculatedDate.toLocaleString("ru", { month: "long" }); // месяц строкой

    const dayOfWeek = calculatedDate.getDay(); // день недели: от 0 (воскресенье) до 6 (суббота)

    let filledCalendar = `
    <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
            <time datetime=${monthName}>${monthName}</time>
        </div>
        <div class="rangepicker__day-of-week">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div>Сб</div>
            <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid"><button type="button" class="rangepicker__cell" data-value="${calculatedDate.toISOString()}" style="--start-from: ${calculateCalendarOffset(
      dayOfWeek
    )}">${calculatedDate.getDate()}</button>`;

    for (
      let nextDay = 2;
      nextDay <= getLastDayOfMonth(calculatedDate);
      nextDay++
    ) {
      calculatedDate.setDate(nextDay);
      filledCalendar += `<button type="button" class="rangepicker__cell" data-value="${calculatedDate.toISOString()}">${calculatedDate.getDate()}</button>`;
    }

    filledCalendar += `
        </div>
    </div>`;

    return filledCalendar;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
