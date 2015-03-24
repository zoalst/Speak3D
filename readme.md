## Speak3D

Web app that creates 3D stuff when you speak to your browser. 
Created using [three.js](http://threejs.org) and [annyang](https://www.talater.com/annyang/), along with some [jQuery](http://jquery.com/) and [dat.GUI](https://code.google.com/p/dat-gui/).  

[**Try the Demo on Google Drive**](http://googledrive.com/host/0B5KjNubMIcDvSnNtVnhNemsxd2M/index.html) (Only works with Chrome)

Built off of examples in Lee Stemkoski's [Three.js examples](http://stemkoski.github.io/Three.js/index.html) and [3JSFPS](http://stemkoski.github.io/7DFPS/index.html)

## Voice Command Examples

  - say 'create cube color blue'
  - say 'create cube x -50 y 100 z 100' to create a cube of default size(50) whose center is at (-50,100,100)
  - say 'create knot material mirror spin y slow'
  - say 'set default transparent true size 50 until 100', then 'create many spheres color magenta'
  - say 'set default texture random', then 'create floor', then 'create many walls x -500 until 500'
  - say 'set default x -50 until 250', then 'create cylinder move x'
  - say 'set default x -50 until 50 y 0 until 100', then 'create many cones move x spin z'

## Voice Commands

  - 'create' geometry or 'create many' geometries w/ optional parameters
  - 'set default' w/ parameters
  - say 'undo' or press ctrl+z
  - say 'save' to save what you generate as a text file that can later be uploaded with 'upload'
  - say 'open console' or press 'o' to submit typed out commands in the top right corner(submit with enter); say 'close console' to close it
  - say 'gravity on' to have gravity and collision affect the user, say 'gravity off' to turn it off
  - say 'test' or 'test everything' to see a bunch of stuff at once

## Geometry Names
  -cube
  -sphere
  -cylinder
  -cone
  -ring
  -knot
  -floor
  -wall 
  -back wall
  -text

## Parameters

  - 'x','y', or 'z' followed by a number, optionally followed by 'until' and another number
  - 'size', 'width', 'height', or 'depth' followed by a number
  - 'color' or 'ambient' followed by a color name
  - 'texture' followed by a texture name
  - 'material' followed by a material name(bubble or mirror)
  - 'transparent' followed by 'true' or 'false'
  - 'spin' followed by 'x', 'y', or 'z'
  - 'move' followed by 'x', 'y', or 'z'
  - 'solid' followed by a 'true' or 'false', this makes a geometry collidable when gravity is on

## Usage

  - enunciate all your words clearly
  - leave a pause between commands
  - wait a few seconds to see if anything renders before retrying a command, commands that are recognized will briefly display in the bottom right corner
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
  - Speak to your computer to create 3D stuff

## [List of Color Names](https://github.com/zacharystenger/Speak3D/blob/master/current_color_list.md)

## List of Texture Names
  
  -alloy
  -brick
  -carving
  -checkers
  -chipped
  -chrome
  -cloud
  -crate
  -dirt
  -electric
  -glow
  -grass
  -hearts
  -lava
  -moon
  -paper
  -rock
  -rocky
  -rope
  -sand
  -snow
  -water
  -wood

## Preset Defaults
  - default size is 50 for all non-floor/wall geometries
  - default (x,y,z) is (0,50,0) for all non-floor/wall geometries
  - default color is light pink (0xffb6c1) for all non-floor/wall geometries
  - default size is 1000 for all floor/wall
  - default (x,y,z) is (0,0,0) for floor
  - default (x,y,z) is (0,500,0) for wall, so it spans y 0 to 1000
  - default (x,y,z) is (0,500,-500) for back wall 
  - default texture is checkers for all floor/wall
  - default transparent is false
  - default amount is 3
  - default cone and cylinder width is size*2/5
  - default ring width is size*4/5

## To Do

  - bug in dat.GUI, when default checkbox set outside of gui, updates display correctly but not value(have to double click)
  - add callback to gui so it logs stuff for save/load
  - enhance dat.GUI
  - bug when loading more than one mirror from file
  - bug with create many w/ mirror material (cameras)
  - GUI for user uploaded textures and models
  - add parameters for dimensions, rotation, etc.
  - improve cli's auto-complete
  - improve cli w/ list of recently submitted commands
  - ability to manipulate & remove existing geometries, incl. voice command to stop all motion
  - enhance start/pause screen
  - export function, add option that generates three js code
  - add random as an option, ex: color random, size & coordinates also
  - esc from pointer lock when mouse is in motion can cause camera to be angled somewhere else
  - ctrl+z is buggy
  - create self command, for third person view
  - when creating many geometries w/ one command, morph them into one geometry (maybe when amount >= a certian amount)
  - better controls to navigate in 3D space
  - problems with people talking fast
  - more geometries
  - more colors and textures
  - ability to set default parameters for specific geometries 
  - lights, fog, skyBox, etc.
  - built-in models and user uploaded models
  - better debugging
  - display message when browser does not support speech recognition
  - refactor

## Sources
  - Built off of examples in Lee Stemkoski's [Three.js examples](http://stemkoski.github.io/Three.js/index.html) and [3JSFPS](http://stemkoski.github.io/7DFPS/index.html)

## Authors

* Zachary Stenger

## License

MIT

* [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)