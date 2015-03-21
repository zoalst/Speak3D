$(function(){
  var keywords = [
    'set default',
    'create',
    'create cube',
    'create sphere',
    'create cylinder',
    'create knot',
    'create ring',
    'create cylinder',
    'create cone',
    'create floor',
    'create wall',
    'create back wall',
    'create many cubes',
    'create many spheres',
    'create many cylinders',
    'create many knots',
    'create many rings',
    'create many cylinders',
    'create many cones',
    'create many floors',
    'create many walls',
    'create bubble',
    'test',
    'gravity on',
    'gravity off'

  ];
  
  // setup autocomplete function pulling from currencies[] array
  $('#consoleBox').autocomplete({
    lookup: keywords,
    onSelect: function (suggestion) {
        //console.log('onselect');
      //var thehtml = '<strong>Currency Name:</strong> ' + suggestion.value + ' <br> <strong>Symbol:</strong> ' + suggestion.data;
      //$('#outputcontent').html(thehtml);
    }
    //position: { my: "left bottom", at: "left top", collision: "flip none" }
  });
  

});