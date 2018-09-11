A Pen created at CodePen.io. You can find this one at https://codepen.io/guerrillacontra/pen/XPZeww.

 A quick verlet integration system using HTML5 canvas and a custom ES6 physics engine.

Move your mouse around and one of the rope ends will follow as if you were pulling on it.

Uses a custom Verlet physics system to integrate a semi-stable doubly-linked list of rope points.

These points will have motion equations applied so they are affected by gravity, then constrained to keep them in line (literally!).

Down at the bottom you will see a config object called "args", you can improve performance (at the cost of quality) by increasing the resolution factor and number of iterations.