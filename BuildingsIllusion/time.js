//private scope, so variable here don't leak to global scope
(function () {//IIFE (I-mmediately I-nvoked F-unction E-xpression) 
  
  const SECOND_MS = 1000;//how long each "second" glows (ms)

  //how long the final (60th) glow should last -> very large so it appears permanent
  const FINAL_GLOW_MS = 1e12;//big number, so 60th glow never ends

  //true = clicks start the 60s clock.
  const CLOCK_MODE_ENABLED = true;

  //reference to the original global startPropagation function (don't wanna lose it)
  const _origStartPropagation = (typeof startPropagation === 'function') ? startPropagation : null;

  //helper to get rhombus by ring+index (reuse the same helper in domino.js if available)
  function _getRhombus(ring, idx) {//define helper that returns rhombus object for (ring,idx)
    if (typeof getRhombusByRingIndex === 'function') {//if domino.js provided the helper getRhombusByRingIndex, use it...
      return getRhombusByRingIndex(ring, idx);//...return its results right away
    }
    //fallback scan if helper not present for some reason
    for (let r of RHOMBUSES) { //loop through global RHOMBUSES array
      if (r.ring === ring && r.indexInRing === idx) return r;//return 1st matching rhombus object
    }
    return null;//if not found, return null
  }

  //start 60-second propagation from the clicked rhombus
  function startClockFrom(startRh) { //define function that schedules 60 second timed activations 
	 //if rhombus is invalid/missing ringCount, do nothing
    if (!startRh || typeof startRh.ringCount !== 'number') return; 

    const ring = startRh.ring; //read ring id from clicked rhombus
    const ringCount = startRh.ringCount; //number of rhombuses in that ring
    const dir = startRh.direction; // 1 or -1 (direction of propagation)
    const startIndex = startRh.indexInRing; //starting index inside ring

    //schedule 60 activations (seconds)
    for (let k = 0; k < 60; k++) {//loop k=0..59, so each iteration represents 1 second
      const delay = k * SECOND_MS;//delay in "ms" (k seconds after now)
      ((step, delayMs) => {//IIFE to capture step & delayMs values for the setTimeout callback
        setTimeout(() => {//schedule callback to run after delayMs milliseconds 
			 //find targetIndex around ring, wrapped with modulo so it loops right
          const targetIndex = (startIndex + dir * step + ringCount) % ringCount;
          const targetRh = _getRhombus(ring, targetIndex); //get actual rhombus object for that ring + index
          if (!targetRh) return;//if rhombus not found, stop
          //mark glowStart so rhombus.draw uses it
          targetRh.glowStart = millis();
          //normal seconds glow for steps 0..58
          if (step < 59) { //for 1st 59 steps, give a normal 2nd-long glow
            targetRh.glowDuration = SECOND_MS;//set glowDuration to 1000ms (standard)
          } else {
            //final (60th) step: make it stay glowing by setting a very large duration
            targetRh.glowDuration = FINAL_GLOW_MS;
            //ensure glowStart is "now" so it shows immediately
            targetRh.glowStart = millis();//reset glowStart again (immediate effect for final glow)
          }
        }, delayMs);
      })(k, delay);//immediately invoke IIFE with current values of k & delay to freeze them for setTimeout
    }
  }

  //wrap/override the existing startPropagation so normal behavior is preserved
  //but clicking starts the 60s clock when CLOCK_MODE_ENABLED.
  if (typeof startPropagation === 'function') {//if existing startPropagation exists (from domino.js)...
    startPropagation = function (startRh) { //...override global startPropagation with wrapper function
      if (CLOCK_MODE_ENABLED && startRh) {//if clock mode is enabled & there's a valid rhombus...
        startClockFrom(startRh);//...start the 60s clock behavior
      } else if (_origStartPropagation) {//otherwise...
        //fallback to original behaviour
        _origStartPropagation(startRh);//...call original startPropagation so behavior is preserved
      }
    };
  } else {
    //if startPropagation doesn't exist (that would be weird), expose the clock function
    window.startClockFrom = startClockFrom;
  }

  window.startClockAt = function (ring, indexInRing) {//provide a function on window to start by ring/index
    const rh = _getRhombus(ring, indexInRing); //use helper to locate the rhombus object
    if (rh) startClockFrom(rh);//if it's found, start the clock from that rhombus
  };

})();//end IIFE & immediately execute it, making the behavior now
