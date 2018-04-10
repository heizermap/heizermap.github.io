// Wait for the page to be ready
window.addEventListener("load", function(e) {

  console.log("Page loaded!");

  // Store the color we will be tracking (selectable by clicking on the webcam feed)
  var color = {r: 255, g: 0, b: 0};

  // Grab reference to the tags we will be using
  var slider = document.getElementById("tolerance");
  var canvas  = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  var webcam = document.getElementById('webcam');
  var swatch = document.getElementById("color");
  var currentRectangles;

  // Register our custom color tracking function
  tracking.ColorTracker.registerColor('dynamic', function(r, g, b) {
    return getColorDistance(color, {r: r, g: g, b: b}) < slider.value
  });

  // Create the color tracking object
  var tracker = new tracking.ColorTracker("dynamic");

  // Add callback for the "track" event
  tracker.on('track', function(e) {

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (e.data.length !== 0) {

      //store our tracked rectangles to the variable currentRectangles
      currentRectangles = e;

      e.data.forEach(function(rect) {
        // console.log(rect);
        drawRect(rect, context, color);
      });

    }

  });

  // Start tracking
  tracking.track(webcam, tracker, { camera: true } );

  // Add listener for the click event on the video
  webcam.addEventListener("click", function (e) {

    // Option 1: Get the color where we clicked
    /* var c = getColorAt(webcam, e.offsetX, e.offsetY);

    // Check if the color where we clicked matches the color we set using the input
    if (getColorDistance(color, c) < slider.value)
    {

      // turn on the winning block
      document.getElementById('youwon').style.display = 'block';

    }*/

    // Option 2: Check our currentRectangles

    // check our click against each rectangle active on the screen

    for (i = 0; i < currentRectangles.data.length; i++) {

      // check if the X of our click is more than the X coordinate of where the rectangle starts
      if(e.offsetX >= currentRectangles.data[i].x)
      {
        // then check if the X of our click is less than the X coordinate of where the rectangle ends
        if(e.offsetX <= (currentRectangles.data[i].x + currentRectangles.data[i].width))
        {
          // then check if the Y of our click is more than the Y coordinate of where the rectangle starts
          if(e.offsetY >= currentRectangles.data[i].y)
          {
            // then check if the Y of our click is less than the Y coordinate of where the rectangle ends
            if(e.offsetY <= (currentRectangles.data[i].y + currentRectangles.data[i].height))
            {
              // turn on the winning block and turn off the game window so it doesn't flicker
              document.getElementById('youwon').style.display = 'block';
              document.getElementsByClassName('gamewindow')[0].style.display = 'none';

              // we found a winner so break out of our loop by returning as true!
              break;
            }
          }
        }
      }
    }


  });

  // Add listener for when the swatch color changes
  swatch.addEventListener("input", function() {

    // #XXXXXX -> ["XX", "XX", "XX"]
    // convert the hexadecimal color to RGB using the match function
    var thenewcolor = swatch.value.match(/[A-Za-z0-9]{2}/g);

    // ["XX", "XX", "XX"] -> [n, n, n]
    // convert the text array to an array of numbers using the map and parseInt functions
    thenewcolor = thenewcolor.map(function(v) { return parseInt(v, 16) });

    // Update target color
    color.r = thenewcolor[0];
    color.g = thenewcolor[1];
    color.b = thenewcolor[2];

  });

});

// Calculates the Euclidian distance between the target color and the actual color
function getColorDistance(target, actual) {
  return Math.sqrt(
    (target.r - actual.r) * (target.r - actual.r) +
    (target.g - actual.g) * (target.g - actual.g) +
    (target.b - actual.b) * (target.b - actual.b)
  );
}

// Returns the color at the specified x/y location in the webcam video feed
function getColorAt(webcam, x, y) {

  // To be able to access pixel data from the webcam feed, we must first draw the current frame in
  // a temporary canvas.
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = webcam.width;
  canvas.height = webcam.height;
  context.drawImage(webcam, 0, 0, webcam.width, webcam.height);

  // Then we grab the pixel information from the temp canvas and return it as an object
  var pixel = context.getImageData(x, y, 1, 1).data;
  return {r: pixel[0], g: pixel[1], b: pixel[2]};

}

// Draw a colored rectangle on the canvas
function drawRect(rect, context, color) {
  context.strokeStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
  context.lineWidth = 10;
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);
}
