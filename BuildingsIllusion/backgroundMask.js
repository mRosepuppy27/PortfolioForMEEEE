//bgMaskG = second invisible canvas stacked over the main one. So, we draw the night sky...
//...into this buffer, erase holes where buildings are, then draw the buffer on top of everything
let _bgMaskG = null; //hold separate drawing surface (made by p5.js (createGraphics))

function initBackgroundMask() {
  //create graphics buffer matching canvas size
  _bgMaskG = createGraphics(width, height);
  _bgMaskG.pixelDensity(1); //make sure drawing into buffer is consistent across screens
  _rebuildBgMask();//fill buffer with night sky, then erase building shapes out of it
}

function onResizeBackgroundMask() {//rebuild mask when browser window resizes 
  if (_bgMaskG) { //if window is resized...
    _bgMaskG.remove(); //...remove bgMaskG (free previous buffer)...
  }
  _bgMaskG = createGraphics(width, height); //..so, create new buffer with updated width/height values
  _bgMaskG.pixelDensity(1);
  _rebuildBgMask();//draw sky + rebuilds "holes"
}

//draw the masked background layer on top of the canvas.
//call this from your main draw() loop, so it draws the buffer (backgroundMask) over the main scene
function drawBackgroundMask() {//if no buffer exists, do nothing 
  if (!_bgMaskG) return;
  //draw the buffer, so buffer contains sky everywhere, but transparent holes where buildings are
  image(_bgMaskG, 0, 0);//so when placed on top of everything else it will leave buildings visible
}

//draw sky onto the buffer & erase building rectangles
function _rebuildBgMask() {//if buffer doesn't exist, stop 
  if (!_bgMaskG) return;

  const g = _bgMaskG;//"g" will represent the buffer "bgMaskG"
  g.push(); //start new drawing state for buffer
  g.clear(); //make entire buffer transparent 

  //draw night sky gradient into buffer (same as drawNightSky)
  const topCol = color(18, 28, 48);
  const botCol = color(5, 10, 20);

  g.noStroke();
  //draw gradient with thin horizontal strips (same look as main canvas)
  for (let y = 0; y < height; y += 4) {
    let t = map(y, 0, height, 0, 1);
    let c = lerpColor(topCol, botCol, t); //each strip gradually shifts color (vertical gradient)
    g.fill(c);
    g.rect(0, y, width, 4);
  }

  //erase the building rectangles so those areas become transparent in the buffer
  if (Array.isArray(buildings) && buildings.length > 0) {//only erase holes if buildings exist 
    //use graphics context's erase() to create transparent holes
    g.erase(); //switch drawing mode, so anything drawn now becomes transparent instead of colored
    for (let b of buildings) { //loop through every building 
      const baseY = height - b.h;//draw building's rectangles in erase mode, so they cut "holes" into the sky gradient
      g.rect(b.x, baseY, b.w, b.h);//draw the same rectangle we draw for each building
    }
    g.noErase();//stop erasing & go back to normal 
  }

  g.pop(); //go back to normal buffer's drawing state
}
