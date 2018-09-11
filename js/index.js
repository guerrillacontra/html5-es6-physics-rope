var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}} //linearly interpolate betwen a->b by a coefficient
var lerp = function lerp(first, second, percentage) {
  return first + (second - first) * percentage;
};

//used for all vector operations
var Vector2 = function () {_createClass(Vector2, null, [{ key: "zero", value: function zero()
    {
      return new Vector2(0, 0);
    } }, { key: "sub", value: function sub(

    a, b) {
      return new Vector2(a.x - b.x, a.y - b.y);
    } }, { key: "add", value: function add(

    a, b) {
      return new Vector2(a.x + b.x, a.y + b.y);
    } }, { key: "mult", value: function mult(

    a, b) {
      return new Vector2(a.x * b.x, a.y * b.y);
    } }, { key: "scale", value: function scale(

    v, scaleFactor) {
      return new Vector2(v.x * scaleFactor, v.y * scaleFactor);
    } }, { key: "mag", value: function mag(

    v) {
      return Math.sqrt(v.x * v.x + v.y * v.y);
    } }, { key: "normalized", value: function normalized(

    v) {
      var mag = Vector2.mag(v);

      if (mag === 0) {
        return Vector2.zero();
      }
      return new Vector2(v.x / mag, v.y / mag);
    } }]);

  function Vector2() {var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;_classCallCheck(this, Vector2);
    this.x = x;
    this.y = y;
    this.clone = this.clone.bind(this);
  }_createClass(Vector2, [{ key: "clone", value: function clone()

    {
      return new Vector2(this.x, this.y);
    } }]);return Vector2;}();


//each rope part is one of these
//uses a high precison varient of Störmer–Verlet integration
//to keep the simulation consistant otherwise it would "explode"!
var RopePoint = function () {
  function RopePoint(initialPos, distanceToNextPoint) {_classCallCheck(this, RopePoint);
    this.pos = initialPos;
    this.distanceToNextPoint = distanceToNextPoint;
    this.isFixed = false;
    this.oldPos = initialPos.clone();
    this.velocity = Vector2.zero();
    this.mass = 1.0;
    this.damping = 1.0;
    this.prev = null;
    this.next = null;

    this.integrate = this.integrate.bind(this);
    this.applyConstrains = this.applyConstrains.bind(this);
  }

  //integrates motion equations per node without taking into account relationship
  //with other nodes...
  _createClass(RopePoint, [{ key: "integrate", value: function integrate(gravity, dt, previousFrameDt) {
      if (!this.isFixed) {
        this.velocity = Vector2.sub(this.pos, this.oldPos);
        this.oldPos = this.pos.clone();

        //drastically improves stability
        var timeCorrection = previousFrameDt != 0.0 ? dt / previousFrameDt : 0.0;

        var accel = Vector2.add(gravity, new Vector2(0, this.mass));

        this.pos.x =
        this.pos.x +
        this.velocity.x * timeCorrection * this.damping +
        accel.x * Math.pow(dt, 2);

        this.pos.y =
        this.pos.y +
        this.velocity.y * timeCorrection * this.damping +
        accel.y * Math.pow(dt, 2);
      } else {
        this.velocity = Vector2.zero();
        this.oldPos = this.pos.clone();
      }
    }

    //apply constraints related to other nodes next to it
    //(keeps each node within distance)
  }, { key: "applyConstrains", value: function applyConstrains() {
      if (this.next) {
        var delta = Vector2.sub(this.next.pos, this.pos);
        var len = Vector2.mag(delta);
        var diff = len - this.distanceToNextPoint;
        var normal = Vector2.normalized(delta);

        if (!this.isFixed) {
          this.pos.x += normal.x * diff * 0.25;
          this.pos.y += normal.y * diff * 0.25;
        }

        if (!this.next.isFixed) {
          this.next.pos.x -= normal.x * diff * 0.25;
          this.next.pos.y -= normal.y * diff * 0.25;
        }
      }
      if (this.prev) {
        var _delta = Vector2.sub(this.prev.pos, this.pos);
        var _len = Vector2.mag(_delta);
        var _diff = _len - this.distanceToNextPoint;
        var _normal = Vector2.normalized(_delta);

        if (!this.isFixed) {
          this.pos.x += _normal.x * _diff * 0.25;
          this.pos.y += _normal.y * _diff * 0.25;
        }

        if (!this.prev.isFixed) {
          this.prev.pos.x -= _normal.x * _diff * 0.25;
          this.prev.pos.y -= _normal.y * _diff * 0.25;
        }
      }
    } }]);return RopePoint;}();


//manages a collection of rope points and executes
//the integration
var Rope = function () {_createClass(Rope, null, [{ key: "generate",
    //generate an array of points suitable for a dynamic
    //rope contour
    value: function generate(start, end, resolution, mass, damping) {
      var delta = Vector2.sub(end, start);
      var len = Vector2.mag(delta);

      var points = [];
      var pointsLen = len / resolution;

      for (var _i = 0; _i < pointsLen; _i++) {
        var percentage = _i / (pointsLen - 1);

        var lerpX = lerp(start.x, end.x, percentage);
        var lerpY = lerp(start.y, end.y, percentage);

        points[_i] = new RopePoint(new Vector2(lerpX, lerpY), resolution);
        points[_i].mass = mass;
        points[_i].damping = damping;
      }

      //Link nodes into a doubly linked list
      for (var _i2 = 0; _i2 < pointsLen; _i2++) {
        var prev = _i2 != 0 ? points[_i2 - 1] : null;
        var curr = points[_i2];
        var next = _i2 != pointsLen - 1 ? points[_i2 + 1] : null;

        curr.prev = prev;
        curr.next = next;
      }

      points[0].isFixed = points[points.length - 1].isFixed = true;

      return points;
    } }]);

  function Rope(points, solverIterations) {_classCallCheck(this, Rope);
    this._points = points;
    this.update = this.update.bind(this);
    this._prevDelta = 0;
    this._solverIterations = solverIterations;

    this.getPoint = this.getPoint.bind(this);
  }_createClass(Rope, [{ key: "getPoint", value: function getPoint(

    index) {
      return this._points[index];
    } }, { key: "update", value: function update(

    gravity, dt) {
      for (var _i3 = 0; _i3 < this._points.length; _i3++) {
        var point = this._points[_i3];

        var accel = Vector2.zero();

        if (!point.isFixed) {
          accel = gravity.clone();
        }
        point.integrate(accel, dt, this._prevDelta);
      }

      for (var iteration = 0; iteration < this._solverIterations; iteration++) {
        for (var _i4 = 0; _i4 < this._points.length; _i4++) {
          var _point = this._points[_i4];
          if (!_point.isFixed) {
            _point.applyConstrains();
          }
        }}

      this._prevDelta = dt;
    } }]);return Rope;}();


//APP SETUP!

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var args = {
  start: { x: 100, y: canvas.height / 2 },
  end: { x: canvas.width - 100, y: canvas.height / 2 },
  resolution: 8,
  mass: 1,
  damping: 0.8,
  gravity: new Vector2(0, 3000),
  solverIterations: 600,
  ropeColour: "#ffffffff" };


var points = Rope.generate(
args.start,
args.end,
args.resolution,
args.mass,
args.damping);


var rope = new Rope(points, args.solverIterations);

var onClick = function onClick(e) {
  var element = canvas;
  var offsetX = 0,
  offsetY = 0;

  if (element.offsetParent) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while (element = element.offsetParent);
  }

  x = e.pageX - offsetX;
  y = e.pageY - offsetY;

  var point = rope.getPoint(0);
  point.pos.x = x;
  point.pos.y = y;
};

//render a rope using the verlet points
var draw = function draw() {
  for (i = 0; i < points.length; i++) {
    var p = points[i];

    var prev = i > 0 ? points[i - 1] : null;

    if (prev) {
      context.beginPath();
      context.moveTo(prev.pos.x, prev.pos.y);
      context.lineTo(p.pos.x, p.pos.y);
      context.lineWidth = 4;
      context.strokeStyle = args.ropeColour;
      context.stroke();
    }
  }
};

var tick = function tick(dt) {
  rope.update(args.gravity, dt);

  //lower alphg = more blur!
  context.fillStyle = "#00000044";
  context.fillRect(0, 0, canvas.width, canvas.height);

  draw();
};

//basic js game loop with stability control
var initGameLoop = function initGameLoop(ticker, interval) {
  var lastTime = new Date().getTime();
  var currentTime = 0;
  var delta = 0;

  function gameLoop() {
    window.requestAnimationFrame(gameLoop);

    currentTime = new Date().getTime();
    delta = currentTime - lastTime;

    if (delta > interval) {
      var dt = delta * 0.001;

      ticker(dt);

      lastTime = currentTime - delta % interval;
    }
  }
  gameLoop();
};

var frameRate = 1000 / 60; //60fps
initGameLoop(tick, frameRate);
canvas.addEventListener("mousemove", onClick, false);