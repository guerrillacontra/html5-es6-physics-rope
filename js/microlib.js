//A small scaffold specifically to help me design code pen interactions

//Math extensions
Math.lerp = (first, second, percentage) => {
  return first + (second - first) * percentage;
};

Math.clamp = (value, min, max) => {
  return value < min ? min : value > max ? max : value;
};

class Vector2 {
  static zero() {
    return { x: 0, y: 0 };
  }

  static sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  static add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  static mult(a, b) {
    return { x: a.x * b.x, y: a.y * b.y };
  }

  static scale(v, scaleFactor) {
    return { x: v.x * scaleFactor, y: v.y * scaleFactor };
  }

  static mag(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  static normalized(v) {
    const mag = Vector2.mag(v);

    if (mag === 0) {
      return Vector2.zero();
    }
    return { x: v.x / mag, y: v.y / mag };
  }
}

class App {
  constructor(
    window,
    canvas,
    context,
    updateHandler,
    drawHandler,
    frameRate = 60
  ) {
    this._window = window;
    this._canvas = canvas;
    this._context = context;
    this._updateHandler = updateHandler;
    this._drawHandler = drawHandler;
    this._frameRate = frameRate;
    this._lastTime = 0;
    this._currentTime = 0;
    this._deltaTime = 0;
    this._interval = 0;
    this.onMouseMoveHandler = (x, y) => {};
    this.onMouseDownHandler = (x, y) => {};
    this.start = this.start.bind(this);
    this._onMouseEventHandlerWrapper = this._onMouseEventHandlerWrapper.bind(
      this
    );
    this._onRequestAnimationFrame = this._onRequestAnimationFrame.bind(this);
  }

  start() {
    this._lastTime = new Date().getTime();
    this._currentTime = 0;
    this._deltaTime = 0;
    this._interval = 1000 / this._frameRate;

    this._canvas.addEventListener(
      "mousemove",
      e => {
        this._onMouseEventHandlerWrapper(e, this.onMouseMoveHandler);
      },
      false
    );

    this._canvas.addEventListener(
      "mousedown",
      e => {
        this._onMouseEventHandlerWrapper(e, this.onMouseDownHandler);
      },
      false
    );

    this._onRequestAnimationFrame();
  }

  _onMouseEventHandlerWrapper(e, callback) {
    let element = this._canvas;
    let offsetX = 0;
    let offsetY = 0;

    if (element.offsetParent) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    const x = e.pageX - offsetX;
    const y = e.pageY - offsetY;

    callback(x, y);
  }

  _onRequestAnimationFrame() {
    this._window.requestAnimationFrame(this._onRequestAnimationFrame);

    this._currentTime = new Date().getTime();
    this._deltaTime = this._currentTime - this._lastTime;

    if (this._deltaTime > this._interval) {
      
      //delta time in seconds
      const dts = this._deltaTime * 0.001;
      
      this._updateHandler(dts);

      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._drawHandler(this._canvas, this._context, dts);

      this._lastTime = this._currentTime - this._deltaTime % this._interval;
    }
  }
}

export {
Vector2,
App
}
