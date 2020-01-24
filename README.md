# Tilla

## This is Version 2 Docs

If you're looking for version 1 docs. Check out the [v1](https://github.com/TillaTheHun0/tilla/tree/v1) branch

[![Coverage Status](https://coveralls.io/repos/github/TillaTheHun0/tilla/badge.svg?branch=development)](https://coveralls.io/github/TillaTheHun0/tilla?branch=development) [![Build Status](https://travis-ci.org/TillaTheHun0/tilla.svg?branch=development)](https://travis-ci.org/TillaTheHun0/tilla?branch=development) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![TypeScript](https://camo.githubusercontent.com/21132e0838961fbecb75077042aa9b15bc0bf6f9/68747470733a2f2f62616467656e2e6e65742f62616467652f4275696c74253230576974682f547970655363726970742f626c7565)](https://www.typescriptlang.org/) [![npm version](https://img.shields.io/npm/v/tilla.svg)](https://www.npmjs.com/package/tilla) [![License](https://img.shields.io/npm/l/tilla.svg?maxAge=2592000?style=plastic)](https://github.com/TillaTheHun0/tilla/blob/master/LICENSE) [![Greenkeeper badge](https://badges.greenkeeper.io/TillaTheHun0/tilla.svg)](https://greenkeeper.io/)


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

import {
  fieldDelegate, Transformer, Permissions,
  always, atOrAbove, passthrough, buildWith, subTransform
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

const addressTransformer = new Transformer({
  street: fd('street', always(passthrough())),
  city: fd('city', always(passthrough())),
  state: fd('state', always(passthrough()))
  otherThing: fd('otherThing', atOrAbove(Permissions.PRIVATE, passthrough()))
})

const personTransformer = new Transformer({
  // always directly map src.firstName -> dest.firstName
  firstName: fd('firstName',
    always(passthrough())
  ),
  // computed field using a custom builder
  name: fd(always(
    buildWith(src => `${src.firstName} ${src.lastName}`
  )),
  // multiple mapping strategies, based on permission
  age: fd('age',
    when(Permissions.PRIVATE, passthrough()),
    when(Permissions.PUBLIC, buildWith(
      (src, key) => src[key] - 10
    ))
  ),
  // Use another Transformer to map the field
  address: fd('address', always(
    subTransform(addressTransformer)
  ),
  // only mapped if permission level is >=PRIVATE
  ssn: fd('ssn', atOrAbove(Permission.PRIVATE, passthrough())),
  // only mapped if permission level === PRIVATE
  phoneNumber: fd('phoneNumber', restrictTo(Permissions.PRIVATE, passthrough()))
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
personTransformer.transform(Permissions.PUBLIC, person).then((personDto) => {
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

Tilla is used to transform objects. It's great for building DTOs and controlling access to certain fields on those DTOs. The core of Tilla is `Transformers`, `Rules`, and `FieldMappers`. `Transformers` describe the shape of the result object, `Rules` tell the `Transformer` _when_ to map each field, and `FieldMappers` tell the `Rule` _how_ to map each field.

**`FieldMappers` are grouped into `Rules` which are grouped together in a `FieldMapperDelegate` which are further grouped together in a `Transformer`.**

```bash
Transformer {
  [
    fieldMapperDelegate(
      [
        rule(fieldMapper?)
      ]
    )
  ]
}
```

Call `transform()` on a `Transformer` and provide the permission lvl and object to transform. This will return a `Promise` that will resolve with the transformed object.

### Field Masking & Permissions

By default `Tilla` ships with 4 permission levels: `PUBLIC`, `PRIVILEGED`, `PRIVATE`, and `ADMIN` and the ranking of these fields, from least sensitive to most sensitive is [`PUBLIC`, `PRIVILEGED`, `PRIVATE`, `ADMIN`]

`FieldMapperDelegate`s can set multiple masking levels for each field, based on permissions, and their chainable API makes it easy to set up complex mappings for each field on a `Transformer`. In the example above, `always()` was used for each field, which indicates a single builder for all permission levels -- "'Always' use this method to transform the value provided". We can specify multiple methods like so:

```javascript

import {
  fieldDelegate, Transformer, Permissions,
  when, atOrAbove, passthrough, buildWith
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let oldPersonTransformer = new Transformer({
  // different transformations for PUBLIC and PRIVATE permission levels.
  age: fd('age',
    when(Permissions.PRIVATE, passthrough())
    when(Perissions.PUBLIC, buildWith(
      (src, key) => {
        let age = src[key]
        return age ? age - 10 : null
      }
    ))
  ),
  name: fd(always(buildWith(
    src => `${src.firstName} ${src.lastName}`
  ))),
  // only transformations at PRIVATE and above permission lvls will have this field
  ssn: fd('ssn', atOrAbove(Permissions.PRIVATE, passthrough()))
})

```

You can specify your own permission ranking, when instantiating the `fieldDelegate`. and `Tilla` will ensure that ranking is enforced throughout the entire `FieldDelegate` chain.

```javascript

import {
  fieldDelegate, Transformer, Permissions,
  when, atOrAbove, passthrough, buildWith
} from 'tilla'

let ranking = ['USER', 'EMPLOYEE', 'MANAGER']

const fd = fieldDelegate(ranking) // pass your ranking to the util wrapper

let oldPersonTransformer = new Transformer({
  // different transformations for PUBLIC and PRIVATE permission levels.
  age: fd('age',
    when('EMPLOYEE', passthrough()),
    when('USER', buildWith(
      (src, key) => {
        let age = src[key]
        return age ? age - 10 : null
      }
    ))
  ),
  name: fd(always(buildWith(
    src => `${src.firstName} ${src.lastName}`
  ))),
  // only transformations at PRIVATE and above permission lvls will have this field
  ssn: fd('ssn', atOrAbove('MANAGER', passthrough())),
  // Will throw an ERROR because this permission lvl does not exist in the provided ranking
  broken: fd('broken', atOrAbove('BOGUS_LEVEL', passthrough()))
})

```

### Can I Use a Transformer to Map a field?

Yes! This is called a 'subTransform'. You may want to do this for an attached association. For example, a `Person` may have an eagerly loaded `Address`. With `Tilla` you can specify each of these `Transformer`s and then specify a `SubTransformation` in the `Person` `Transformer` for the key, `address`. You can specify a string which will
search the built in Transformer registry, a `Transformer`, or a function that returns a Promise that resolves to a `Transformer`.

```javascript

import {
  fieldDelegate, Transformer, Permissions,
  always, atOrAbove, passthrough, subTransform
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let addressTransformer = new Transformer({
  street: fd('street', always(passthrough())),
  city: fd('city', always(passthrough())),
  state: fd('state', always(passthrough())),
  otherThing: fd('otherThing', atOrAbove(Permissions.PRIVATE, passthrough()))
})

let personTransformer = new Transformer({
  age: fd('age', always(passthrough())),
  /*...*/
  // Subtransform from the registry
  address: fd('address', always(subTransform('address')))
  // OR directly provide the transformer
  address: fd('address', always(subTransform(addressTransformer)))
  // OR a Thunk that returns a Transformer
  address: fd('address', always(subTransform(async () => addressTransformer)))
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

personTransformer.transform(Permissions.PUBLIC, person).then((publicPersonDto) => { // public permission lvl
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

personTransformer.transform(Permissions.PRIVATE, person).then((privatePersonDto) => { // private permission lvl
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

`Transformer` has another constructor that accepts a string, the registry string, and an object, the field mapping. This will automatically add that `Transformer` instance to the internal registry at the key. However, you can also use your own registry system separate from `tilla`.

All the permission APIs work the same with `SubTransform`. **The permission provided to the parent propogates down to the `subTransform`**. This is the default behavior. To override this, you can specify a permission lvl to use for the SubTransformation when defining the transformer.

```javascript

import {
  fieldDelegate, Transformer, Permissions,
  always, atOrAbove, passthrough, subTransform
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let addressTransformer = new Transformer({
  street: fd('street', always(passthrough())),
  city: fd('city', always(passthrough())),
  state: fd('state', always(passthrough())),
  otherThing: fd('otherThing', atOrAbove(Permissions.PRIVATE, passthrough()))
})

let personTransformer = new Transformer({
  age: fd('age', always(passthrough())),
  /*...*/
  // transform with PUBLIC permission lvl, regardless of the parents permission lvl
  address: fd('address', always(subTransform(addressTransformer, Permissions.PUBLIC)))
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
personTransformer.transform(Permissions.PUBLIC, person).then((publicPersonDto) => {
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
personTransformer.transform(Permissions.PRIVATE, person).then((privatePersonDto) => {
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

Yes! It is common to have a list of objects to transform using a specified Transformer. For example, a `Person` could have multiple `Car`s that are eagerly loaded. To specify a list of objects to transform with a common `Transformer`, simply add `asList()` Rule on the chain provided to the `FieldMapperDelegate`.

``` javascript

import {
  fieldDelegate, Transformer, Permissions,
  always, passthrough, subTransform, asList
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let personTransformer = new Transformer({
  age: fd('age', always(passthrough())),
  /*...*/
  // will transform each object in the list with the Transformer registerd at 'car' in the registry
  cars: fd('cars', always(
    subTransform('car'),
    asList()
  ))
})

```

### Can I specify a default for a set of fields?

Yes! `Transformers` have a method `byDefault()` that will accept an Array of string attributes. You can then specify how all of those attributes will be transformed. A common case is just mark all those fields as `passthrough`.

```javascript

import {
  fieldDelegate, Transformer, Permissions,
  always, passthrough, buildWith
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let personTransformer = new Transformer({
  // Special transformation cases here
  name: fd(always(buildWith(
    src => `${src.firstName} ${src.lastName}`
  ))),
  city: fd('homeCity', always(passthrough())),
  state: fd('address', always(buildWith(
    (src, key) => {
      let address = src[key]
      return address ? address.state : address
    }
  )))
  // .BUILD_WITH() can also be used and follows the same builder API as customer field builders
}).byDefault(['age', 'height']).PASSTHROUGH()

```

### Can I build a Transformer based off of another?

Yes! You can extend an exisiting `Transformer` by calling `extend()` and passing a map just like you would a normal `Transformer`. This will merge the two mappings and return a new `Transformer` instance.

``` javascript

import {
  fieldDelegate, Transformer, Permissions,
  always, passthrough, buildWith
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

let personTransformer = new Transformer({
  // Special transformation cases here
  name: fd(always(buildWith(
    src => `${src.firstName} ${src.lastName}`
  ))),
  city: fd('homeCity', always(passthrough()))
}).byDefault(['age', 'height']).PASSTHROUGH()

// childTransformer will have all attributes of personTransformer, add a favoriteToy fieldDelegate, and override the name transformer
let childTransformer = personTransformer.extend({
  favoriteToy: fd('favoriteToy', always(passthrough())),
  name: fd('name', always(buildWith(
    src => `Lil' ${src.firstName}`
  )))
})
```

### Can I write my own custom rules and mappers?

Yes you can! Most use cases are covered by the Rules and FieldMappers provided by `tilla`, but you might want to write your own. A `Rule` and a `FieldMapper` are nothing more than functions. Here are their APIs:

```typescript
type Rule = (fieldMapperDelegate: FieldMapperDelegate) => FieldMapperDelegate

type FieldMapper = (fieldMapperDelegate: FieldMapperDelegate) =>
  (instance: any, key: string, isList: boolean, permission: string) =>
    Promise<returnType>
```

Notice that both `Rule` and `FieldMapper` eventually receive the `FieldMapperDelegate` instance. This enables both `Rule` or `FieldMapper` to access and/or mutate the state maintained by the delegate that is used later on when `tranform` is called.

Any function that implements either of those APIs can be used as a `Rule` or a `FieldMapper`, respectively! Let's show an example.

#### EitherOr Custom Rule Example

Say I want a rule that will only transform a field _only if_ the permission lvl is `PUBLIC` or `ADMIN`. You could of course implement this as a list of rules that `tilla` already provides:

```javascript
import {
  fieldDelegate, Permissions, when, passthrough
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

fd('name',
  when(Permissions.PUBLIC, passthrough()),
  when(Permissions.ADMIN, passthrough())
)
```

But, let's write a _single_ Rule that accomplishes this:

```javascript
import {
  fieldDelegate, Permissions, passthrough
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

// Our custom Rule
const eitherOr = (eitherPermission, orPermission, fieldMapper) => fieldMapperDelegate => {
  const { delegateMap } = fieldMapperDelegate

  delegateMap[eitherPermission] = fieldMapper(fieldDelegateMapper)
  delegateMap[orPermission] = fieldMapper(fieldDelegateMapper)

  return fieldDelegateMapper
}

// using our custom Rule
fd('age', eitherOr(Permissions.PUBLIC, Permissions.ADMIN, passthrough()))
```

Now whenever we call `transform`, the fieldDelegate will only map the field, as a `passthrough()`, only if the provided permission is either `PUBLIC` _or_ `ADMIN`

#### addMapper Custom FieldMapper Example

Let's extend out last example. Say we wanted a `FieldMapper` that simply adds a provided number to the value that it was mapping. Again, you could implement this using the `buildWith` mapper `tilla` already provides:

```javascript
import {
  fieldDelegate, Permissions, buildWith
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

const addMapper = n => buildWith(async (instance, key) => instance[key] + n)

fd('name',
  when(Permissions.PUBLIC, addMapper(1)),
  when(Permissions.ADMIN, addMapper(2))
)
```

But let's write our own mapper that accomplishes this:

```javascript
import {
  fieldDelegate, Permissions
} from 'tilla'

const fd = fieldDelegate() // use the built permission levels

// Our custom Rule
const eitherOr = (eitherPermission, orPermission, fieldMapper) => fieldMapperDelegate => {
  const { delegateMap } = fieldMapperDelegate

  delegateMap[eitherPermission] = fieldMapper(fieldDelegateMapper)
  delegateMap[orPermission] = fieldMapper(fieldDelegateMapper)

  return fieldDelegateMapper
}

const addMapper = n => () => async (instance, key) => instance[key] + n

// using our custom Rule AND custom FieldMapper
fd('age', eitherOr(Permissions.PUBLIC, Permissions.ADMIN, addMapper(1)))
```

Now whenever we call `transform`, the fieldDelegate will only map the field, adding 1 to it's value, only if the provided permission is either `PUBLIC` _or_ `ADMIN`

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
    req.transformer = transformer // then use the transformer later on
    next()
  }
}
```

The registry also provides a `subscribe(observer)` api that allows you to listen for changes to the registry. The registry emits events on `register` and `clear`

```javascript
import { registry } from 'tilla'

const unsubscribe = registry.subscribe(({ message, registry}) => {
  console.log(message)
})

registry.register('person', personTransformer)

// produces 'Registered transform at key: person' in the logs

// later on
unsubscribe() // unsubscribes the observer from the registry
```

the observer can be a function with single arity or an object that conforms to the or an object that satisfies this interface:

```typescript
interface Observer<T> {
  closed?: boolean;
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
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
