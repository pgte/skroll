# Skroll

Framework for class trainings.

## Install

``` sh
git clone git://github.com/pgte/skroll.git
cd bin
npm install
cd ..
```

## Creating a class

Add a json file to `classes` using `classes/example.json` as a reference.

## Creating an unit

Add the unit to the units folder. You must have an index.md and a meta.json file. The `src` folder is where code lives and will be bundled in a tar.gz if you put something there.

## Build

```sh
node ./bin/build.js -c <class name>
node ./bin/server.js -c <class name>
```

In the default example, use `example` as class name.

## Use

Visit http://localhost:8080/

When inside a unit, use the arrow keys to navigate back / forward.