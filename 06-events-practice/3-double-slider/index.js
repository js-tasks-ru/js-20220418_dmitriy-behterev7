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

  initializeEvents() {
    const slider = this.element.querySelector(".range-slider__inner");
    const leftHandle = this.element.querySelector(".range-slider__thumb-left");

    // ширина слайдера в px
    const sliderWidth = slider.getBoundingClientRect().width;

    const context = this;

    leftHandle.onpointerdown = function (event) {
      event.preventDefault();

      let shiftX = event.clientX - leftHandle.getBoundingClientRect().left;

      document.addEventListener("pointermove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      function onMouseMove(event) {
        let newLeft =
          event.clientX -
          shiftX -
          slider.getBoundingClientRect().left +
          leftHandle.getBoundingClientRect().width;

        //console.log("newLeft", newLeft);

        if (newLeft < 0) {
          newLeft = 0;
        }

        let rightEdge =
          slider.offsetWidth -
          leftHandle.offsetWidth +
          leftHandle.getBoundingClientRect().width;

        if (newLeft > rightEdge) {
          newLeft = rightEdge;
        }

        leftHandle.style.left = newLeft + "px";

        // относительная величина пути, пройденная левым бегунком с начала слайдера
        const sliderDelta =
          leftHandle.getBoundingClientRect().left -
          shiftX -
          slider.getBoundingClientRect().left +
          leftHandle.getBoundingClientRect().width;

        // пересчитаем длины в px в "единицы" слайдера
        const leftValue =
          Math.round(
            (sliderDelta * (context.max - context.min)) / sliderWidth
          ) + context.min;

        document.querySelector('[data-element="from"]').textContent =
          context.formatValue(leftValue);

        const rangeSelectEvent = new CustomEvent("range-select", {
          cancelable: true,
          detail: {
            leftHandle: true,
            leftValue: leftValue,
          },
        });
        leftHandle.dispatchEvent(rangeSelectEvent);
      }

      function onMouseUp() {
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("pointermove", onMouseMove);
      }
    };

    leftHandle.ondragstart = function () {
      return false;
    };

    const rightHandle = document.querySelector(".range-slider__thumb-right");
    rightHandle.onpointerdown = function (event) {
      event.preventDefault();

      let shiftX = event.clientX - rightHandle.getBoundingClientRect().left;

      document.addEventListener("pointermove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      function onMouseMove(event) {
        let newLeft =
          event.clientX -
          shiftX -
          slider.getBoundingClientRect().left +
          rightHandle.getBoundingClientRect().width;

        if (newLeft < 0) {
          newLeft = 0;
        }

        let rightEdge =
          slider.offsetWidth -
          rightHandle.offsetWidth +
          rightHandle.getBoundingClientRect().width;

        if (newLeft > rightEdge) {
          newLeft = rightEdge;
        }

        rightHandle.style.left = newLeft + "px";

        // относительная величина пути, пройденная левым бегунком с начала слайдера
        const sliderDelta =
          rightHandle.getBoundingClientRect().left -
          shiftX -
          slider.getBoundingClientRect().left +
          rightHandle.getBoundingClientRect().width;

        // пересчитаем длины в px в "единицы" слайдера
        const rightValue =
          Math.round(
            (sliderDelta * (context.max - context.min)) / sliderWidth
          ) + context.min;

        document.querySelector('[data-element="to"]').textContent =
          context.formatValue(rightValue);

        const rangeSelectEvent = new CustomEvent("range-select", {
          cancelable: true,
          detail: {
            rightHandle: true,
            rightValue: rightValue,
          },
        });
        rightHandle.dispatchEvent(rangeSelectEvent);
      }

      function onMouseUp() {
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("pointermove", onMouseMove);
      }
    };
  }
}
