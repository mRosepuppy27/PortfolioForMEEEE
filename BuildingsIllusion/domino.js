const STEP_DELAY = 100;//tempo control: 100ms between successive rhombuses = readable wave
const PROPAGATION_GLOW = 1000; //how long the glow should last (ms)

//domino propagation needs to locate target rhombus for each step
function getRhombusByRingIndex(ring, idx) {//find rhombus object with a ring, and indexInRing here
  for (let rh of RHOMBUSES) {//loop through RHOMBUSES array (in rhombus.js)
	 //if current rhombus is chosen ring & has the chosen index in that ring, return that object
    if (rh.ring === ring && rh.indexInRing === idx) return rh;
  }
  return null;//if loop finishes without returning = no matching rhombus
}

// start propagation from a clicked rhombus
function startPropagation(startRh) {//start timed sequence along ring (ring with clicked rhombus)
  //check up, so this should prevent errors if startRh is missing or something 
  if (!startRh || typeof startRh.ringCount !== 'number') return;

  const ring = startRh.ring;//extract ring from startRh
  const ringCount = startRh.ringCount; //extract ringCount from startRh
  const dir = startRh.direction; // 1 (clockwise) or -1 (counterclockwise)

  const startIndex = startRh.indexInRing;//index of clicked rhombus inside its ring (starting point for wave)
	
  //keep "k" from "0" up to ringCount-1, & advance index by dir*k. 
  for (let k = 0; k < ringCount; k++) {//loop schedules 1 activation per rhombus in ring
    const targetIndex = (startIndex + dir * k + ringCount) % ringCount;//loop around ring

    //IIFE (I-mmediately I-nvoked F-unction E-xpression) 
	 //anonymous function takes tIdx & delaySteps, & calls it with current targetIndex & k. 
    ((tIdx, delaySteps) => {
      setTimeout(() => {
        const targetRh = getRhombusByRingIndex(ring, tIdx);//find rhombus object that has the calculated ring/index from getRhombusByRingIndex
        if (!targetRh) return;//if rhombus not found, exit 
        // set glow start to current time so it animates in rhombus.draw()
        targetRh.glowStart = millis();
        targetRh.glowDuration = PROPAGATION_GLOW;//length of glow lasting (glowDuration=fade glow over time)
      }, delaySteps * STEP_DELAY);//schedule callback runs after delaySteps*STEP_DELAY (ms) because delaySteps=k
    })(targetIndex, k);
  }
}

//find clicked rhombus & start propagation
function mousePressed() {
  //do nothing if RHOMBUSES is not an array/is empty
  if (!Array.isArray(RHOMBUSES) || RHOMBUSES.length === 0) return;

  //loop from top to bottom visually (reverse the array)
  for (let i = RHOMBUSES.length - 1; i >= 0; i--) {
    const rh = RHOMBUSES[i];//grab current rhombus object
    if (isMouseInsideRhombus(rh)) {//test whether current mouse coordinates are inside rhombus
      startPropagation(rh);//start propagation along this rhombus's ring
      return; //stop loop/mouseClicked function (no multiple starts)
    }
  }
}

function isMouseInsideRhombus(rh) {
  //build local vertices (sizes: width & height)
  const w = rh.w, h = rh.h;
  const verts = [
    { x: 0,         y: -h / 1.9 },  // top
    { x: w / 2.3,   y: 0        },  // right
    { x: 0,         y: h / 1.9  },  // bottom
    { x: -w / 2.3,  y: 0        }   // left
  ];

  const theta = radians(rh.rotation); //rotation is in degrees, but this converts it to radians (because cos/sin functions uses radians)
  const cosT = cos(theta), sinT = sin(theta);//compute cosine/sine 1 time & store them so it's easier to see
  const world = verts.map(v => {//transform each vertex from "local" coordinates to "world" (using rotation/translation)
    const wx = rh.x + v.x * cosT - v.y * sinT;
    const wy = rh.y + v.x * sinT + v.y * cosT;
    return { x: wx, y: wy };//the "=>" function returns this for each vertex
  });
  //call pointInPoly passing global mouseX, mouseY & transformed polygon (world)
  return pointInPoly(mouseX, mouseY, world);//if point is in polygon, return true
}

function pointInPoly(px, py, poly) { //make sure point (px,py) is inside "poly" (array of points {x,y} in order around polygon)
  //at the end, true = inside, false = outside
  let inside = false;//start assuming point is outside; each time a ray from the point to the right crosses an edge of polygon, flip "inside"
  //j=poly.length - 1 .....connect last vertex to first vertex
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {//loop over edges, "i"=current vertex index, "j"=previous vertex index
    const xi = poly[i].x, yi = poly[i].y;//get coordinates of current vertex
    const xj = poly[j].x, yj = poly[j].y;//get coordinates of previous vertex
	 //check if horizontal ray to the right from (px,py) crosses the edge (xj,yj) to (xi,yi)
    const intersect = ((yi > py) !== (yj > py)) && //check if edge crosses the horizontal line at point's y.
      (px < (xj - xi) * (py - yi) / (yj - yi + 0.0000001) + xi); //find "x" where the segment's "y" equals "py"
    if (intersect) inside = !inside; //if there's a crossing, toggle "inside." If ray crosses polygon edge on odd number of times, the point is inside
  } // if the point crosses a polygon an even number of times, the point is outside
  return inside;
}
