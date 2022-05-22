class Tooltip {
  _tooltipDiv = null;
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
    this.initializeTooltip();
  }

  initialize() {
    this._setPointerOnHandler = this.setPointerOnHandler.bind(this);
    this._setPointerOutHandler = this.setPointerOutHandler.bind(this);

    document.addEventListener("pointerover", this._setPointerOnHandler);
    document.addEventListener("pointerout", this._setPointerOutHandler);
  }

  initializeTooltip() {
    if (!this.element) {
      this.element = document.createElement("div");
      this.element.className = "tooltip";
    }
  }

  destroy() {
    if (!this.element) {
      return;
    }
    this.element.remove();
  }

  render(tooltipText, clientX, clientY) {
    if (!this.element) {
      this.initializeTooltip();
    }

    // if (!tooltipText) {
    //   // нечего показывать
    //   return;
    // }

    this.element.textContent = tooltipText;

    if (!document.querySelector("div.tooltip")) {
      // в DOM нет элемента содержащего подсказку
      document.body.append(this.element);
    }

    if (clientY) {
      this.element.style.top = clientY + "px";
    }

    if (clientX) {
      this.element.style.left = clientX + "px";
    }
  }

  setPointerOutHandler({ target }) {
    const tooltipDataEl = target.closest("div[data-tooltip]");
    if (this._tooltipDiv === tooltipDataEl) {
      //console.log("в пределах того же див");
    }
  }

  setPointerOnHandler({ target, clientX, clientY }) {
    const tooltipDataEl = target.closest("div[data-tooltip]");

    if (!tooltipDataEl) {
      this.destroy();
      return;
    }

    this._tooltipDiv = tooltipDataEl;

    const tooltipData = tooltipDataEl.dataset.tooltip;

    if (!tooltipData) {
      //this.removeTooltip();
      return;
    }

    this.render(tooltipData, clientX, clientY);
  }
}

export default Tooltip;
