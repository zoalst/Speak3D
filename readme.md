## Speak3D

Web app that creates 3D stuff when you speak to your browser. 
Created using [three.js](http://threejs.org) and [annyang.](https://www.talater.com/annyang/) 
Built off of the Text3D example in Lee Stemkoski's
[Three.js examples](http://stemkoski.github.io/Three.js/index.html)

[Try the Demo on Google Drive](http://googledrive.com/host/0B5KjNubMIcDvSnNtVnhNemsxd2M/index.html) (only works with Chrome)

## List of Commands & Examples

  - say 'create cube' w/ optional parameters
  - say 'create sphere' w/ optional parameters
  - say 'create ring' w/ optional parameters
  - say 'create knot' w/ optional parameters
  - say 'create cylinder' w/ optional parameters
  - say 'create floor' w/ optional parameters (only has x,y,size right now)
  - say 'create wall' or 'create back wall' w/ optional parameters (only has x,y,size right now)
  - say 'create many cubes/spheres/rings/knots/cylinders/floors/walls' w/ optional parameters, provide amount param and two params on atleast one axis(x,y, or z) or two size params ex: 'create many spheres amount 5 z 0 and 250' or 'create many cubes amount 5 size 10 and 110 transparent true'
  - say 'create text' then say whatever you want
  - say 'set default' w/ parameters ex: 'set default transparent true color blue' or 'set default amount 10 size 20 x 0 and 200'
  - say 'undo' or press ctrl+z
  - say 'open console' to submit typed out commands(submit with enter); say 'close console' to close it
  - say 'test everything' to see a bunch of stuff at once

## Parameters

  - 'x','y', or 'z' followed by a number
  - 'size' or 'width' followed by a number
  - 'color' or 'ambient' followed by a color name
  - 'texture' followed by a texture name
  - 'transparent' followed by a 'true' or 'false'
  - you can set a parameter range by using the keyword end(or and), ex: create many cubes x 0 end 100

## Examples

  - say 'create cube color blue'
  - say 'create knot width 9 texture cloud'
  - say 'create cube x 50 y 100 z 100' 
  - say 'set default transparent true size 50 and 100', then 'create many spheres color magenta'
  - say 'set default texture random', then 'create floor', then 'create many walls x -500 and 500'


##Usage

  - enunciate all your words clearly
  - leave a pause between commands
  - wait a few seconds to see if anything renders before retrying a command
  - you can look at the console log (ctrl+shift+c) to see if your Speak3D commands and parameters are being picked up properly
  - leave a slight pause between words
  - to use negative numbers you can say 'negative' or 'minus' followed a number, do not pause between these words
  - example (.. represents a slight pause): say 'create cube .. size .. one hundred fifty .. x .. minus twenty five'

## If you want to run on your server 

You'll need [nodejs](http://nodejs.org/) installed
  - Clone to your machine
  - run npm install from your CLI
  - run node server.js command
  - Open localhost:9000 in a Chrome browser
  - Allow microphone access
  - Speak to your browser

## List of Color Names

  -antique
  -aqua
  -aquamarine
  -azure
  -beige
  -bisque
  -black
  -blue
  -brown
  -burlywood
  -chartreuse
  -chocolate
  -coral
  -crimson
  -cyan
  -fire
  -forest
  -fuchsia
  -gainsboro
  -ghost
  -gold
  -goldenrod
  -gray
  -grey
  -green
  -honeydew
  -indigo
  -ivory
  -khaki
  -lavender
  -lawn
  -lemon
  -lime
  -linen
  -magenta
  -maroon
  -midnight
  -mint
  -navy
  -olive
  -orange
  -orchid
  -pink
  -plum
  -purple
  -red
  -salmon
  -seashell
  -sienna
  -silver
  -sky
  -snow
  -tan
  -teal
  -thistle
  -tomato
  -turquoise
  -violet
  -wheat
  -white
  -yellow

## List of Texture Names
  
  -alloy
  -carving
  -checkers
  -chrome
  -cloud
  -crate
  -dirt
  -electric
  -glow
  -grass
  -moon
  -rock
  -rocky
  -sand
  -snow
  -water

## To Do

  - a lot
  - add random as an option, ex: color random or texture random, size & coordinates also
  - export function so users can save whatever they create
  - improve cli w/ list of recently submitted commands & auto complete
  - ability to manipulate & remove existing geometries
  - enhance start/pause screen
  - ctrl+z is buggy
  - use updated version of three.js
  - create self command, for third person view
  - better controls to navigate in 3D space
  - add parameters for dimensions, rotation, etc.
  - problems with people talking fast
  - geometries in motion
  - more geometries
  - more colors and textures
  - ability to set default parameters for specific geometries 
  - spin(command would be spin x, spin y, spin z)
  - lights, fog, skyBox, etc.
  - built-in models and user uploaded models
  - better debugging
  - usage & list of commands
  - display message when browser does not support speech recognition
  - refactor

## Authors

* Zachary Stenger

## License

MIT

* [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)