(function() {

var __version = "1.7.0";

var __requestAnimationFrame = (function( callback ){
    return window.requestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();
	
var __sysOptions = {
	context: null
};
var __drawOptions = {
	style: "stroke",
	font: "normal normal 14px Verdana",
	textAlign: "center",
	textBaseline: "middle",
	pointSize: 3
};
var __scenes = {};
var __scenes_actions = {};
var __fps_callbacks = [];
var __errors = {
	Point_unexpected_arguments: "Point constructor expect Number arguments",
	Circle_unexpected_center_argument: "Circle constructor expect param \"center\" is instance of Point",
	Circle_unexpected_radius_argument: "Circle constructor expect param \"radius\" is Number and greater than zero",
	Rect_unexpected_start_argument: "Rect constructor expect param \"start\" is instance of Point",
	Rect_unexpected_size_arguments: "Rect constructor expect params \"width\" and \"height\" is Number and greater than zero",
	Text_unexpected_axis_argument: "Text constructor expect param \"axis\" is instance of Point",
	Scene_already_exists: "Scene with the same name already exists"
};

function Lib(){
	this.version = __version;
	this.degree2rad = function( degree ){
		return (Math.PI / 180) * degree;
	};
	this.rad2degree = function( rad ){
		return (180 / Math.PI) * rad;
	};
};
Lib.prototype.requestAnimationFrame = function( callback ) {
	__requestAnimationFrame(callback);
};

var $lib = new Lib();

function Point( x, y ) {
	this.x = x;
	this.y = y;
};
function Segment( p1, p2 ) {
	this.p2 = p1;
	this.p1 = p2;
};
function Circle( center, radius, startingAngle, endingAngle ) {
	this.center = center;
	this.radius = radius;
	this.startingAngle = startingAngle;
	this.endingAngle = endingAngle;
};
function Rect( start, width, height, angle, axis ) {
	this.start = start;
	this.x = start.x;
	this.y = start.y;
	this.width = width;
	this.height = height;
	this.angle = angle;
	this.axis = axis;
};

function Shapes() {};
/**
 * @param {Number} x
 * @param {Number} y
 * @returns {Point}
 */
Shapes.prototype.Point = function( x, y ) {
	x = Number(x);
	y = Number(y);
	if ( _.isNaN(x) || _.isNaN(y) )
		throw new Error(__errors.Point_unexpected_arguments);
	return new Point(x, y);
};
/**
 * @param {Point} p1
 * @param {Point} p2
 * @returns {Segment}
 */
Shapes.prototype.Segment = function( p1, p2 ) {
	return new Segment(p1, p2);
};
/**
 * @param {Point} center
 * @param number radius
 * @param number startingAngle
 * @param number endingAngle
 * @returns {Circle}
 */
Shapes.prototype.Circle = function ( center, radius, startingAngle, endingAngle ) {
	if ( !(center instanceof Point) )
		throw new Error(__errors.Circle_unexpected_center_argument);
	
	radius = Number(radius);
	if ( _.isNaN(radius) || radius <= 0 )
		throw new Error(__errors.Circle_unexpected_radius_argument);
	
	return new Circle(center, radius, startingAngle, endingAngle);
};
/**
 * @param {Point} start
 * @param {Number} width
 * @param {Number} height
 * @param {Number} angle
 * @param {Point} axis
 * @returns {Rect}
 */
Shapes.prototype.Rect = function( start, width, height, angle, axis ) {
	if ( !(start instanceof Point) )
		throw new Error(__errors.Rect_unexpected_start_argument);
	
	width = Number(width);
	height = Number(height);
	if ( _.isNaN(width) || width <= 0 || _.isNaN(height) || height <= 0 )
		throw new Error(__errors.Rect_unexpected_size_arguments);
	
	return new Rect(start, width, height, angle, axis);
};

$lib.Shapes = new Shapes();

function Text( text, sxis ) {
	this.text = text;
	this.axis = sxis;
}
function Items() {};
/**
 * 
 * @param {String} text
 * @param {Point} axis
 * @returns {Text}
 */
Items.prototype.Text = function( text, axis ) {
	if ( typeof axis !== 'undefined') {
		if ( !(axis instanceof Point) ) {
			throw new Error(__errors.Text_unexpected_axis_argument);
		}
	} else {
		axis = new Point(0,0);
	}
	return new Text(String(text), axis);
};

$lib.Items = new Items();


function Draw( shape, options, ctx) {
	this.ctx = ctx;
	this.options = options;
	this._start();
	if ( shape instanceof Point ) {
		this.Circle(
			new Circle(shape, this.options.pointSize)
		);
	}
	else if ( shape instanceof Segment ) {
		this.Segment(shape);
	}
	else if ( shape instanceof Circle ) {
		this.Circle(shape);
	}
	else if ( shape instanceof Rect ) {
		this.Rect(shape);
	}
	else if ( shape instanceof Text ) {
		this.Text(shape);
	}
	this._finish();
};
Draw.prototype = {
	constructor: Draw,
	_start: function() {
		this.ctx.save();
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.beginPath();
		this._applyOptions();
	},
	_finish: function() {
		this.ctx.closePath();
		this.ctx.restore();
	},
	_applyOptions: function() {
		if ( "color" in this.options ) {
			this.ctx.fillStyle = this.ctx.strokeStyle = this.options.color;
		}
		if ( "lineWidth" in this.options ) {
			this.ctx.lineWidth = this.options.lineWidth;
		}
	},
	Circle: function( circle ) {
		var startingAngle = (typeof circle.startingAngle === "number") ? circle.startingAngle : 0;
		var endingAngle  = (typeof circle.endingAngle  === "number") ? circle.endingAngle  : Math.PI * 2;
		this.ctx.arc(
			circle.center.x, circle.center.y,
			circle.radius,
			startingAngle, endingAngle,
			false
		);
		if ( this.options.style === "fill") {
			this.ctx.fill();
		} else {
			this.ctx.stroke();
		}
	},
	Rect: function( rect ) {
		var argv, angle, sin, cos;
		if ( rect.axis ) {
			this.ctx.translate(rect.axis.x, rect.axis.y);
			argv = [
				-(rect.axis.x - rect.start.x), 
				-(rect.axis.y - rect.start.y), 
				rect.width, rect.height
			];
		} else {
			this.ctx.translate(rect.start.x, rect.start.y);
			argv = [0, 0, rect.width, rect.height];
		}
		if ( rect.angle ) {
			//angle = (Math.PI * 2) / rect.angle;
			//angle = (Math.PI / 180) * rect.angle;
			sin = Math.sin(rect.angle);  
			cos = Math.cos(rect.angle);  
			ctx.transform(cos, sin, -sin, cos, 0, 0);  
		}
		if ( this.options.style === "fill") {
			this.ctx.fillRect.apply(this.ctx, argv);
		} else {
			this.ctx.strokeRect.apply(this.ctx, argv);
		}
	},
	Segment: function( seg ) {
		this.ctx.moveTo(seg.p1.x, seg.p1.y);
		this.ctx.lineTo(seg.p2.x, seg.p2.y);
		this.ctx.stroke();
	},
	Text: function( text ) {
		if ( "font" in this.options ) {
			this.ctx.font = this.options.font;
		}
		if ( "textAlign" in this.options ) {
			this.ctx.textAlign = this.options.textAlign;
		}
		if ( "textBaseline" in this.options ) {
			this.ctx.textBaseline = this.options.textBaseline;
		}
		if ( this.options.style === "fill") {
			this.ctx.fillText(text.text, text.axis.x, text.axis.y);
		} else {
			this.ctx.strokeText(text.text, text.axis.x, text.axis.y);
		}
	}
};

	

function DrawManager(obj, options, context) {
	var ctx = __sysOptions.context;
	var opt = _.extend(_.extend({}, __drawOptions), options);
	if ( context instanceof Scene ) {
		ctx = context.getContext();
		opt = _.extend(opt, context.getOptions());
		context.drawOne(obj);
	}
	else if ( context instanceof CanvasRenderingContext2D ) {
		ctx = context;
	}
	return new Draw(obj, opt, ctx);
};
DrawManager.setContext = function( ctx ) {
	__sysOptions.context = ctx;
};
DrawManager.setOptions = function( options ) {
	_.extend(__drawOptions, options);
};
DrawManager.clear = function( canvas, ctx ) {
	ctx = ctx || __sysOptions.context;
	if (ctx && canvas instanceof HTMLElement && canvas.nodeName === "CANVAS" ) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
};

$lib.Draw = DrawManager;


function Resource() {
	this._cache = {};
	this._callbacks = [];
};
Resource.prototype = {
	constructor: Resource,
	__load: function( url ) {
		var self = this;
		if ( this._cache[url] ) {
			return;
		}
		this._cache[url] = false;
		var img = new Image();
		img.onload = function(){
			self._cache[url] = img;
			if ( self.isReady() ) {
				_.each(self._callbacks, function(callback){
					callback.call(null);
				});
			}
		};
		img.src = url;
	},
	load: function( list ) {
		var self = this;
		if ( !_.isArray(list) ) {
			list = [list];
		}
		_.each(list, function(url){
			self.__load(url);
		});
	},
	isReady: function() {
		var ready = true;
		_.each(this._cache, function(res){
			if ( !res ) {
				ready = false;
			}
		});
		return ready;
	},
	ready: function(callback) {
		this._callbacks.push(callback);
		if ( this.isReady() ) {
			_.each(this._callbacks, function(callback){
				callback.call(null);
			});
		}
	},
	get: function(url) {
		return this._cache[url];
	}
};

$lib.Resource = new Resource();

function Scene(id, callback, width, height) {
	this.id = id;
	this.callback = callback || function(){};
	this.width = width;
	this.height = height;
	
	this._ctx = null;
	this._options = null;
	this._parentNode = null;
	this._node = null;
	this._drawCount = 0;
	this._onDrawCallback = null;
	
	this._html = '<canvas id="' + id + '"';
	if ( typeof this.width !== 'undefined') {
		this._html += ' width="' + this.width + '"';
	}
	if ( typeof this.height !== 'undefined') {
		this._html += ' height="' + this.height + '"';
	}
	this._html += '></canvas>';
};
Scene.prototype = {
	constructor: Scene,
	appendTo: function( parent ){
		var wrapper;
		if ( this._node === null ) {
			wrapper = document.createElement("div");
			wrapper.innerHTML = this._html;
			this._node = wrapper.firstChild;
			this._ctx = this._node.getContext("2d");
		}
		if ( parent instanceof HTMLElement ) {
			this._parentNode = parent;
			this._parentNode.appendChild(this._node);
		}
		return this;
	},
	setOptions: function( options ) {
		this._options = _.extend(__drawOptions, options);
	},
	getOptions: function() {
		return this._options;
	},
	update: function( dt ) {
		this.callback.call(this, dt);
		return this;
	},
	action: function(){
		SceneManager.action(this.id, this);
		return this;
	},
	stop: function(){
		SceneManager.stop(this.id);
		return this;
	},
	onDraw: function( callback ){
		this._onDrawCallback = callback;
	},
	drawOne: function(obj){
		this._drawCount++;
		if ( _.isFunction(this._onDrawCallback) ) {
			this._onDrawCallback.call(this, this._drawCount, obj);
		}
	},
	clear: function(){
		this._ctx.clearRect(0, 0, this.width, this.height);
		this._drawCount = 0;
		return this;
	},
	remove: function(){
		this._parentNode.removeChild(this._node);
		return this;
	},
	getContext: function() {
		return this._ctx;
	}
};

var __initAction = function() {
	var _lastTime = 0;
	var _sec = 0;
	var _fps = 0;
	var action = function() {
		var	now = Date.now(),
		    dt = 0,
		    sec = 0;
		
		if ( _lastTime !== 0 ) {
			dt = (now - _lastTime) / 1000.0;
		}
		/** 
		 * Run all scenes 
		 * @param {Function} scene
		 */
		_.each(__scenes_actions, function(scene){
			scene.update(dt);
		});

		/** Count of the FPS */
		sec = Math.round(now / 1000);
		if ( _sec === sec ) {
			_fps++;
		} else {
			_.each(__fps_callbacks, function(callback){
				callback.call(null, _fps);
			});
			_fps = 1;
			_sec = sec;
		}
		_lastTime = now;
		/** Register next frame */
		__requestAnimationFrame(function(){
			action();
		});
	};
	action();
	__initAction.isInit = true;
};
__initAction.isInit = false;

var SceneManager = function(name, callback, width, height) {
	if ( name in __scenes ) {
		throw new Error(__errors.Scene_already_exists);
	}
	return __scenes[name] = new Scene(name, callback, width, height);
};
SceneManager.getContext = function( name ) {
	if ( name in __scenes ) {
		return __scenes[name].getContext();
	}
	return null;
};
SceneManager.action = function( name, scene ) {
	if ( !__initAction.isInit ) {
		__initAction();
		__initAction.isInit = true;
	}
	__scenes_actions[name] = scene;
};
SceneManager.stop = function( name ) {
	if ( name in __scenes_actions ) {
		delete __scenes_actions[name];
	}
};
SceneManager.fps = function(callback) {
	__fps_callbacks.push(callback);
};
SceneManager.clear = function( name ) {
	
};
SceneManager.remove = function( name ) {
	if ( name in __scenes ) {
		__scenes[name].stop();
		__scenes[name].remove();
	}
};
$lib.Scene = SceneManager;

function Fn() {
	
};
/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} n
 * @returns {Point}
 */
Fn.prototype.perpendicular = function( p1, p2, n ) {
	var d = new Point(0,0);
	if (p1.x === p2.x) {
		d.x = p1.x;
		d.y = n.y;
	} 
	else if (p1.y === p2.y) {
		d.x = n.x;
		d.y = p1.y;
	} else {
		d.x = (p1.x * Math.pow(p2.y - p1.y, 2) + n.x * Math.pow(p2.x - p1.x, 2) + (p2.x - p1.x) * (p2.y - p1.y) * (n.y - p1.y)) / (Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
		d.y = (((p2.x - p1.x) * (n.x - d.x)) / (p2.y - p1.y)) + n.y;
	}
	return d;
};
/**
 * 
 * @param {Point} p1 - Start of segment
 * @param {Point} p2 - End of segment
 * @param {Point} point
 * @returns {Number}
 */
Fn.prototype.pointOnSegment = function( p1, p2, point ) {
	return ( ( (point.x >= p1.x && point.x <= p2.x) || (point.x >= p2.x && point.x <= p1.x) ) &&
	  ( (point.y >= p1.y && point.y <= p2.y) || (point.y >= p2.y && point.y <= p1.y) ) );
};
/**
 * 
 * @param {Point} p1
 * @param {Point} p2
 * @returns {Number}
 */
Fn.prototype.dist = function( p1, p2 ) {
	return Math.sqrt( Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) );
};
/**
 * 
 * @param {Point} point
 * @param {Point} axis
 * @param {Number} angle
 * @returns {Point}
 */
Fn.prototype.rotatePoint = function( point, axis, angle ) {
	var x1, y1, p = $lib.Shapes.Point(0,0);
	p.x = point.x - axis.x;
	p.y = point.y - axis.y;
	x1 = p.x * Math.cos(angle) - p.y * Math.sin(angle);
	y1 = p.x * Math.sin(angle) + p.y * Math.cos(angle);
	p.x = x1 + axis.x;
	p.y = y1 + axis.y;
	return p;
};
Fn.prototype.getPointAngle = function( axis, point ) {
	return Math.atan2(point.y - axis.y, point.x - axis.x) * 180 / Math.PI;
};
Fn.prototype.getRotatePointInfo = function( axis, p1_current, p2_target ) {
	var current_degree = Math.atan2(p1_current.y - axis.y, p1_current.x - axis.x) * 180 / Math.PI;
	var target_degree = Math.atan2(p2_target.y - axis.y, p2_target.x - axis.x) * 180 / Math.PI;

	var current_degree_f = current_degree < 0 ? 360 + current_degree : current_degree;
	var target_degree_f = target_degree < 0 ? 360 + target_degree : target_degree;
	var offset_f = target_degree_f - current_degree_f;
	var c;
	
	if ( offset_f < 0 ) {
		offset_f = Math.abs(offset_f);
		c = -1;
		if ( offset_f > 180 ) {
			c = 1;
			offset_f = 360 - offset_f;
		}
	} else {
		c = 1;
		if ( offset_f > 180 ) {
			c = -1;
			offset_f = 360 - offset_f;
		}
	}
	return {
		offset: function(){ 
			return offset_f; 
		},
		currentDegree: function() {
			return current_degree_f;
		},
		targetDegree: function() {
			return target_degree_f;
		},
		getC: function() {
			return c;
		}
	};
};
Fn.prototype.intersec = function( a, b ) {
	switch (true) {
		case a instanceof Rect && b instanceof Rect:
			return this.intersecRects(a, b);
		case (a instanceof Segment && b instanceof Circle) || (a instanceof Circle && b instanceof Segment):
			return this.intersecSegmentCircle(a, b);
		case (a instanceof Rect && b instanceof Circle) || (a instanceof Circle && b instanceof Rect):
			return this.intersecRectCircle(a, b);
		default:
			console.warn("Unable to check intersections of undefined shapes");
	}
};
/**
 * 
 * @param {Circle} circle
 * @param {Segment} segment
 * @returns {Boolean}
 */
Fn.prototype.intersecSegmentCircle = function( circle, segment ) {
	var d;
	if ( this.dist(segment.p1, circle) < circle.radius || this.dist(segment.p2, circle) < circle.radius ) {
		return true;
	}
	d = this.perpendicular(segment.p1, segment.p2, circle);

	return this.pointOnSegment(segment.p1, segment.p2, d) ? this.dist(circle, d) <= circle.radius : false;
};
/**
 *
 * @param {Circle} circle
 * @param {Rect} rect
 * @returns {Boolean}
 */
Fn.prototype.intersecSegmentRect = function( circle, rect ) {

};
/**
 *
 * @param {Rect} rectA
 * @param {Rect} rectB
 * @returns {Boolean}
 */
Fn.prototype.intersecRects = function( rectA, rectB ) {
	var XColl, YColl;
	if ((rectA.x + rectA.width >= rectB.x) && (rectA.x <= rectB.x + rectB.width)) {
		XColl = true;
	}
	if ((rectA.y + rectA.height >= rectB.y) && (rectA.y <= rectB.y + rectB.height)) {
		YColl = true;
	}
	if ( XColl && YColl) {
		return true;
	}
	return false;
};
/**
 *
 * @param {Rect} rect
 * @param {Circle} circle
 * @returns {Boolean}
 */
Fn.prototype.intersecRectCircle = function( rect, circle ) {

};
/**
 *
 * @param {Rect} rect
 * @param {Rect} circle
 * @returns {Boolean}
 */
Fn.prototype.intersecRectCircle = function( rect, circle ) {

};


$lib.Fn = new Fn();


window.$lib = $lib;

	
	
	
	
	
	
	function dist( p1, p2 ) {
		return Math.sqrt( Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) );
	}

	function perpendicular( p1, p2, n) {
		var d = {x:0,y:0};

		if (p1.x === p2.x) {
			d.x = p1.x;
			d.y = n.y;
		} 
		else if (p1.y === p2.y) {
			d.x = n.x;
			d.y = p1.y;
		} else {
			d.x = (p1.x * Math.pow(p2.y - p1.y, 2) + n.x * Math.pow(p2.x - p1.x, 2) + (p2.x - p1.x) * (p2.y - p1.y) * (n.y - p1.y)) / (Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
			d.y = (((p2.x - p1.x) * (n.x - d.x)) / (p2.y - p1.y)) + n.y;
		}
		return d;
	}

	function pointOnSegment(p1,p2,point) {
		return ( ( (point.x >= p1.x && point.x <= p2.x) || (point.x >= p2.x && point.x <= p1.x) ) &&
		  ( (point.y >= p1.y && point.y <= p2.y) || (point.y >= p2.y && point.y <= p1.y) ) );
	}
	
	function pointInRect( point, rect ) {
		return (point.x >= rect.x && point.x <= (rect.x + rect.width)) && 
				(point.y >= rect.y && point.y <= (rect.y + rect.height));
	}

	function circleSegmentIntersects( circle, p1, p2) {
		var d;
		if ( dist(p1, circle) < circle.radius || dist(p2, circle) < circle.radius ) {
			return true;
		}
		d = perpendicular(p1, p2, circle);

		return pointOnSegment(p1, p2, d) ? dist(circle, d) <= circle.radius : false;
	}

	function rectIntersects( obj1, obj2 ) {
		var XColl, YColl;
		if ((obj1.x + obj1.width >= obj2.x) && (obj1.x <= obj2.x + obj2.width)) {
			XColl = true;
		}
		if ((obj1.y + obj1.height >= obj2.y) && (obj1.y <= obj2.y + obj2.height)) {
			YColl = true;
		}
		if ( XColl && YColl) {
			return true;
		}
		return false;
	}

	function rectCircleIntersects( rect, circle ) {
		if ( pointInRect(circle, rect) ) {
			return true; // Circle center inside rectangle
		}
		
	}
	
	window.lib = {
		"distance": dist,
		"perpendicular": perpendicular,
		"pointOnSegment": pointOnSegment,
		"circleSegmentIntersects": circleSegmentIntersects,
		"rectIntersects": rectIntersects,
		"rectCircleIntersects": rectCircleIntersects
	};
})();