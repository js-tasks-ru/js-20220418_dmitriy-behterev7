export default class DoubleSlider {
  constructor({ min, max, selected, formatValue } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue =
      typeof formatValue === "function" ? formatValue : (val) => val;
    this.selected = selected;

    this.render();
    this.initializeEvents();
    this.moveHandlebars();
  }

  destroy() {
    this.element.remove();
  }

  ifSelected() {
    if (
      this.selected &&
      typeof this.selected === "object" &&
      !Array.isArray(this.selected) &&
      this.selected !== null &&
      this.selected.from &&
      this.selected.to
    ) {
      return true;
    }

    return false;
  }

  render() {
    this.element = document.createElement("div");
    this.element.className = "range-slider";

    let from = "";
    let to = "";
    if (this.ifSelected()) {
      from = this.formatValue(this.selected.from);
      to = this.formatValue(this.selected.to);
    } else {
      from = this.formatValue(this.min);
      to = this.formatValue(this.max);
    }

    this.element.innerHTML = `
            <span data-element="from">${from}</span>
            <div class="range-slider__inner">
            <span class="range-slider__progress"></span>
            <span class="range-slider__thumb-left"></span>
            <span class="range-slider__thumb-right"></span>
            </div>
            <span data-element="to">${to}</span>
        `;
    document.body.append(this.element);
  }

  moveHandlebars() {
    if (!this.ifSelected()) {
      return;
    }

    const leftHandle = this.element.querySelector(".range-slider__thumb-left");
    const rightHandle = this.element.querySelector(
      ".range-slider__thumb-right"
    );

    const base = this.max - this.min;

    if (this.selected.from !== this.min) {
      const delta = this.selected.from - this.min;
      const deltaPercent = (delta * 100) / base;
      leftHandle.style.left = deltaPercent + "%";
    }

    if (this.selected.to !== this.max) {
      const delta = this.selected.to - this.min;
      const deltaPercent = (delta * 100) / base;
      rightHandle.style.left = deltaPercent + "%";
    }
  }

  pointerDown = (event) => {
    event.preventDefault();
    const handle = event.target;

    const slider = document.querySelector(".range-slider__inner");
    // ширина слайдера в px
    const sliderWidth = slider.getBoundingClientRect().width;

    let shiftX = event.clientX - handle.getBoundingClientRect().left;

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);

    const context = this;

    function onPointerMove(event) {
      let newLeft =
        event.clientX -
        shiftX -
        slider.getBoundingClientRect().left +
        handle.getBoundingClientRect().width;

      if (newLeft < 0) {
        newLeft = 0;
      }

      let rightEdge =
        slider.offsetWidth -
        handle.offsetWidth +
        handle.getBoundingClientRect().width;

      if (newLeft > rightEdge) {
        newLeft = rightEdge;
      }

      handle.style.left = newLeft + "px";

      // относительная величина пути, пройденная левым бегунком с начала слайдера
      const sliderDelta =
        handle.getBoundingClientRect().left -
        shiftX -
        slider.getBoundingClientRect().left +
        handle.getBoundingClientRect().width;

      // пересчитаем длины в px в "единицы" слайдера
      const value =
        Math.round((sliderDelta * (context.max - context.min)) / sliderWidth) +
        context.min;

      document.querySelector(
        `[data-element="${handle.className.includes("left") ? "from" : "to"}"]`
      ).textContent = context.formatValue(value);

      const rangeSelectEvent = new CustomEvent("range-select", {
        cancelable: true,
        detail: {},
      });
      handle.dispatchEvent(rangeSelectEvent);
    }

    function onPointerUp() {
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointermove", onPointerMove);
    }
  };

  initializeEvents() {
    const leftHandle = this.element.querySelector(".range-slider__thumb-left");
    leftHandle.addEventListener("pointerdown", this.pointerDown);
    leftHandle.ondragstart = function () {
      return false;
    };

    const rightHandle = this.element.querySelector(
      ".range-slider__thumb-right"
    );
    rightHandle.addEventListener("pointerdown", this.pointerDown);
    rightHandle.ondragstart = function () {
      return false;
    };
  }
}
