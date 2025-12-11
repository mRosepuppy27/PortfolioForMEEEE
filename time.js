const layers = 24; //one layer per hour
let pal = []; //color palette for layers
let fossils = []; //array to store fossil objects 

function setup() {
	createCanvas(600, 600); 
	noStroke();

  pal = [ // palette for colors of layers (repeats if needed)
    '#0B0C2A','#11133A','#161948','#1C1E56','#232562','#3B3F75', //midnight, late night, late night, early pre-dawn, pre-dawn, dawn
    '#6B5D8C','#D3A074','#EBC17D','#A7D6F5','#77C6F2','#5AB9F0', //sunrise, early morning, morning, late morning, day, day
    '#4AA7E8','#51B0E3','#5BA9DD','#6FB3DB','#8E9AD5','#F3A46B', //noon, afternoon, afternoon, late afternoon, early evening, sunset
    '#F5876E','#C56791','#594C8A','#302E6B','#1E1B47','#121332' //dusk, twilight, early night, night, late night, pre-midnight
  ];
	
}

function draw() {
	background(30); //dark background because it will make later bright colors stand out more
	let h = height / layers //height per layer
	let hNow = hour(); //current hour
	let mNow = minute(); //current minute
	let sNow = second(); //current second

	for (let i = 0; i < layers; i++){ //loop 24 times, once for each layer (i = layer index)
		let y = height - (i + 1) * h; //find y-positions of layers to know where to draw layers from bottom up 
		fill(pal[i % pal.length]); //make sure that "i" doesn't get any value bigger than what the array has (the array's "length")
		rect(0, y, width, h); //make the layer here; starts at position-x (0=bottom of canvas), position-y (already calculated), width (length of canvas), h (height of strip=25pixels)
	}

	let layerY = height - (hNow + 1) * h; //find y-position for current hour's layer
	let depositHeight = map(mNow, 0, 59, 0, h); 
	fill(255, 255, 255, 70); // draw the active deposit with subtle lighter overlay; makes layer change easier to see (so, this is just the color part)
	rect(0, layerY + (h - depositHeight), width, depositHeight); //top portion on top of layer grows down from the top edge of the layer (because depositing layers goes from top to bottom)

  // Draw small "sediment grains" falling into the current layer each second
  // (these will become fossils when they land)
  if (frameCount % 15 === 0) { //this is true every 15 frames; so, if the drawing goes for 60fps, it's 4 times per second (60/15=4); i didn't want to spawn a new grain every single frame
    let gx = random(20, width - 20); //pick a horizontal position somewhere inside the canvas, but it's 20px margin on each side
    let gy = layerY + random(0, depositHeight || 4); //same as above, but vertical; "depositHeight || "4"=use depositHeight unless it's false, in which case use 4; this makes random(0,0) impossible
    fossils.push({x: gx, y: gy, age: 0, layer: hNow}); //new fossil with x,y position & age:0 ------- layer: hNow, makes sure the fossils show up in the current time's layer
  }
	
  //update & draw fossils
  // "for loop" = go backwards in the fossils array because i need to splice (remove) things sometimes.I don't wanna loop forward/remove item because the index will shift & maybe skip items or cause problems
  for (let i = fossils.length - 1; i >= 0; i--) {  
    let f = fossils[i]; // picks up a reference to the current fossil object 
    // age increases each frame; older fossils fade and sink a bit visually
    f.age++; //increase age by 1 per frame; older fossils have bigger age
    // embed them more the older they are (alpha decreases slowly)
    let alpha = map(f.age, 0, 600, 220, 20); //when age is 0, it's like 220 visible; when age is 600frames (10seconds at 60fps) it's like 20% opacity, so fossils fade as they get older
    fill(30, 30, 40, alpha); //dark color
    ellipse(f.x, f.y + f.age * 0.002 * (f.layer + 1), 6, 6); //fossil shape; everything but "6,6" offsets the fossil downward over time depending on the fossil's layer. It's sinking, so older ones will be faded and lower 
																				 //f.layer + 1 means fossils in higher numbered layers sink a bit more
	  
	    // remove very old fossils so array does not grow without bound
    if (f.age > 1800) fossils.splice(i, 1); //after 1800frames (30seconds at 60fps) i remove old fossils from array. the splice does that
  }										  //f.age will count the frames (not seconds)
}
