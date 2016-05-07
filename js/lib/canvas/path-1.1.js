var Path = function( p1, p2, options ) {
	this.p1 = p1;
	this.p2 = p2;
	this.options = _.extend({
		speed: 200,
		color: "#3c3c3c",
		lineWidth: 5,
		circleRadius: 6,
		actionScene: null,
		staticScene: null
	}, options);

	this._defer = $.Deferred();

	this.dist = $lib.Fn.dist(this.p1, this.p2);
	this.angle = $lib.Fn.getPointAngle(this.p1, this.p2);
	this._segment = null;
	this._circle = null;

	this._dist = this.options.circleRadius;
	this._step = null;
	if (p1.x !== p2.x || p1.y !== p2.y) {
		this._step = "path";
		this._segment = $lib.Shapes.Segment(this.p1, this.p2);
		this._tmp_p1 = $lib.Shapes.Point(this.p1.x + this.options.circleRadius, this.p1.y);
		this._tmp_p1 = $lib.Fn.rotatePoint(
			this._tmp_p1,
			this.p1,
			$lib.degree2rad(this.angle)
		);
	} else {
		this._step = "circle";
	}
	this._tmp_p2 = $lib.Shapes.Point(this.p1.x, this.p1.y);
};
Path.prototype.version = "1.0";
Path.prototype.update = function( p2 ) {
	this.p2 = p2;
	this.dist = $lib.Fn.dist(this.p1, this.p2);
	this.angle = $lib.Fn.getPointAngle(this.p1, this.p2);
	this._tmp_p1 = $lib.Shapes.Point(this.p1.x + this.options.circleRadius, this.p1.y);
	this._tmp_p1 = $lib.Fn.rotatePoint(
		this._tmp_p1,
		this.p1,
		$lib.degree2rad(this.angle)
	);
	this._step = "path";
};
Path.prototype.draw = function( dt ) {
	switch(this._step) {
		case "path":
			this._dist += this.options.speed * dt;
			if ( this._dist >= (this.dist - this.options.circleRadius) ) {
				this._dist = this.dist - this.options.circleRadius;
				this._step = "circle";
			}
			this._tmp_p2.x = this.p1.x + this._dist;
			this._segment.p1 = this._tmp_p1;
			this._segment.p2 = $lib.Fn.rotatePoint(
				this._tmp_p2,
				this.p1,
				$lib.degree2rad(this.angle)
			);
			$lib.Draw(
				this._segment, 
				{color:this.options.color, lineWidth:this.options.lineWidth}, 
				this.options.actionScene
			);
			if ( false && this._step === "circle" ) {
				$lib.Draw(
					this._segment, 
					{color:this.options.color, lineWidth:this.options.lineWidth}, 
					this.options.staticScene
				);
			}
			break;
		case "circle":
			this._circle = $lib.Shapes.Circle(this.p2, this.options.circleRadius);
			$lib.Draw(
				this._circle, 
				{color:this.options.color, style:"stroke", lineWidth:this.options.lineWidth}, 
				this.options.staticScene
			);
			this._step = "done";
			break;
		case "done":
			this._defer.resolve(this);
			this._step = null;
			break;
		case "moveTo":
			break;
	}
};
Path.prototype.promise = function() {
	return this._defer.promise();
};