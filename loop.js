var TARGET_FPS = 30;
var MAXIMUM_FRAME_TIME = 250; // this is the maximum amount of time (in milliseconds) that a frame is allowed to take
var FIXED_TIME_STEP = (1 / 30) * 1000; // this is not dependent on TARGET_FPS (e.g. 1/30 is valid too, even if TARGET_FPS == 60)
var TIME_SCALE = 1;

var PREFERRED_WIDTH = 450;
var PREFERRED_HEIGHT = 650;

var canvas;

var loop = {
    before: 0,
    accumulated: 0,
    t: 0,
    updateables: [],
    drawables: []
}

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

var SpriteAnimation = function(data) {
    this.load(data);
};

SpriteAnimation.prototype = {
    _frames: [],
    _frame: null,
    _frameDuration: 0,
    _isAnimating: false,

    isContinuous: false,

    isAnimating: function() {
        return this._isAnimating;
    },

    begin: function() {
        this._isAnimating = true;
    },

    pause: function() {
        this._isAnimating = false;
    },

    reset: function() {
        this._frameIndex = 0;
        this._frameDuration = this._frames[0].time;
    },

    load: function(data) {
        this._frames = data;
        this._frameIndex = 0;
        this._frameDuration = data[0].time;
    },

    advance: function(deltaTime) {
        if (!this._isAnimating) {
            return;
        }

        this._frameDuration -= deltaTime;

        if(this._frameDuration <= 0) {
            this._frameIndex++;
            if(this._frameIndex == this._frames.length) {
                this._frameIndex = 0;

                if (this.onAnimationEnd) {
                    this.onAnimationEnd();

                    if (!this.isContinuous) {
                        this._isAnimating = false;
                    }
                }
            }

            this._frameDuration = this._frames[this._frameIndex].time;
        }
    },

    getSprite: function() {
        return this._frames[this._frameIndex].sprite;
    }
};

function lerpPoint(a, b, t) {
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t)
    };
}

function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

function degreesToRadians(degrees) {
    return (Math.PI / 180) * degrees;
}

function getCursorPosition(canvas, event) {
    var x, y;

    canoffset = $(canvas).offset();

    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

    return {
        x: x,
        y: y
    }
}

function start() {
    canvas = document.getElementById("calcutta");

    var context = canvas.getContext("2d");

    canvas.width = PREFERRED_WIDTH;
    canvas.height = PREFERRED_HEIGHT;

    loop.init();

    setInterval(function() {
      loop.update();
      loop.draw(context);
    }, 1000 / TARGET_FPS);
}

loop.init = function() {
    this.t = 0;
    this.before = new Date().getTime();
    this.accumulated = FIXED_TIME_STEP;
}

loop.update = function() {
    var now = new Date().getTime();
    var frameTime = now - this.before;

    if (frameTime > MAXIMUM_FRAME_TIME) {
        console.log("frame took too long: " + frameTime + "ms");
        frameTime = MAXIMUM_FRAME_TIME;
    }

    this.before = now;
    this.accumulated += frameTime;

    var timeScaleAdjustedStepTime = FIXED_TIME_STEP * TIME_SCALE;

    while (this.accumulated >= FIXED_TIME_STEP) {
        for (var i in this.updateables) {
            var updateable = this.updateables[i];
            
            if (!updateable.disabled) { 
                if (updateable.step) {
                    updateable.step(timeScaleAdjustedStepTime);
                }
            }
        }

        this.t += timeScaleAdjustedStepTime;
        this.accumulated -= FIXED_TIME_STEP;
    }

    var alpha = this.accumulated / FIXED_TIME_STEP;

    for (var i in this.updateables) {
        var updateable = this.updateables[i];

        if (!updateable.disabled) {
            if (updateable.animate) {
                updateable.animate(alpha);
            }
        }
    }
}

loop.draw = function(context) {
    clear(context, "rgb(233, 238, 229)");

    for (var i in this.drawables) {
        var drawable = this.drawables[i];

        if (!drawable.hidden) {
            if (drawable.draw) {
                drawable.draw(context);
            }
        }
    }
}

function clear(context, style) {
    context.globalAlpha = 1.0;
    
    // hack to get rid of previously drawn lines
    context.beginPath();
    context.closePath();

    context.fillStyle = style;
    context.fillRect(0, 0, PREFERRED_WIDTH, PREFERRED_HEIGHT);
}