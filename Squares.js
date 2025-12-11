// Artist = Vera Molnar 
// Title = Sans Titre (Untitled)
// Year Made = 1984
// url = https://spalterdigital.com/artworks/sans-titre-untitled-3/
function setup() {
  createCanvas(400, 500);
  noLoop();
  noFill();
  stroke(0, 100);
  background(220);
  
  rows = 10;
  cols = 10;
}

function draw() {
	translate(75,105);
  let rectW = 28; //width of all rectangles
  let rectH = 25; //height of all rectangles

  let cellW = width/cols-15; //adjusts the grids via width; -15 makes them closer
  let cellH = height/rows-22; //same as above but with height
	
  //Max Distance so they overlap slightly but not across cells not directly.. 
	//..next to them
  let maxDistanceX = cellW * random(0,0.27); 
  let maxDistanceY = cellH * random(0,0.27); 

  for (let i = 0; i < rows; i++) { //if "i" is less than rows, add 1
    for (let j = 0; j < cols; j++) { //if "j" is less than cols, add 1
			
      // Base of the grid cell's position (center of the cell)
      let baseX = j*cellW + cellW/2; //divide by 2 because of the sides (2sides of width)
      let baseY = i*cellH + cellH/2; //same but for the 2 sides of the height

      let DistanceX = random(-maxDistanceX, maxDistanceX);// Small change in the range
      let DistanceY = random(-maxDistanceY, maxDistanceY);

      // subtle mapping to vary the tone a bit
      let tone = map(i*cols + j, 0, rows*cols, 50, 200); 
      stroke(0);

      // Draw rectangles at a distance between each other
      rect(baseX + DistanceX - rectW/2, baseY + DistanceY - rectH/2, rectW, rectH);
    }
  }
}
