# html5-es6-physics-rope
An interactive 2D (canvas) rope all made with ES6 and contains vector operations, stabilized Verlet integration and motion blur.

You can preview and interact with this on CodePen:

https://codepen.io/guerrillacontra/pen/XPZeww

Notes:

x The Verlet integration takes into account previous delta time which will allow the rope to become stable with fewer solver iterations.

x As it is just standard ES6, you should be able to use the rope system and extend it (add collisions etc) just by taking the bits you need and linking it together. The parts you want are the Vector2, RopePoint and Rope classes.

x The rendering is decoupled into it's own draw function, which means if you do use the rope in another project you can renderit however you like :)

![Preview](https://github.com/guerrillacontra/html5-es6-physics-rope/blob/master/preview.PNG)
