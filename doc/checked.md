## data-checked and data-selected

`data-checked` and `data-selected` could be easily used with checkbox(es) and select options.

Assume your model has a boolean attribute named `active`, with the binding element:

``` html
<input type="checkbox" name="active" data-checked="active" />
```

The element would be checked when the value is true, and not checked when it's false.

You can omit the `data-check` value if it's the same as name of checkbox, for the above example, it's equal to

``` html
<input type="checkbox" name="active" data-checked />
```

For multiply checkboxes, you should have an array which hold all the checked values, eg:

``` js
var user = new User({
  pets: ['pig', 'dog']
})
```
To have the pets checked, write html like:

``` html
<input name="pets" type="checkbox" value="pig" data-checked>pig
<input name="pets" type="checkbox" value="dog" data-checked>dog
<input name="pets" type="checkbox" value="cat" data-checked>cat
<input name="pets" type="checkbox" value="monkey" data-checked>monkey
```

Reactive would check whether the value of checkbox is in pets array, and set checked attribute accordingly.

One thing should be noticed is reactive would not be noticed when the array itself changed, you may have to emit change event
every time array changed by hand, like:

``` js
user.emit('change pets')
```

`data-selected` works the same way as `data-checked`, you can make use of both single/multiply select easily.


  *Next: [Reuse config](./config.html)*
