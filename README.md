# Tilla

[![Coverage Status](https://coveralls.io/repos/github/TillaTheHun0/tilla/badge.svg?branch=development)](https://coveralls.io/github/TillaTheHun0/tilla?branch=development) [![Build Status](https://travis-ci.org/TillaTheHun0/tilla.svg?branch=development)](https://travis-ci.org/TillaTheHun0/tilla?branch=development) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![npm version](https://img.shields.io/npm/v/tilla.svg)](https://www.npmjs.com/package/tilla) [![License](https://img.shields.io/npm/l/tilla.svg?maxAge=2592000?style=plastic)](https://github.com/TillaTheHun0/tilla/blob/master/LICENSE) [![Greenkeeper badge](https://badges.greenkeeper.io/TillaTheHun0/tilla.svg)](https://greenkeeper.io/) [![Document](https://doc.esdoc.org/github.com/TillaTheHun0/tilla/badge.svg)](https://doc.esdoc.org/github.com/TillaTheHun0/tilla/)


Tilla transforms objects, based on the rules you specify. It has a fluid, composable API, and non-blocking transformations. It also comes
packaged with sensible default permission levels, and a registry to keep track of all of your Transformers that can easily be tied into other parts of your app.

## Table of Contents
- [Installation](#installation)
- [Documentation](#docs)
- [Features](#features)
- [Usage](#usage)
- [Contribute](#Contribute)
- [License](#License)
- [Whats The Name Mean?](#Name)

## Installation

```bash
$ npm install --save tilla
```

## Docs

[Documentation Here](https://doc.esdoc.org/github.com/TillaTheHun0/tilla/)

## Goals
I wanted to have a fluid, easy to read, chainable API to build Transformers with sensible defaults. I wanted permissions to be incorporated in the Transformer API itself and allow the user to provide their own domain specific permissions and permission ranking that would cascade down to sub-transformations. All transformations should be completely asynchronous, down to the field level. Looking at the Transformer code should give an idea as to the shape of the resultant object produced by that Transformer. It should also be easy to transform fields on an object using other Transformers, in other words Sub-transformations, and these would be lazy loaded at runtime.

## Features

- Chainable, fluid Transformer API
- Asynchronous transformations at the field level
- Built-in Transformer registry
- Field Permission-Masking
- Cascading permissions (for sub-transformations)

## Usage

```javascript

import { fieldDelegate, Transformer, PermissionLvl } from 'tilla'

const fd = fieldDelegate() // use the built permission levels

const addressTransformer = new Transformer({
  street: fd('street').always().passthrough(),
  city: fd('city').always().passthrough(),
  state: fd('state').always().passthrough()
  otherThing: fd('otherThing').atOrAbovePrivate()
})

const personTransformer = new Transformer({
  // always directly map src.firstName -> dest.firstName
  firstName: fd('firstName').always().passthrough(),
  // computed field using a custom builder
  name: fd().always().buildWith(src => `${src.firstName} ${src.lastName}`),
  // multiple mapping strategies, based on permission
  age: fd('age').whenPrivate().passthrough().whenPublic().buildWith((src, key) => src[key] - 10)
  // Use another Transformer to map the field
  address: fd().always().subTransform(addressTransformer),
  // only mapped if permission level is >=PRIVATE
  ssn: fd().atOrAbovePrivate().passthrough()
  // only mapped if permission level === PRIVATE
  phoneNumber: fd().restrictToPrivate().passthrough()
})

let person = {
  age: 32,
  firstName: 'John',
  lastName: 'Doe',
  height: 60,
  address: {
    state: 'IL'
  }
  ssn: '123-45-6789',
  phoneNumber: '867-5309'
}

// Transformers.transform() always returns a Promise
personTransformer.transform(PermissionLvl.PUBLIC, person).then((personDto) => {
  /*
  {
    firstName: 'John'
    age: 22,
    name: 'John Doe'
    address: {
      state: 'IL'
    }
  }
  */
})

```

Tilla is used to transform objects. It's great for building DTOs and controlling access to certain fields on those DTOs. The core of Tilla are `Transformers` and `FieldDelegates`. `Transformers` describe the shape of the result object while `FieldDelegates` tell the transformer _how_ to map each field.

You can think of a `Transformer` as a collection of key'd `FieldDelegates`. Call `transform()`
on a `Transformer` and provide the permission lvl and object to transform. This will return a `Promise` that will resolve with the transformed object.

`passthrough()` simply returns the value off of the source object with no altering. `buildWith()` accepts a
custom builder function that is called to transform the field. The `builder` function is passed `src`, `key`, and `isList`,
`src` being the source object, `key` being the key on the src object, if provided, and `isList` indicating whether the key on the src contains a list of items. 

`isList` is used under the hood for transforming lists of objects using another `Transformer`, called `SubTransformers`, but you can also use it for your own use case.

### Field Masking & Permissions

By default `Tilla` ships with 4 permission levels: `PUBLIC`, `PRIVILEGED`, `PRIVATE`, and `ADMIN` and the ranking of these fields, from least sensitive to most sensitive is [`PUBLIC`, `PRIVILEGED`, `PRIVATE`, `ADMIN`]

`FieldMapperDelegate`s can set multiple masking levels for each field, based on permissions, and their chainable API makes it easy to set up complex mappings for each field on a `Transformer`. In the example above, `always()` was used for each field, which indicates a single builder for all permission levels -- "'Always' use this method to transform the value provided". We can specify multiple methods like so:

```javascript

import { fieldDelegate, Transformer, PermissionLvl } from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let oldPersonTransformer = new Transformer({
  // different transformations for PUBLIC and PRIVATE permission levels.
  age: fd('age').whenPrivate().passthrough().whenPublic().buildWith((src, key) => {
    let age = src[key]
    return age ? age - 10 : null
  }),
  name: fd().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  // only transformations at PRIVATE and above permission lvls will have this field
  ssn: fd('ssn').atOrAbovePrivate().passthrough()
})

```

You can specify your own permission ranking and `Tilla` will build that `permission` API on the `FieldDelegate` instance. For example, you could specify a ranking of [`USER`, `EMPLOYEE`, `MANAGER`] and `Tilla` will add API's `whenUser()`, `atOrAboveUser()`, `restrictToUser()`, `whenEmployee()`, `atOrAboveEmployee()`, `restrictToEmployee()`, `whenManager()`, `atOrAboveManager()`, `restrictToManager()`. Specify a ranking like so:

```javascript

import { fieldDelegate, Transformer, PermissionLvl } from 'tilla'

let ranking = ['USER', 'EMPLOYEE', 'MANAGER']

const fd = fieldDelegate(ranking) // pass your ranking to the util wrapper

let oldPersonTransformer = new Transformer({
  // different transformations for PUBLIC and PRIVATE permission levels.
  age: fd('age').whenEmployee().passthrough().whenUser().buildWith((src, key) => {
    let age = src[key]
    return age ? age - 10 : null
  }),
  name: fd().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  // only transformations at PRIVATE and above permission lvls will have this field
  ssn: fd('ssn').atOrAboveManager().passthrough()
})

```

### Can I Use a Transformer to Map a field?

Yes! This is called a 'subTransform'. You may want to do this for an eagerly loaded association. For example, a `Person` may have an eagerly loaded `Address`. With `Tilla` you can specify each of these `Transformer`s and then specify a `SubTransformation` in the `Person` `Transformer` for the key, `address`. You can specify a string which will 
search the built in Transformer registry, a `Transformer`, or a function that returns a Promise that resolves to a `Transformer`.

```javascript

import { fieldDelegate, Transformer, PermissionLvl } from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let addressTransformer = new Transformer({
  street: fd('street').always().passthrough(),
  city: fd('city').always().passthrough(),
  state: fd('state').always().passthrough()
  otherThing: fd('otherThing').atOrAbovePrivate()
})

let personTransformer = new Transformer({
  age: fd('age').always().passthrough(),
  /*...*/
  // Subtransform from the registry
  address: fd('address').always().subTransform('address')
  // OR directly provide the transformer
  address: fd('address').always().subTransform(addressTransformer)
  // OR
  address: fd('address').always().subTransform(() => Promise.resolve(addressTransformer))
})

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

personTransformer.transform(PermissionLvl.PUBLIC, person).then((publicPersonDto) => { // public permission lvl
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

personTransformer.transform(PermissionLvl.PRIVATE, person).then((privatePersonDto) => { // private permission lvl
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

`Transformer` has another constructor that accepts a string, the registry string, and an object, the field mapping. This will automatically add that `Transformer` instance to the internal registry at the key. However, you can also use your own registry system separate from `tilla`

All the permission APIs work the same with `SubTransform`. *The permissions for the parent propogate down to the `SubTransformation`*, be default. This is the default behavior. To override this, you can specify a permission lvl to use for the SubTransformation when defining the transformer.

```javascript

import { fieldDelegate, Transformer, PermissionLvl } from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let addressTransformer = new Transformer({
  street: fd('street').always().passthrough(),
  city: fd('city').always().passthrough(),
  state: fd('state').always().passthrough()
  otherThing: fd('otherThing').atOrAbovePrivate()
})

let personTransformer = new Transformer({
  age: fd('age').always().passthrough(),
  /*...*/
  // transform with PUBLIC permission lvl, regardless of the parents permission lvl
  address: fd('address').always().subTransform(addressTransformer, PermissionLvl.PUBLIC)
})

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

// public permission lvl
personTransformer.transform(PermissionLvl.PUBLIC, person).then((publicPersonDto) => {
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

// private permission lvl
personTransformer.transform(PermissionLvl.PRIVATE, person).then((privatePersonDto) => {
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
})

```

### Can a Transformer be used to transform a list of object?

Yes! It is common to have a list of objects to transform using a specified Transformer. For example, a `Person` could have multiple `Car`s that are eagerly loaded. To specify a list of objects to transform with a common `Transformer`, simply call `asList()` on the `FieldDelegate`.

``` javascript

import { fieldDelegate, Transformer, PermissionLvl } from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let personTransformer = new Transformer({
  age: fd('age').always().passthrough(),
  /*...*/
  // will transform each object in the list with the Transformer registerd at 'car' in the registry
  cars: fd('cars').always().subTransform('car').asList()
})

```

### Can I specify a default for a set of fields?

Yes! `Transformers` have a method `byDefault()` that will accept an Array of string attributes. You can then specify how all of those attributes will be transformed. A common case is just mark all those fields as `passthrough`.

```javascript

import { fieldDelegate, Transformer, PermissionLvl } from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let personTransformer = new Transformer({
  // Special transformation cases here
  name: fd().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  city: fd('homeCity').always().passthrough()
  state: fd('address').always().buildWith((src, key) => {
    let address = src[key]
    return address ? address.state : address
  })
  // .BUILD_WITH() can also be used and follows the same builder API as customer field builders
}).byDefault(['age', 'height']).PASSTHROUGH()

```

### Can I build a Transformer based off of another?

Yes! You can extend an exisiting `Transformer` by calling `extend()` and passing a map just like you would a normal `Transformer`. This will merge the two mappings and return a new `Transformer` instance.

``` javascript

import { fieldDelegate, Transformer, PermissionLvl } from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let personTransformer = new Transformer({
  // Special transformation cases here
  name: fd().always().buildWith((src) => {
    return `${src.firstName} ${src.lastName}`
  }),
  city: fd('homeCity').always().passthrough()
  state: fd('address').always().buildWith((src, key) => {
    let address = src[key]
    return address ? address.state : address
  })
}).byDefault(['age', 'height']).PASSTHROUGH()

// childTransformer will have all attributes of personTransformer, add a favoriteToy fieldDelegate, and override the name transformer
let childTransformer = personTransformer.extend({
  favoriteToy: fd('favoriteToy').always().passthrough()
  name: fd('name').always().buildWith((src) => {
    return `Lil' ${src.firstName}`
  })
})

```

### Transformer Registry

`Tilla` exposes an instantiated instance of the `TransformRegistry`. The `registry` is a great way to manage all of `Transformers` and then pass them around your app as needed. For example, you can easily incorporate in `Express` middleware.

``` javascript

// add some transformers to the registry somewhere
registry.register('person', personTransformer)
registry.register('address', addressTransformer)

import { registry } from 'tilla'

const attachTransformer = (transformerKey) => {
  return (req, res, next) => {
    let transformer = registry.transformer(transformerKey)
    req.transformer = transformer // then use the transformer later on in your route handling
    next()
  }
}

```

## TODO

- Better document API

## Contribute

Submit an issue or a PR

## License
MIT

## Name
I couldn't find any open npm module names that I liked that weren't already taken. As a result, I used a shotened version of my name :p. If you have a better idea, please make a suggestion!

