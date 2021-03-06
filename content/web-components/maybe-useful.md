---
title: Web Component Stuff
template: 'post'
draft: false
image: 'https://www.webcomponents.org/assets/logo-192x192.png'
alt: 'web components logo'
slug: '/web-component/maybe-useful'
category: 'Web Components'
tags:
  - 'Web Component stuff'
  - 'Web Components'
description: 'Some stuff that may be useful in the future.'
---

## Maybe useful stuff that I wrote in the past

### How to define

```js
class AppDrawer extends HTMLElement {...}
window.customElements.define('app-drawer', AppDrawer);

// Or use an anonymous class if you don't want a named constructor in current scope.
window.customElements.define('app-drawer', class extends HTMLElement {...});
```

which you can then use as so:

`<app-drawer></app-drawer>`

### Defining an element's JS API

You need to use the `class` syntax and extend HTMLElement

```js
class AppDrawer extends HTMLElement {

  // A getter/setter for an open property.
  get open() {
    return this.hasAttribute('open');
  }

  set open(val) {
    // Reflect the value of the open property as an HTML attribute.
    if (val) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
    this.toggleDrawer();
  }

  // A getter/setter for a disabled property.
  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    // Reflect the value of the disabled property as an HTML attribute.
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  // Can define constructor arguments if you wish.
  constructor() {
    // If you define a constructor, always call super() first!
    // This is specific to CE and required by the spec.
    super();

    // Setup a click listener on <app-drawer> itself.
    this.addEventListener('click', e => {
      // Don't toggle the drawer if it's disabled.
      if (this.disabled) {
        return;
      }
      this.toggleDrawer();
    });
  }

  toggleDrawer() {
    ...
  }
}

customElements.define('app-drawer', AppDrawer);
```

Basically, you can encapsulate all the logic you need directly in the element.

### this

`this` inside a class definition refers to the DOM element itself.

- Can even use `this.querySelectorAll('.items')`
  - An interesting fact, if you query select with a specific element, you can only find children in this query.

### Rules on creating custom elements

1. Name must contain a dash.
2. You cannot register the same tag more than once.
3. Custom elements cannot be self-closing.

### Custom element reactions (Lifestyle methods)

#### constructor

When an instance of the element is created or upgraded. State can be initialised, event listener setup, or creating

#### connectedCallback

Called every time the element is inserted into the DOM. Can run setup code (fetch resources or rendering). Work should be delayed until this time.

#### disconnectedCallback

Called every time the element is removed from the DOM, useful to clean up code. Will not be called if the user closes the tab (or something similar).

#### attributeChangedCallback(attrName, oldVal, newVal)

Called when an observed attribute has been added, removed, updated, or replaced.

#### adoptedCallback

Custom element has been moved into a new document

### Adding these lifecycle methods to the element

```js
class AppDrawer extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor.
    ...
  }
  connectedCallback() {
    ...
  }
  disconnectedCallback() {
    ...
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    ...
  }
}
```

### Properties and attributes

#### Reflecting properties to attributes

Useful when you want to keep the element's DOM representation in sync with its JS state.

If you want to add some functionality for css like this:

```css
app-drawer[disabled] {
  opacity: 0.5;
  pointer-events: none;
}
```

then you can do this:

```js
get disabled() {
  return this.hasAttribute('disabled');
}

set disabled(val) {
  // Reflect the value of `disabled` as an attribute.
  if (val) {
    this.setAttribute('disabled', '');
  } else {
    this.removeAttribute('disabled');
  }
  this.toggleDrawer();
}
```

#### Observing changes to attributes

```html
<app-drawer open disabled></app-drawer>
```

Observe these attributes as so:

```js
class AppDrawer extends HTMLElement {
  ...

  static get observedAttributes() {
    return ['disabled', 'open'];
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  // Only called for the disabled and open attributes due to observedAttributes
  attributeChangedCallback(name, oldValue, newValue) {
    // When the drawer is disabled, update keyboard/screen reader behavior.
    if (this.disabled) {
      this.setAttribute('tabindex', '-1');
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.setAttribute('tabindex', '0');
      this.setAttribute('aria-disabled', 'false');
    }
    // TODO: also react to the open attribute changing.
  }
}
```

And you can use the `attributeChangedCallback` to keep a JS property in sync with its attribute.

### Element upgrades

#### Progressively enhanced HTML

Custom elements can be used _before_ their definition is registered.

Using `define()` and endowing an element with a class definition is known as an element upgrade

`window.customElements.whenDefined('some-element')` creates a Promise that resolves when the element becomes defined

```js
<share-buttons>
  <social-button type="twitter"><a href="...">Twitter</a></social-button>
  <social-button type="fb"><a href="...">Facebook</a></social-button>
  <social-button type="plus"><a href="...">G+</a></social-button>
</share-buttons>



// Fetch all the children of <share-buttons> that are not defined yet.
let undefinedButtons = buttons.querySelectorAll(':not(:defined)');

let promises = [...undefinedButtons].map(socialButton => {
  return customElements.whenDefined(socialButton.localName);
));

// Wait for all the social-buttons to be upgraded.
Promise.all(promises).then(() => {
  // All social-button children are ready.
});
```

Custom elements state is either `undefined`, `uncustomised`, or `custom`.

### Element-defined content

#### Creating an element that uses Shadow DOM

```html
<template id="x-foo-from-template">
  <style>
    :host {
      color: green;
    }
  </style>
  <p>I'm in Shadow DOM. My markup was stamped from a &lt;template&gt;.</p>
</template>

<script>
  let tmpl = document.querySelector('#x-foo-from-template');
  // If your code is inside of an HTML Import you'll need to change the above line to:
  // let tmpl = document.currentScript.ownerDocument.querySelector('#x-foo-from-template');

  customElements.define('x-foo-from-template', class extends HTMLElement {
    constructor() {
      super(); // always call super() first in the constructor.
      let shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(tmpl.content.cloneNode(true));
    }
    ...
  });
</script>
```

`template` element clones the DOM. It allows you to declare fragments of the DOM which are parsed, inactive at page load, and can be activated during the runtime.

This is an example of the Shadow DOM. It allows you to create a local DOM with internal CSS scoped to the element.

Scoping styles to an element with `:host`.

### Styling a custom element

#### Pre-styling unregistered elements

```css
app-drawer:not(:defined) {
  /* Pre-style, give layout, replicate app-drawer's eventual styles, etc. */
  display: inline-block;
  height: 100vh;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
```

`:defined` attribute only exists before... it gets definied.

### Extending elements

#### Extending a custom element

```js
class FancyDrawer extends AppDrawer {
  constructor() {
    super(); // always call super() first in the constructor. This also calls the extended class' constructor.
    ...
  }

  toggleDrawer() {
    // Possibly different toggle implementation?
    // Use ES2015 if you need to call the parent method.
    // super.toggleDrawer()
  }

  anotherMethod() {
    ...
  }
}

customElements.define('fancy-app-drawer', FancyDrawer);
```

#### Extending native HTML elements

> A customized built-in element is a custom element that extends one of the browser's built-in HTML tags. The primary benefit of extending an existing element is to gain all of its features (DOM properties, methods, accessibility).

Extending `<button>`

```js
// See https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
// for the list of other DOM interfaces.
class FancyButton extends HTMLButtonElement {
  constructor() {
    super(); // always call super() first in the constructor.
    this.addEventListener('click', e => this.drawRipple(e.offsetX, e.offsetY));
  }

  // Material design ripple animation.
  drawRipple(x, y) {
    let div = document.createElement('div');
    div.classList.add('ripple');
    this.appendChild(div);
    div.style.top = `${y - div.clientHeight / 2}px`;
    div.style.left = `${x - div.clientWidth / 2}px`;
    div.style.backgroundColor = 'currentColor';
    div.classList.add('run');
    div.addEventListener('transitionend', e => div.remove());
  }
}

customElements.define('fancy-button', FancyButton, { extends: 'button' });
```

Notice the third option of `.define` is used to extend the `button`.

Now, `FancyButton` has access to all `button` DOm properties... disabled, click, keydown, tabindex, etx.

#### Ways to use it:

Extending `button`

`<button is="fancy-button" disabled>Fancy button!</button>`

or with JS:

```js
// Custom elements overload createElement() to support the is="" attribute.
let button = document.createElement('button', { is: 'fancy-button' });
button.textContent = 'Fancy button!';
button.disabled = true;
document.body.appendChild(button);

// or this way:

let button = new FancyButton();
button.textContent = 'Fancy button!';
button.disabled = true;
```

Extending `image`

```html
<img is="bigger-img" width="15" height="20" />
```

or in JS:

```js
const BiggerImage = customElements.get('bigger-img');
const image = new BiggerImage(15, 20); // pass constructor values like so.
console.assert(image.width === 150);
console.assert(image.height === 200);
```

#### Misc Details

Unknown elements vs. undefined custom elements

`<randomtagthatdoesntexist>` will be created but it will be parsed as `HTMLUnknownElement`. Not as a custom element.

### API reference

#### define(tagName, constructor, options)

```js
customElements.define('my-app', class extends HTMLElement { ... });
customElements.define(
  'fancy-button', class extends HTMLButtonElement { ... }, {extends: 'button'});
```

#### get(tagName)

Returns an element's constructor. Undefined if it has not been registered.

```js
let Drawer = customElements.get('app-drawer');
let drawer = new Drawer();
```

#### whenDefined(tagName)

Returns a Promise that resolves when the custom element is defined. Immediately resolved if it is defined. Rejects if invalid.

### History and browser support

Use this polyfill:

https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs

As so:

`npm install --save @webcomponents/webcomponentsjs`

```html
<!-- Use the custom element on the page. -->
<my-element></my-element>

<!-- Load polyfills; note that "loader" will load these async -->
<script
  src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"
  defer
></script>

<!-- Load a custom element definitions in `waitFor` and return a promise -->
<script type="module">
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  WebComponents.waitFor(() => {
    // At this point we are guaranteed that all required polyfills have
    // loaded, and can use web components APIs.
    // Next, load element definitions that call `customElements.define`.
    // Note: returning a promise causes the custom elements
    // polyfill to wait until all definitions are loaded and then upgrade
    // the document in one batch, for better performance.
    return loadScript('my-element.js');
  });
</script>
```

- Note: the :defined CSS pseudo-class cannot be polyfilled.

## Shadow DOM

### Introduction

Shadow DOM is one of the four Web Component standards.

Features:

1. Isolate DOM: `document.querySelector()` will not return elements in a Shadow DOM, (it's outside of the DOM?)
2. Scoped CSS: CSS defined inside shadow DOM is scoped to it.
3. Composition: allows declarative, markup-based API
4. Simplifies CSS: can use simple CSS selectors, and not worry about naming conflicts
5. Productivity: you can think of apps in chunks of DOM rather than one global page

### What is shadow DOM?

#### Background on DOM

HTML -> live representation of your page = tree of nodes (data model of objects and nodes)

#### Shadow DOM vs DOM

It's just a normal DOM with two differences.

1. How it's created/used
2. How it behaves in relation to the rest of the page.

ie. a scoped DOM tree called the _shadow tree_ and the element it is attached to (the shadow tree) is the _shadow host_

### Creating shadow DOM

_Shadow root_ is a fragment that gets attached to a host element. You attach it to an element as so:

```js
const header = document.createElement('header');
const shadowRoot = header.attachShadow({ mode: 'open' });
shadowRoot.innerHTML = '<h1>Hello Shadow DOM</h1>'; // Could also use appendChild().

// header.shadowRoot === shadowRoot
// shadowRoot.host === header
```

[There are elements that cannot host a shadow tree](https://dom.spec.whatwg.org/#dom-element-attachshadow).

#### Creating shadow DOM for a custom element

Do so in the constructor when defining a web component.

### Composition and slots

#### Composition in general

Native elements like select, details, form, and video. Each accepts certain HTML as children and can do something special with them.

#### Terminology: light DOM vs shadow DOM

Light DOM

- This is the actual children of the element, not a part of the shadow DOM.

```html
<better-button>
  <!-- the image and span are better-button's light DOM -->
  <img src="gear.svg" slot="icon" />
  <span>Settings</span>
</better-button>
```

Shadow DOM

- Local to the component, and defines its internal structure, etc.

```html
#shadow-root
<style></style>
<slot name="icon"></slot>
<span id="wrapper">
  <slot>Button</slot>
</span>
```

Flattened DOM tree

```html
<better-button>
  #shadow-root
  <style></style>
  <slot name="icon">
    <img src="gear.svg" slot="icon" />
  </slot>
  <span id="wrapper">
    <slot>
      <span>Settings</span>
    </slot>
  </span>
</better-button>
```

- Notice how `<img src="gear.svg" slot="icon">` is now a part of the slot element. The second slot does not make sense atm.

The `<slot>`element

- Placeholders inside your component that users can fill with their own markup.
- Elements can "cross" the shadow DOM boundary when a `<slot>` invites them in.
- There can be zero or more slots in a shadow DOM.

```html
<!-- Default slot. If there's more than one default slot, the first is used. -->
<slot></slot>

<slot>fallback content</slot>
<!-- default slot with fallback content -->

<slot>
  <!-- default slot entire DOM tree as fallback -->
  <h2>Title</h2>
  <summary>Description text</summary>
</slot>
```

Named slots

```html
#shadow-root
<div id="tabs">
  <slot id="tabsSlot" name="title"></slot>
  <!-- named slot -->
</div>
<div id="panels">
  <slot id="panelsSlot"></slot>
</div>
```

And using the named slot

```html
<fancy-tabs>
  <button slot="title">Title</button>
  <button slot="title" selected>Title 2</button>
  <button slot="title">Title 3</button>
  <section>content panel 1</section>
  <section>content panel 2</section>
  <section>content panel 3</section>
</fancy-tabs>
```

- which would become this:

```html
<fancy-tabs>
  #shadow-root
  <div id="tabs">
    <slot id="tabsSlot" name="title">
      <button slot="title">Title</button>
      <button slot="title" selected>Title 2</button>
      <button slot="title">Title 3</button>
    </slot>
  </div>
  <div id="panels">
    <slot id="panelsSlot">
      <section>content panel 1</section>
      <section>content panel 2</section>
      <section>content panel 3</section>
    </slot>
  </div>
</fancy-tabs>
```

### Styling

#### Component-defined styles

ie. scoped css

- CSS selectors from the outer page don't apply inside your component.
- Styles defined inside don't bleed out. They're scoped to the host element.

A component styling itself

```html
<style>
  :host {
    display: block; /* by default, custom elements are display: inline */
    contain: content; /* CSS containment FTW. */
  }
</style>
```

#### Styling based on context

`:host-context(<selector>)` matches the component if it or any of its ancestors.

```html
<body class="darktheme">
  <fancy-tabs>
    ...
  </fancy-tabs>
</body>
```

```css
:host-context(.darktheme) {
  color: white;
  background: black;
}
```

Basically:

`:host` is for styling the host component
`:host(element)` is for styling the shadow host of the shadow DOM containing the CSS it is used inside... ?
`:host-context` is used for styling a specific class anywhere outside the current element

#### Styling distributed nodes

> `::slotted(<compound-selector>)` matches nodes that are distributed into a `<slot>`.

```html
<style>
  ::slotted(h2) {
    margin: 0;
    font-weight: 300;
    color: red;
  }
  ::slotted(.title) {
    color: orange;
  }
  /* DOESN'T WORK (can only select top-level nodes). */
  ::slotted(.company),
  ::slotted(.title .company) {
    text-transform: uppercase;
  }
</style>
```

#### Styling a component from the outside

```css
fancy-tabs {
  width: 500px;
  color: red; /* Note: inheritable CSS properties pierce the shadow DOM boundary. */
}
fancy-tabs:hover {
  box-shadow: 0 3px 3px #ccc;
}
```

- Note: outside styles always win over styles defined in shadow DOM.

#### Creating style hooks using CSS custom properties

```html
<!-- main page -->
<style>
  fancy-tabs {
    margin-bottom: 32px;
    --fancy-tabs-bg: black;
  }
</style>
<fancy-tabs background>...</fancy-tabs>
```

- A CSS custom property is defined

```css
:host([background]) {
  background: var(--fancy-tabs-bg, #9e9e9e);
  border-radius: 10px;
  padding: 10px;
}
```

- And inside the shadow DOM the property is used.

Usefulness?

- To allow users of a component to be able to customise parts of component (styling here).

### Advanced Topics

#### Creating closed shadow roots (should avoid)

Avoid doing `this.attachShadow({mode: 'closed'});`

#### Working with slots in JS

`slotchange` event

- Fires when a slot's distributed nodes changes. As when a user add/removes children from the light DOM

Finding out what elements are being rendered in a slot

`slot.assignedNodes()`

- for finding which elements the slot is rendering

`slot.assignedNodes({flatten: true})`

- returns a slot's fallback content

For finding out what slot an element is being assigned to use `element.assignedSlot`

### The Shadow DOM event model

Events are "re-targeted" to look like they've come from the component rather than internal elements within the shadow DOM. There are a bunch of events that propagate out of the shadow DOM.

- `focus`, `click`, `keydown`, etc.

- Note: call `event.composedPath()` to see which nodes the event traveled through.

#### Using custom events

> Custom DOM events which are fired on internal nodes in a shadow tree do not bubble out of the shadow boundary unless the event is created using the `composed: true` flag:

> If `composed: false` (default), consumers won't be able to listen for the event outside of your shadow root.

#### Handing focus

Events that are fired inside the shadow DOM are adjusted to look like they come from the hosting element.

```html
<x-focus>
  #shadow-root
  <input type="text" placeholder="Input inside shadow dom"
/></x-focus>
```

- The `focus` event will look like it came from `<x-focus>` rather then `<input>`

To see which element actually gained focus:

`document.activeElement.shadowRoot.activeElement`

Or if there are multiple levels of shadow DOM at play:

```js
function deepActiveElement() {
  let a = document.activeElement;
  while (a && a.shadowRoot && a.shadowRoot.activeElement) {
    a = a.shadowRoot.activeElement;
  }
  return a;
}
```

`delegatesFocus: true`

- This expands the focus behavior of element's within a shadow tree. How?

  - If you click a node inside shadow DOM and the node is not a focusable area, the first focusable area becomes focused.
  - When a node inside shadow DOM gains focus, `:focus` applies to the host in addition to the focused element.

- Ex.

```html
<style>
  :focus {
    outline: 2px solid red;
  }
</style>

<x-focus></x-focus>

<script>
  customElements.define(
    'x-focus',
    class extends HTMLElement {
      constructor() {
        super();

        const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
        root.innerHTML = `
      <style>
        :host {
          display: flex;
          border: 1px dotted black;
          padding: 16px;
        }
        :focus {
          outline: 2px solid blue;
        }
      </style>
      <div>Clickable Shadow DOM text</div>
      <input type="text" placeholder="Input inside shadow dom">`;

        // Know the focused element inside shadow DOM:
        this.addEventListener('focus', function(e) {
          console.log(
            'Active element (inside shadow dom):',
            this.shadowRoot.activeElement
          );
        });
      }
    }
  );
</script>
```

- Notice that the shadow DOM gets this other option.

### Tips and Tricks

#### Use CSS containment

Basically, tell the browser that the styling should be contained.

```html
<style>
  :host {
    display: block;
    contain: content; /* Boom. CSS containment FTW. */
  }
</style>
```

#### Resetting inheritable styles

Inheritable styles, ie. `background`, `color`, `font`, `line-height`, etc. are inherited in the shadow DOM.

To start with a fresh slate use `all: initial;`

#### Finding all the custom elements used by a page

```js
const allCustomElements = [];

function isCustomElement(el) {
  const isAttr = el.getAttribute('is');
  // Check for <super-button> and <button is="super-button">.
  return el.localName.includes('-') || (isAttr && isAttr.includes('-'));
}

function findAllCustomElements(nodes) {
  for (let i = 0, el; (el = nodes[i]); ++i) {
    if (isCustomElement(el)) {
      allCustomElements.push(el);
    }
    // If the element has shadow DOM, dig deeper.
    if (el.shadowRoot) {
      findAllCustomElements(el.shadowRoot.querySelectorAll('*'));
    }
  }
}

findAllCustomElements(document.querySelectorAll('*'));
```

#### Creating elements from a `<template>`

Instead of using `innerHTML` you can use a declarative `<template>`

### History and browser support

#### Polyfill

```js
function loadScript(src) {
  return new Promise(function(resolve, reject) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Lazy load the polyfill if necessary.
if (!supportsShadowDOMV1) {
  loadScript('/bower_components/shadydom/shadydom.min.js')
    .then(e => loadScript('/bower_components/shadycss/shadycss.min.js'))
    .then(e => {
      // Polyfills loaded.
    });
} else {
  // Native shadow dom v1 support. Go to go!
}
```

## Custom Element Best Practices

### Checklists

#### Shadow DOM

- Create a shadow root to encapsulate styles
- Create your shadow root in the constructor
- Place any children the element creates into its shadow root
- Set a `:host` style (e.g. `block`, `inline-block`, `flex`) unless you prefer the default `inline`.
  - You must do so to be able to set a `width` or `height`.
- Add a `:host` display style that respects the hidden attribute.
  - A custom element with a default display style, e.g. :host { display: block }, will override the lower specificity built-in hidden attribute.
  - Do something like this:
    - `:host([hidden]) { display: none }`

#### Attributes and properties

- Do not override author-set, global attributes.
  - Attributes should be set correctly from the start.
- Always accept primitive data (strings, numbers, booleans) as either attributes or properties.
- Aim to keep primitive data attributes and properties in sync, reflecting from property to attribute, and vice versa.
  - Control state of your attributes
- Aim to only accept rich data (objects, arrays) as properties.
  - I mean, not for all, but for properties that are generally objects or arrays, this makes sense.
- Do not reflect rich data properties to attributes.
- Consider checking for properties that may have been set before the element upgraded.
  - In case a property is set before the element's definition has been loaded.
- Do not self-apply classes.
  - Elements that need to express their state should do so using attributes. Classes is a last resort or for customisation.

#### Events

- Dispatch events in response to internal component activity.
  - At times when properties change in response to activity that only your component knows about.
- Do not dispatch events in response to host setting a property (downward data flow).
  - ?

### Explainers

#### Don't override the page author

Ways to check if there is already an something set:

```js
connectedCallback() {
  if (!this.hasAttribute('role'))
    this.setAttribute('role', 'checkbox');
  if (!this.hasAttribute('tabindex'))
    this.setAttribute('tabindex', 0);
}
```

#### Make properties lazy

In cases where a developer attempts to set a property on the element before it has been loaded.

How to check if any properties have already been set on its instance:

```js
connectedCallback() {
  ...
  this._upgradeProperty('checked');
}

_upgradeProperty(prop) {
  if (this.hasOwnProperty(prop)) {
    let value = this[prop];
    delete this[prop];
    this[prop] = value;
  }
}
```

- It is deleted and set again so the property does not shadow the custom element's own property setter.

#### Avoid reentrancy issues

What is reentrancy?

- When a program can be interrupted in the middle of its execution and then safely be called again (re-entered) before its previous invocation's complete execution.

```js
attributeChangedCallback(name, oldValue, newValue) {
  const hasValue = newValue !== null;
  switch (name) {
    case 'checked':
      /* Note the attributeChangedCallback is only handling the *side effects* of setting the attribute. */
      this.setAttribute('aria-checked', hasValue);
      break;
    ...
  }
}
set checked(value) {
  const isChecked = Boolean(value);
  if (isChecked)
    this.setAttribute('checked', '');
  else
    this.removeAttribute('checked');
}

get checked() {
  return this.hasAttribute('checked');
}
```

## HowTo: Components – Overview

> Our aim is to demonstrate best practices for writing robust components that are accessible, performant, maintainable, and easy to style.

## `<howto-checkbox>`

### Summary

This element represents a boolean option in a form. Don't make a custom checkbox, this is just a proof of concept.

### Example usage

First, the style and the element html:

```html
<style>
  howto-checkbox {
    vertical-align: middle;
  }
  howto-label {
    vertical-align: middle;
    display: inline-block;
    font-weight: bold;
    font-family: sans-serif;
    font-size: 20px;
    margin-left: 8px;
  }
</style>

<howto-checkbox id="join-checkbox"></howto-checkbox>
<howto-label for="join-checkbox">Join Newsletter</howto-label>
```

Then the JS:

```js
// Help with handling keyboard events
const KEYCODE = {
  SPACE: 32
};

// Cloning contents from a `<template>` element
// This is done instead of only `innerHTML` as it decreases HTML parse cost
const template = document.createElement('template');

// Then set the style of the shadow DOM
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      background: url('../images/unchecked-checkbox.svg') no-repeat;
      background-size: contain;
      width: 24px;
      height: 24px;
    }
    :host([hidden]) {
      display: none;
    }
    :host([checked]) {
      background: url('../images/checked-checkbox.svg') no-repeat;
      background-size: contain;
    }
    :host([disabled]) {
      background:
        url('../images/unchecked-checkbox-disabled.svg') no-repeat;
      background-size: contain;
    }
    :host([checked][disabled]) {
      background:
        url('../images/checked-checkbox-disabled.svg') no-repeat;
      background-size: contain;
    }
  </style>`;

// Implementation of elements methods
class HowToCheckbox extends HTMLElement {
  // Set the shadow DOM
  // You should avoid touching any attributes or light DOM children here.
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  // attributeChanged is called when an observed attribute has been added, removed, updated, or replaced.
  static get observedAttributes() {
    return ['checked', 'disabled'];
  }

  // Fired when the element is inserted into the DOM. It's a good place to set the initial role, tabindex, internal state, and install event listeners.
  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'checkbox');
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', 0);
  }
}
```
