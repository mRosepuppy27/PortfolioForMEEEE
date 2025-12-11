let speedfactor = 3; 
let xspeed = speedfactor;
let yspeed = speedfactor;
let x = 0;
let y = 0;
let dove, crosshair;

let safeX, safeY; //position of the safe zone
let safeSize = 150; //diameter of the safe zone

let mouseSafe = false; //variable that tracks if mouse is inside safe zone

function setup() {
	createCanvas(650,650);
	x = random(width); //starts dove at random positions
	y = random(height);

	//randomly place the safe zone; subtract so it stays in canvas screen
	safeX = random(safeSize/2, width - safeSize/2);
	safeY = random(safeSize/2, height - safeSize/2);
}

function preload(){
	crosshair = loadImage("crosshair_3601889.png");
	dove = loadImage("dove_4474936.png");
}

function draw() {
	background(100);

	if (mouseSafe){ //changes to dark green
		fill(0,200,100,180);
	}else {
		fill(0,255,0,100); //changes to light green
		}
	ellipse(safeX,safeY,safeSize,safeSize); 
	
	//draw crosshair at cursor's position
	image(crosshair, mouseX - 50, mouseY - 50, 100, 100);

	//difference between dove's position (x,y) &...
	//...the cursor's position (mouseX,mouseY)
	let dx = mouseX - x; //horizontal distance dove is from cursor
	let dy = mouseY - y; //vertical distance dove is from cursor
	let distToCursor = sqrt(dx * dx + dy * dy); //distance between dove & cursor

	let distToSafe = dist(mouseX, mouseY, safeX, safeY);

	if (distToSafe < safeSize / 2){ //checks if mouse is in safe zone
		mouseSafe = true; //cursor is inside safe zone
	} else {
		mouseSafe = false; //cursor is outside safe zone
	}

	//moves dove toward cursor only if mouse is not in safe zone
	//stops movement when dove is almost exactly on top of the cursor
	if (!mouseSafe && distToCursor > 1){
		x += (dx / distToCursor) * speedfactor;
		y += (dy / distToCursor) * speedfactor;
	}
	
	
	image(dove, x - 50, y - 50, 100, 100);

	//check if dove's distance form cursor is less than 50 pixels (1/2 dove's width)
	//If it's true, the dove "collided" with the crosshair, so it needs to...
	//...pick a new random positon
	if (distToCursor < 50 && !mouseSafe){ //if distToCursor is less than 50 & mouseSafe is not safe
		//reset dove position to random spot
		x = random(width);
		y = random(height);

		//moves safe zone to random position when dove touches cursor
		safeX = random(safeSize / 2, width - safeSize / 2);
		safeY = random(safeSize / 2, height - safeSize / 2);
	}

}
