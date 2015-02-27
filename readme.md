## Speak3D

Web app that creates 3D stuff when you speak to your browser. 
Created using [three.js](http://threejs.org) and [annyang.](https://www.talater.com/annyang/) 
Built off of the Text3D example in Lee Stemkoski's
[Three.js examples](http://stemkoski.github.io/Three.js/index.html)

[Try the Demo on Google Drive](http://googledrive.com/host/0B5KjNubMIcDvSnNtVnhNemsxd2M/index.html) (only works with Chrome)

## List of Commands

	- say 'create cube' w/ optional parameters

	- say 'create ball' w/ optional parameters

	- say 'create floor' w/ optional parameters (only has y coordinate right now)

	- say 'create text' then say whatever you want

	- optional parameters are x (number), y (number), z (number), size (number)

	- example of parameter usage: say 'create cube x 50 y 100 z 100 size 75' or 'create ball size 100 x 150'

##Usage

	- enunciate all your words clearly

	- leave a pause between commands

	- leave a slight pause between words

	- to use negative numbers you can say 'negative' or 'minus' followed a number, do not pause between these words

	- example (.. will represent a slight pause): say 'create cube .. size .. one hundred fifty .. x .. minus twenty five'

## If you want to run on your server 

You'll need [nodejs](http://nodejs.org/) installed
  - Clone to your machine
  - run npm install from your CLI
  - run node server.js command
  - Open localhost:9000 in a Chrome browser
  - Allow microphone access
  - Speak to your browser

## To Do

	- a lot

	- more geometries

	- add parameters for color, dimensions, rotation, transparent, etc.

	- problems with people talking fast

	- geometries in motion

	- ability to manipulate & remove geometries after they are created

	- usage & list of commands

	- display message when browser does not support speech recognition

## Authors

* Zachary Stenger

## License

MIT

* [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)