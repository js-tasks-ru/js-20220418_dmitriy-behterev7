export default class NotificationMessage {
  constructor(msg, { duration = 2000, type = "success" } = {}) {
    this.msg = msg;
    this.type = type;
    this.duration = duration;
    this.notification = null;
    this.element = this.constructElement();
  }

  constructElement(el) {
    if (el && el instanceof Element) {
      el.append(document.createTextNode(this.msg));
      return el;
    }

    const msgElNotification = document.createElement("div");
    msgElNotification.classList.add("notification");
    msgElNotification.classList.add(this.type);
    msgElNotification.style.cssText = `--value:${this.duration / 1000}s`;

    const msgElTimer = document.createElement("div");
    msgElTimer.className = "timer";

    msgElNotification.append(msgElTimer);

    const msgElInnerWrapper = document.createElement("div");
    msgElInnerWrapper.className = "inner-wrapper";

    const msgNotificationHeader = document.createElement("div");
    msgNotificationHeader.className = "notification-header";
    msgNotificationHeader.append(document.createTextNode(this.type));

    const msgElNotificationBody = document.createElement("div");
    msgElNotificationBody.className = "notification-body";

    msgElNotificationBody.append(document.createTextNode(this.msg));

    msgElInnerWrapper.append(msgNotificationHeader);
    msgElInnerWrapper.append(msgElNotificationBody);

    msgElNotification.append(msgElInnerWrapper);

    return msgElNotification;
  }

  destroy() {
    if (!this.element) return;
    try {
      this.element.remove();
    } catch (e) {
      console.log("can't remove notification HTML element!");
    } finally {
      this.element = null;
    }
  }

  remove() {
    this.destroy();
  }

  show(el) {
    setTimeout(() => {
      this.remove();
    }, this.duration);

    if (el) {
      this.element = this.constructElement(el);
    } else if (!this.element) {
      this.element = this.constructElement();
    }

    document.body.append(this.element);
  }

  hide() {
    if (!this.element) return;
    this.destroy();
  }
}

// let msg = new NotificationMessage("test");
