let cols, rows;
//each grid will be 20 pixels wide & tall
let scl = 20; //scale; how far apart each grid point is spaced on the X/Y axes

let terrain = []; //empty array that will store the height values for every grid point
let trees = []; //same as above but with the cones

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // Enable 3D mode
  background(222);

  let w = 600;
  let h = 600;
	//how many columns/rows fit into the grid, given total width/height/scale spacing
  cols = w / scl; //this calculation give you how many grid spaces fit into 600 pixels
  rows = h / scl;
  terrain = new Array(cols); //array with "cols" number of empty slots. Later, each slot..
	//...will hold another array (for the rows). 
	
  for (let x = 0; x < cols; x++) { //loop: creates a new inner array for each column (y-axis)
    terrain[x] = new Array(rows); //stores the height values 
  }
  //fill terrain heights with random values
	yoff = 0; //for "Perlin noise" y-direction variable (vertical)
  for (let y = 0; y < rows; y++) { //loops through each row of the grid
		xoff = 0; //resets the x-offset for each new row
		
    for (let x = 0; x < cols; x++) { //loops through each column in that row
			//terrain[x][y] defines the height value (Z) of each grid point
			//map(...) converts the noise value to a height range from -50(low) to +50(high) pixels
			//noise(xoff,yoff) gives a Perlin noise value between 0 & 1
      terrain[x][y] = map(noise(xoff,yoff), 0, 1, -50, 50); 
			
			xoff += 0.1; //increases x-offset slightly for next column (for slopes instead of jagged spikes)
    }
		yoff += 0.1; //after one row, this increases the y-offset to move down in the noise field (slightly different heights)
  }
	
	for (let i = 0; i < 30; i++){ //trees (number of trees)
		let tx = floor(random(cols)); //randomly picks 30 positions on the grid (tx,ty)
		let ty = floor(random(rows)); //"floor" rounds the number to the nearest whole number
		trees.push({x: tx, y: ty}); //"pushes" new coordinates (x and y) to the end of the trees array 
	}
}

function draw() {
  stroke("#401A0C");
  fill("#A66F2D");

  rotateX(PI / 3);   // Tilt grid in 3D (about 60°)
  //rotateZ(PI / 4);   // optional (rotate around Z for diagonal view)

  translate(-300, -300);  // move grid so it’s centered

	//Outer loop: goes row by row down the grid. rows - 1 means it stops... 
	//..one row before the end, because each strip connects one row to the next
  for (let y = 0; y < rows - 1; y++) { //loop
    beginShape(TRIANGLE_STRIP); //starts the series of triangles (connected)
    for (let x = 0; x < cols; x++) { //loop
      //defines two points in 3D space
      vertex(x * scl, y * scl, terrain[x][y]); //one point at row y
      vertex(x * scl, (y + 1) * scl, terrain[x][y+1]); //one point at row y+1 (next row down)
    }
    endShape(); //ends the series of triangles 
}
	for (let i = 0; i < trees.length; i++){ //loop through every saved tree position + 1 
		let tx = trees[i].x; //"i" relates to trees and ".x" relates to columns 
		let ty = trees[i].y; //same as above, but ".y" relates to rows
		let tz = terrain[tx][ty]; //height of terrain at that point
		  
		push(); //save the current transformation
    translate(tx * scl/2, ty * scl/2, tz/2); //move to terrain surface (point) 
		//I'll just have them cluster together in the left corner
		rotateX(PI/2); //Keeps the cones upright 
    fill("#025951");
    stroke("#324016");
		
		let treeRadius = random(10,40);
		let treeHeight = random (50,80);
		
    cone(treeRadius,treeHeight); // (radius, height)
  	pop(); // restore transformation
	}
	noLoop();
}
