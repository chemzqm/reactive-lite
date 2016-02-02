### 0.5.5

* add reprecated tag global static functions

### 0.5.4

* use unbindEvents to remove exist binding events

### 0.5.2

* move tap-event to depDependencies

### 0.5.1
* throw error when model not defined

### 0.5.0
* remove tap event, use [component-tap-event](https://github.com/chemzqm/tap-event) to convert function if needed

### 0.4.5
* remove unused function

### 0.4.4
* add bind method for bind another model
* internal refactor

### 0.4.3
* Remove check model function
* Remove check for filter args

### 0.4.2
* Improve remove method, allow called more than once
* check if element removed on remove

### 0.4.1
* fix doc

### 0.4.0
* improve filter currency, change default precision to 2

### 0.3.5
* add model-component ad peerDependency

### 0.3.4
* allow `\n` and `"` in interpolation
* add `data-skip` for exclude parsing for specific element

### 0.3.3
* allow custom binding names starts not with `data-`
* fix interpolation not works with `\n` charactor

### 0.3.2
* add `touchstart` `touchend` support
* code refactor
* support null on as filter argument

### 0.3.1
* not bind the bindings which not exist on model (by prop in model check)
* refactor generateConfig api same as reactive constructor
* allow filter with arguments

### 0.3.0
* remove `data-format`, use filter instead
* add filter support
* remove `render` and `event handler` support from model

### 0.2.3
* add support for bindings reuse
