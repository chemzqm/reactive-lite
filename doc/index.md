### Design Philosophy

  Reactive-lite is aimed to be a simplified reactive functionality only library, with flexible binding styles and speed fast.

  In order to keep reactive simple, it works on opinionated model emitter, your model have to emit `change prop` event on change
  and the event have to be accepted by `on` and removed by `off` method, one example is [component-model](https://www.npmjs.com/package/model-component)

  For more detail of the opinionated model, check out [how it works](./interpolation#how-works)

### Basic Features

  * **Bind model properties**  in three ways, including interpolation with filter(s), data-render and custom binding.

  * **Binding events**  to the delegate Object, get the corresponding `model` and `element` in arguments, see [events](./events.html)

  * **Reusable bindings and filters**  can be defined globally or single instance.

  * **Easily selected/checked**  binding for checkbox(es) and select element, see [checked and selected](./checked.html).

  * **Touch support**  `touchstart` `touchend` and correct [tap-event](https://github.com/chemzqm/tap-event) are supported.

  * **Reusable config**  can make high level component(like list) render extremely fast, [explanation](./config.html)


  *Next: [Use text interpolation](./interpolation.html)*

### Demo

  Here is some [basic demo](./demo.html)
