let buildings = []; //array for holding objects related to "buildings" like position,width,height,color,etc. 

const palette = [ //array of color strings (hex) to pick building colors from generateBuildings()
  '#E63946', // red
  '#2A9D8F', // teal
  '#457B9D', // blue
  '#F4D35E', // yellow
];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  //<canvas> in html (is the drawing surface that can be manipulated with JavaScript). AKA a single DOM node. 
  canvas.parent('app');//move canvas DOM node into html element with id "app" (keep canvas in specific containter)

  //generate buildings once on setup
  generateBuildings();
  //initialize masked background effect after buildings exist 
  if (typeof initBackgroundMask === 'function') initBackgroundMask();

  //initialize illusion code AFTER p5js is ready
  if (typeof initRhombuses === 'function') initRhombuses();
  if (typeof initDominoEffects === 'function') initDominoEffects(); //initialize this after rhombuses exist
}

function windowResized() {//in case browser window changes sizes;buildings stay the same even if window size changes
  resizeCanvas(windowWidth, windowHeight);
  //recompute masked background
  if (typeof onResizeBackgroundMask === 'function') onResizeBackgroundMask();

  //recompute illusion geometry too
  if (typeof onResizeRhombuses === 'function') onResizeRhombuses();
  if (typeof onResizeDominos === 'function') onResizeDominos();
}


function generateBuildings() {
  buildings = [];//get rid of previous buildings (restart)

  const margin = 30;
  const minBuildings = 10;//it's only the same because I want it the same!
  const maxBuildings = 10;//it's only the same because I want it the same!

  //number of buildings determined once from initial canvas size
  const count = constrain( //constrain = never go below minBuildings or above maxBuildings 
    floor(map(width, 630, 2000, minBuildings, maxBuildings)),
    minBuildings,
    maxBuildings
  );
  //increment "x" starting position (1st building is placed (left edge))
  let x = margin;//increment "x" after adding each building, so they're all placed horizonatally 

  for (let i = 0; i < count; i++) {//create "count" building objects loop
    const h = random(height * 0.6, height * 0.9); //random building height
    const col = palette[i % palette.length];//choose color from "palette" array by cycling through it
    const w = random(90, 155); //random building width

    buildings.push({ //for drawing code
      x: x,
      w: w,
      h: h,
      color: col
    });

    x += w; //move next building's x-position to immediately after the current building (no spacing)
  }
}

function draw() {
  //background sky
  drawNightSky();
  //draw each building (base + shadow)
  for (let b of buildings) {
    drawBuildingWithShadow(b);
  }

  //draw the illusion on top of the buildings (rhombuses + domino effects)
  if (typeof drawRhombuses === 'function') drawRhombuses();
  if (typeof updateDominoEffects === 'function') updateDominoEffects();
  if (typeof drawBackgroundMask === 'function') drawBackgroundMask();
}

function drawNightSky() {
  //top = slightly lighter blue, bottom = darker near-black
  const topCol = color(18, 28, 48); //bluish night tone
  const botCol = color(5, 10, 20); //very dark blue/black

  noStroke(); 
  //each gradient is drawn with as many horizontal strips as needed...
  for (let y = 0; y < height; y += 4) { //...stepping by 4 pixels vertically each time
    let t = map(y, 0, height, 0, 1);//
    let c = lerpColor(topCol, botCol, t);//
    fill(c);
    rect(0, y, width, 4);
  }
}

function drawBuildingWithShadow(b) {
  const baseY = height - b.h;//top of building is positioned so that bottom of building is at bottom of canvas

  //base rectangle color
  noStroke();
  fill(b.color);
  rect(b.x, baseY, b.w, b.h);

  
  push();//changes do not affect subsequent drawing outside this function
  blendMode(MULTIPLY);//switch blend mode so new drawing multiplies color values of what's already there

  //slightly darker color on the right
  const shadowColor = color(0, 0, 0, 200); //transparent black

  //vertical gradient from left→right over the building
  for (let i = 0; i < b.w; i++) {
    const amt = map(i, 0, b.w, 0, 1); //0 = left, 1 = right
    const c = lerpColor(color(0, 0), shadowColor, amt);
    fill(c);
    rect(b.x + i, baseY, 1, b.h); //draw one thin strip
  }

  pop(); //restore normal blend mode
}
