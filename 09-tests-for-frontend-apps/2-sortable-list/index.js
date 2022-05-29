export default class SortableList {
  element;

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement("ul");
    this.element.className = "sortable-list";

    this.items.forEach((imgEl) => this.element.append(imgEl));

    this.attachListeners();
  }

  attachListeners() {
    this.element.addEventListener("pointerdown", (event) => {
      // ближайший родитель, внутри которого кликнули
      const clickedEl = event.target.closest(".sortable-list__item");

      if (!clickedEl) {
        return;
      }

      // если он есть..
      if (event.target.closest("[data-grab-handle]")) {
        event.preventDefault();

        // позиция переносимого элемента в массиве эл-тов картинок
        this.elementInitialIndex = [...this.element.children].indexOf(
          clickedEl
        );

        this.elDraggingNow = clickedEl;

        // плейсхолдер, задействуется в тестах
        this.placeholder = document.createElement("li");
        this.placeholder.className = "sortable-list__placeholder";

        // >>>>>>>>>>>>>> подсмотрено, сам бы не додумался >>>>>>>>>>>>>>>>
        clickedEl.style.width = `${clickedEl.offsetWidth}px`;
        clickedEl.style.height = `${clickedEl.offsetHeight}px`;

        this.placeholder.style.width = clickedEl.style.width;
        this.placeholder.style.height = clickedEl.style.height;

        clickedEl.classList.add("sortable-list__item_dragging");

        clickedEl.after(this.placeholder);

        document.addEventListener("pointermove", this.pointerMove);
        document.addEventListener("pointerup", this.pointerUp);
      }

      if (event.target.closest("[data-delete-handle]")) {
        event.preventDefault();

        clickedEl.remove();
      }
    });
  }

  movePlaceholder(index) {
    const currElement = this.element.children[index];

    if (currElement !== this.placeholder) {
      this.element.insertBefore(this.placeholder, currElement);
    }
  }

  pointerUp = () => {
    //console.dir(this.elDraggingNow);

    this.placeholder.replaceWith(this.elDraggingNow);
    this.elDraggingNow.classList.remove("sortable-list__item_dragging");

    this.elDraggingNow.style.left = "";
    this.elDraggingNow.style.top = "";
    this.elDraggingNow.style.width = "";
    this.elDraggingNow.style.height = "";

    document.removeEventListener("pointermove", this.pointerMove);
    document.removeEventListener("pointerup", this.pointerUp);

    this.elDraggingNow = null;
  };

  pointerMove = ({ clientX, clientY }) => {
    // подсмотрено, не додумался бы, сложно для понимания.
    // Считаю, что на курсе нужна отдельная глава по координатам, она не понятна, каша даже после прочтения учебника
    // пройдемся по всем li в контейнере картинок
    for (let i = 0; i < this.element.children.length; i++) {
      const li = this.element.children[i];

      if (li !== this.elDraggingNow) {
        const { top, bottom } = li.getBoundingClientRect();

        if (clientY > top && clientY < bottom) {
          this.movePlaceholder(i);
          break;
        }
      }
    }
  };

  remove() {
    this.element.remove();

    document.removeEventListener("pointermove", this.pointerMove);
    document.removeEventListener("pointerup", this.pointerUp);
  }

  destroy() {
    this.remove();
  }
}
