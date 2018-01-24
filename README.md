# Tilla

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm version](https://img.shields.io/npm/v/tilla.svg)](https://www.npmjs.com/package/tilla)

Tilla is an asynchronous object transformation library. It has a fluid API, highly composable, promised based transformations, sub-transformations and supports permission masking at the object field level. It also provides a registry to register all transformers

## Table of Contents
- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [TODO](#TODO)
- [Contribute](#Contribute)
- [License](#License)
- [Whats The Name Mean?](#Name)

## Installation

```bash
$ npm install --save tilla
```

Tilla follows [SEMVER](http://semver.org). Supports Node v4 and above to use ES6 features.

## Features

- Chainable, fluid transformation API
- Asynchronous transformation at the field & object level (Parallel much?)
- Transformer registry
- Field Permission Masking
- Cascading permissions (for sub-transformations)

## Usage

Tilla is used to transform objects. It's great for building DTOs and additionally for controlling access to certain fields on those DTOs, for instance based on permissions. The core of Tilla are `Transformers` and `FieldDelegates`. `Transformers` specify the structure of the result object from some source object and `FieldDelegates` tell the transformer _how_ to transform each field from the source object.

You can think of a `Transformer` as a collection of `FieldDelegates` that are used to transform the object. Call `transform()`
on a `Transformer` and provide the permission lvl and object to transform. This will return a `Promise` that will resolve with the transformed object

```javascript

// ES6 Modules
import { Transformer } from 'tilla'
// Or
let { Transformer, FieldMapperDelegate, FieldPermissionLvl } = require('tilla')

let personTransformer = new Transformer({
  age: new FieldMapperDelegate('age').always().passthrough(),
  name: new FieldMapperDelegate().always().buildWith((src) => { // use a custom builder. 
    return `${src.firstName} ${src.lastName}`
  }),
  height: new FieldMapperDelegate('height').always().passthrough(),
  city: new FieldMapperDelegate('homeCity').always().passthrough() // map a field from src to a different key
  state: new FieldMapperDelegate('address').always().buildWith((src, key) => { // grab value off of a source field
    let address = src[key]
    return address ? address.state : address
  })
})

let person = {
  age: 22,
  firstName: 'John',
  lastName: 'Doe',
  height: 60,
  homeCity: 'Chicago'
  address: {
    state: 'IL'
  }
  ssn: '123-45-6789' // this is sensitive information!
}

personTransformer.transform(FieldPermissionLvl.PUBLIC, person).then((personDto) => {
  /*
  {
    age: 22,
    name: 'John Doe'
    height: 60,
    city: 'Chicago',
    state: 'IL'
  }
  */
})

```

`Tilla` also ships with a utility instance to slightly reduce verboseness

```javascript
let { Transformer, Utils: fieldDelegate } = require('tilla')

let personTransformer = new Transformer({
  age: fieldDelegate('age').always().passthrough(),
  name: fieldDelegate().always().buildWith((src) => { // this is not derived from a single field
    return `${src.firstName} ${src.lastName}`
  }),
  ...
})
```

`passthrough()` simply returns the value off of the source object with no altering. `buildWith()` accepts a
custom builder function that is called to transform the field. The `builder` function is passed `src`, `key`, and `isList`,
`src` being the source object, `key` being the key on the src object, if provided, and `isList` indicating whether the key on the src contains a list of items. 

`isList` is used under the hood for transforming lists of objects using another `Transformer`, called `SubTransformers`, but you can also use it for your own use case.

### Field Masking & Permissions

By default `Tilla` ships with 4 permission levels: `PUBLIC`, `PRIVILEGED`, `PRIVATE`, and `ADMIN` and the ranking of these fields, from least sensitive to most sensitive is [`PUBLIC`, `PRIVILEGED`, `PRIVATE`, `ADMIN`]

`FieldMapperDelegate`s can set multiple masking levels for each field, based on `permissions` and their chainable API makes it easy to set up complex mappings for each field on a `Transformer`. In the example above, `always()` was used for each field, which indicates a single builder for any kind of transformation and all permission levels -- "'Always' use this method to transform the value provided". We can specify multiple methods like so:

```javascript

let { Transformer, Utils: fieldDelegate } = require('tilla')

let oldPersonTransformer = new Transformer({
  age: fieldDelegate('age').whenPrivate().passthrough().whenPublic().buildWith((src, key) => { // different transformations for PUBLIC and PRIVATE permission levels.
    let age = src[key]
    return age ? age - 10 : null
  }),
  name: fieldDelegate().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  ssn: fieldDelegate('ssn').restrictToPrivate().passthrough() // only transformations at PRIVATE and above permission lvls will have this field
})

```

You can specify your own permission ranking and `Tilla` will dynamically rebuild the `permission` API on `FieldDelegate` instances. For example, you could specify a ranking of [`USER`, `EMPLOYEE`, `MANAGER`] and `Tilla` will add API's `whenUser()`, `restrictToUser()`, `whenEmployee()`, `restrictToEmployee()`, `whenManager()` and `restrictToManager()`. Specify a ranking like so:

```javascript

let { Transformer, setPermissionRanking } = require('tilla')

let ranking = ['USER', 'EMPLOYEE', 'MANAGER']

setPermissionRanking(ranking) // Will set rankings and rebuild permission API on all FieldDelegates

let oldPersonTransformer = new Transformer({
  age: fieldDelegate('age').whenEmployee().passthrough().whenUser().buildWith((src, key) => { // different transformations for PUBLIC and PRIVATE permission levels.
    let age = src[key]
    return age ? age - 10 : null
  }),
  name: fieldDelegate().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  ssn: fieldDelegate('ssn').restrictToManager().passthrough() // only transformations at PRIVATE and above permission lvls will have this field
})

```

NOTE: If you choose to use your own permission ranking, do it before creating any `FieldDelegates`, since the old API will be removed from the `prototype` of the class and the new ranking api will be dynamcially added to the `prototype`.

### SubTransformations

It's a common use case to want to use another `Transformer` for some key on a source object being transformed, especially with eargerly loaded associations. Basically to use a `Transformer` as a field builder. For example, a `Person` may have an eagerly loaded `Address`. With `Tilla` you can specify each of these `Transformer`'s and then specify a `SubTransformation` in the `Person` `Transformer` for the key, `address`. To do this you must add the `Transformer` being used to subtransform to the `registry` provided by `Tilla`.

```javascript

let { Transformer, Utils: fieldDelegate, registry, FieldPermissionLvl } = require('tilla')

let personTransformer = new Transformer({
  age: fieldDelegate('age').always().passthrough(),
  name: fieldDelegate().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  ssn: fieldDelegate('ssn').restrictToPrivate().passthrough(), // only transformations at PRIVATE and above permission lvls will have this field
  address: fieldDelegate('address').always().subTransform('address')
})

let addressTransformer = new Transformer({
  street: fieldDelegate('street').always().passthrough(),
  city: fieldDelegate('city').always().passthrough(),
  state: fieldDelegate('state').always().passthrough()
  otherThing: fieldDelegate('otherThing').restrictToPrivate()
})

registry.register('person', personTransformer)
registry.register('address', addressTransformer)

let person = {
  age: 22,
  firstName: 'John',
  lastName: 'Doe',
  ssn: '123-45-6789',
  address: {
    street: '123 Street',
    city: 'Chicago',
    state: 'IL',
    otherThing: 'other'
  }
}

personTransformer.transform(FieldPermissionLvl.PUBLIC, person).then((publicPersonDto) => { // public permission lvl
  /*
  {
    age: 22,
    name: 'John Doe',
    address: {
      street: '123 Street',
      city: 'Chicago',
      state: 'IL'
    }
  }
  */
})

personTransformer.transform(FieldPermissionLvl.PRIVATE, person).then((privatePersonDto) => { // private permission lvl
  /*
  {
    age: 22,
    name: 'John Doe',
    ssn: '123-45-6789',
    address: {
      street: '123 Street',
      city: 'Chicago',
      state: 'IL'
      otherThing: 'other'
    }
  }
  */
})

```

All the permission APIs work the same with `SubTransforms`. This means that you can choose to transform the field differenty for each position lvl. Notice that the *permissions for the parent propogated down to the `SubTransformation`*. This is the default behavior. To override this, you can specify a permission lvl to use for the `SubTransformation` when defining the transformer.

```javascript

let { Transformer, Utils: fieldDelegate, registry, FieldPermissionLvl } = require('tilla')

let personTransformer = new Transformer({
  age: fieldDelegate('age').always().passthrough(),
  name: fieldDelegate().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  ssn: fieldDelegate('ssn').restrictToPrivate().passthrough(),
  address: fieldDelegate('address').always().subTransform('address', FieldPermissionLvl.PUBLIC) // transform with PUBLIC permission lvl, regardless of the parents permission lvl
})

let addressTransformer = new Transformer({
  street: fieldDelegate('street').always().passthrough(),
  city: fieldDelegate('city').always().passthrough(),
  state: fieldDelegate('state').always().passthrough()
  otherThing: fieldDelegate('otherThing').restrictToPrivate()
})

registry.register('person', personTransformer)
registry.register('address', addressTransformer)

let person = {
  age: 22,
  firstName: 'John',
  lastName: 'Doe',
  ssn: '123-45-6789',
  address: {
    street: '123 Street',
    city: 'Chicago',
    state: 'IL',
    otherThing: 'other'
  }
}

personTransformer.transform(FieldPermissionLvl.PUBLIC, person).then((publicPersonDto) => { // public permission lvl
  /*
  {
    age: 22,
    name: 'John Doe',
    address: {
      street: '123 Street',
      city: 'Chicago',
      state: 'IL'
    }
  }
  */
})


personTransformer.transform(FieldPermissionLvl.PRIVATE, person).then((privatePersonDto) => {
  /*
  {
    age: 22,
    name: 'John Doe',
    ssn: '123-45-6789',
    address: {
      street: '123 Street',
      city: 'Chicago',
      state: 'IL'
      // Still no otherThing value because address was transformed using the PUBLIC permission lvl
    }
  }
  */
}) // private permission lvl

```

### Handling Lists

It is common to have a list of common objects to transform. For example, a `Person` could have multiple `Car`s that are eagerly loaded. To specify a list of objects to transform with a common `Transformer`, simply call `asList()` on the `FieldDelegate`.

``` javascript

let personTransformer = new Transformer({
  age: fieldDelegate('age').always().passthrough(),
  name: fieldDelegate().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  ssn: fieldDelegate('ssn').restrictToPrivate().passthrough(),
  address: fieldDelegate('address').always().subTransform('address', FieldPermissionLvl.PUBLIC),
  cars: fieldDelegate('cars').always().subTransform('car').asList() // will transform each object in the list with the Transformer registerd at 'car' in the registry
})

```

### By Default

A common use case is to transform only certain fields and then treat all other fields the same. `Transformers` have a method `byDefault()` that will accept an Array of attributes. You can then specify how all of those attributes will be transformed. A common case is just mark all those fields as `passthrough`.

```javascript

let { Transformer } = require('tilla')

let personTransformer = new Transformer({
  // Special transformation cases here
  name: new FieldMapperDelegate().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  city: new FieldMapperDelegate('homeCity').always().passthrough()
  state: new FieldMapperDelegate('address').always().buildWith((src, key) => {
    let address = src[key]
    return address ? address.state : address
  })
}).byDefault(['age', 'height']).PASSTHROUGH() // .BUILD_WITH() can also be used and follows the same builder API as customer field builders

```

### Extend A Transformer

A common case is to have different objects with similar transformations. You can extend an exisiting `Transformer` by calling `transformer.extend()` and passing a map just like you would a normal `Transformer`. This will merge the two mappings and return a new `Transformer` instance.

``` javascript

let { Transformer } = require('tilla')

let personTransformer = new Transformer({
  // Special transformation cases here
  name: new FieldMapperDelegate().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  city: new FieldMapperDelegate('homeCity').always().passthrough()
  state: new FieldMapperDelegate('address').always().buildWith((src, key) => {
    let address = src[key]
    return address ? address.state : address
  })
}).byDefault(['age', 'height']).PASSTHROUGH()

let childTransformer = personTransformer.extend({
  favoriteToy: fieldDelegate('favoriteToy').always().passthrough()
  name: fieldDelegate('name').always().buildWith((src) => {
    return `Lil' ${src.firstName}`
  })
}) // childTransformer will have all attributes of personTransformer, add a favoriteToy fieldDelegate, and override the name transformer

```


### Registry

As mentioned earlier, `Tilla` comes with an instantiated instance of the `TransformRegistry`. The `registry` is a great way to manage all of `Transformers` and then pass them around your app as needed. For example, you can easily incorporate in `Express` middleware.

``` javascript

{ registry } = require('tilla')

let attachTransformer = (transformerKey) => {
  return (req, res, next) => {
    let transformer = registry.transformer(transformerKey)
    req.transformer = transformer // then use the transformer later on in your route handling
    next()
  }
}

```

## TODO

- API Documentation
- Tests
- Make registry agnostic, so user can leverage any registry paradigm they'd like
- Don't require SubTransformations to use the Tilla registry

## Contribute

Submit an issue or a PR

## License
MIT

## Name
I couldn't find any open npm module names that I liked that weren't already taken. As a result, I used a shotened version of my name :p. If you have a better idea, please make a suggestion!

