import { css, html, LitElement } from 'lit';

const dateConverter = {
  toAttribute: (date) => date.toISOString(),
  fromAttribute: (value) => new Date(value),
};

export default class TimelinePlayerElement extends LitElement {
  static styles = css`p { color: blue }`;

  static properties = {
    min: {
      converter: dateConverter,
      reflect: true,
    },
    max: {
      converter: dateConverter,
      reflect: true,
    },
    value: {
      converter: dateConverter,
      reflect: true,
    },
    step: {
      type: String,
    },
  };

  constructor() {
    super();
    this.name = 'Somebody';
    this.min = new Date('2022-01-01');
    this.max = new Date('2022-05-01');
    this.step = 'd';
    this.value = new Date('2022-01-01');
  }

  doNextStep(amount = 1) {
    const newDate = new Date(this.value);

    switch (this.step) {
      case 'y': // year
        newDate.setFullYear(newDate.getFullYear() + 1 * amount);
        break;

      case 'm': // month
        newDate.setMonth(newDate.setMonth() + 1 * amount);
        break;

      case 'w': // week
        newDate.setDate(newDate.getDate() + 7 * amount);
        break;

      case 'd': // day
      default:
        newDate.setDate(newDate.getDate() + 1 * amount);
        break;
    }

    if (newDate <= this.max && newDate >= this.min) {
      this.value = newDate;
    }

    return this.value;
  }

  render() {
    return html`
    <progress value="2" min="1"></progress>
    <p>${this.value.toLocaleDateString()}</p>
    <button @click="${this.doNextStep}">-</button>
    <button @click="${this.doNextStep}">+</button>`;
  }
}

customElements.define('timeline-player', TimelinePlayerElement);
