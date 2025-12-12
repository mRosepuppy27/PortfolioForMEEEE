//I'll need a global array to influence multiple code related to the rhombuses
//so, RHOMBUSES will fill computeRhombuses(), read drawRhombuses(), & look for/modify objects inside domino.js
const RHOMBUSES = []; 
//let RHOMBUS_CENTER = {x:0, y:0};

//initialize rhombus geometry & any state. Call once from main setup()
function initRhombuses() {
  //make sure (for later) that cos()/sin() uses degrees instead of radians
  angleMode(DEGREES);
  computeRhombuses(); //build the RHOMBUSES array & runs it after the canvas/layout (buildings array) exists
}

//recompute RHOMBUSES; canvas/layout changes (window resized/buildings repositioned)...
function onResizeRhombuses() { ///...rhombus positions need to be recomputed
  computeRhombuses();
}

//draw rhombuses; after buildings are done
function drawRhombuses() { 
  //draw using stored RHOMBUSES
  for (let rh of RHOMBUSES) { //iterate every rhombus object in order
    push(); //push()/pop() = isolates transforms (translate/rotate)/style changes for each rhombus so they don't affect later rhombuses
    translate(rh.x, rh.y); //move rhombus's world coordinate's origin, so it's at the center (0,0)
    rotate(rh.rotation); //rotate so that the rhombus lines are drawn at the correct angle

    let glowAlpha = 0; // create glowAlpha
    if (rh.glowStart > 0) { //rh.glowStart is set when a rhombus is activated, so if it's "0" it's not glowing
      const elapsed = millis() - rh.glowStart; //subtract rh.glowStart from current time (in millis()) to find how long rhombus has been glowing
      glowAlpha = constrain(1 - elapsed / rh.glowDuration, 0, 1); //elapsed time = value that fades from 1-0 over glowDuration; constrain = never goes below 0 or above 1
      if (glowAlpha === 0) rh.glowStart = 0;//when glow's done, clear start time marker, so condition is false next frame 
    }
    drawRhombus(rh.w, rh.h, glowAlpha); //draw rhombus at local origin with it's glow alpha

    pop(); //restore previous transformations; next rhombus drawn as if nothing happened 
  }
}

function computeRhombuses() {//recompute rhombus geometry 
  RHOMBUSES.length = 0;//clear old rhombuses before pushing new ones 


  //compute center based on buildings; default = canvas center
  let centerX = width / 2;
  let centerY = height / 2;

  if (Array.isArray(buildings) && buildings.length > 0) {
    const left = buildings[0].x;//leftmost x of the first building (compute left as left edge of 1st building[0])
    const last = buildings[buildings.length - 1]; //rightmost edge of the last building (right as right edge of last building)
    const right = last.x + last.w;
    centerX = (left + right) / 2; //center horizontally over building row (midpoint=between leftmost & rightmost edges)

    //vertically center inside the tallest building area (so illusion sits in the middle)
    const maxH = buildings.reduce((m, b) => max(m, b.h), 0);//maxH=tallest building height
    centerY = height - maxH / 2;//center is half way up tallest building from ground line
  }

  //parameters: define ring structure: 
  const numRings = 11; //how many concentric rings of rhombuses
  const baseRadius = 60;//raius of innermost ring
  const ringGap = 63;//add radius between consecutive rings (spacing)
  const rhombusWidth = 48;
  const rhombusHeight = 24;

  for (let r = 0; r < numRings; r++) {//loop over each ring index "r"
    const radius = baseRadius + r * ringGap;//how far that ring is from the center (r=0;baseRadius),(r=1;baseRadius+ringGap),etc.

    const minScale = 0.9; //size at the innermost ring (smaller), so like in terms of perspective
	 const maxScale = 1.9; //size at the outermost ring (bigger)
	 const maxRadius = baseRadius + (numRings - 1) * ringGap;
	 const sizeScale = constrain(map(radius, baseRadius, maxRadius, minScale, maxScale), minScale, maxScale);
	  

    //how many rhombuses fit around the circle
    const circumference = TWO_PI * radius;//circle perimeter; "floor" makes things an integer
    const approxCount = floor(circumference / (rhombusWidth * 1.2));//how many rhombus widths (+a bit of spacing (1.2)) fit around circumference
    const numRhombuses = max(5, approxCount); //at least 5 rhombuses

    //alternate direction: 1 = normal, -1 = reversed
    const direction = (r % 2 === 0) ? 1 : -1; //use later for alternating rhombuses direction (r%2===0 makes even rings 1, and odd rings -1)

    //offset so alternating rings appear rotated
    const offset = 360 / (numRhombuses * 2) * direction; //multiply by direction to flip the offset sign for alternating rings

    for (let i = 0; i < numRhombuses; i++) {//inner loop: for creating each rhombus around the ring
		//make angle progression clockwise or counterclockwise 
      const angle = i * (360 / numRhombuses) * direction + offset;//offset to rotate entire ring slightly 

		//convert polar cordinates like (radius, angle) into cartesian (x,y) using cos & sin
      const x = centerX + radius * cos(angle); //angleMode(DEGREES) is set, so cos() & sin() expect degrees (not radians)
      const y = centerY + radius * sin(angle);

      const extraFlip = (r % 2 === 1) ? 120 : 0;//more rotation for odd rings 
      const rotation = angle + 120 + extraFlip; //rhombus sides align relative to position on ring 

      //id = unique index because why not (just in case I any debugging or whatever)
      const id = RHOMBUSES.length;

		//map physical array index "i" to a logicalIndex that always increases in the same visual direction around a ring
      let logicalIndex; 
      if (direction === 1){//if direction is "1" keep "i"
        logicalIndex = i;
      } else { //if direction is "-1" invert index so the 1st rhombus in the logical sequence is consistent 
        logicalIndex = (numRhombuses - 1 - i);
      }

      const rh = {//rhombus data object: 
        id: id,
        x: x, //world position
        y: y, //world position
        rotation: rotation, //orientation
        w: rhombusWidth * sizeScale, //size used by drawRhombus() 
        h: rhombusHeight * sizeScale, //size used by drawRhombus() 
        ring: r, //which ring number it belongs to
        indexInRing: logicalIndex, //logical order index used by domino propagation 
        glowStart: 0, // millis() start time; 0 = not glowing (domino.js code should set this to millis() to begin glow)
        glowDuration: 1000, // milliseconds to fade out
        ringCount: numRhombuses, //just to make sure domino.js code knows ring size/propagation direction 
        direction: direction,
      };
      RHOMBUSES.push(rh);//add this data (constructed rhombus) to global RHOMBUSES array, so it can be found by domino.js
    }
  }
}

function drawRhombus(w, h, glowAlpha = 0) { //rhombus has 4 vertices which are drawn manually here
  const topX = 0,         topY = -h / 1.9;
  const rightX = w / 2.3, rightY = 0;
  const bottomX = 0,      bottomY =  h / 1.9;
  const leftX = -w / 2.3, leftY = 0;

  const baseStroke = 2.57; //rhombus line thickness
  strokeWeight(baseStroke);
  strokeCap(SQUARE); //make line ends squared (sharp edges)
  noFill();

  if (glowAlpha > 0) {//if glowAlpha > 0: draw a soft outer glow behind the white edges
	  
	 const glowMax = 13; //how wide the glow can be at Max
    const glowW = baseStroke + glowAlpha * glowMax; //glowW increases (+) with glowAlpha, so glow starts thin→thick if glowAlpha is closer to 1
    const glowAlpha255 = 200 * glowAlpha; //map 0-255 alpha scale + translucent effect 

    strokeWeight(glowW);//draw thicker/translucent white lines behind white edges to create glow
    stroke(255, glowAlpha255); //color is white
    //white edges are top→right and left→top so, draw both
    line(topX, topY, rightX, rightY); //only white edges are drawn with glow 
    line(leftX, leftY, topX, topY);
    //reset strokeWeight for main lines
    strokeWeight(baseStroke); //after glow, this returns it to original stroke weight 
	 
  }

  //main edges
  stroke(255); line(topX, topY, rightX, rightY);      // white
  stroke(0);   line(rightX, rightY, bottomX, bottomY); // black
  stroke(0);   line(bottomX, bottomY, leftX, leftY);   // black
  stroke(255); line(leftX, leftY, topX, topY);         // white
}
