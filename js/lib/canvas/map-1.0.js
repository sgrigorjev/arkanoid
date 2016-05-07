function Map( scene, size, bgcolor, linecolor, lineWidth ) {
	this.scene = scene;
	this.cellSize = size || 40;
	this.bgcolor = bgcolor || "#629ad1";
	this.linecolor = linecolor || "#a6ddff";
	this.lineWidth = lineWidth || 0.2;
};
Map.prototype.version = "1.0";
Map.prototype.getCellSize = function() {
	return this.cellSize;
};
Map.prototype.draw = function() {
	$lib.Draw(
		$lib.Shapes.Rect(
			$lib.Shapes.Point(0,0),
			this.scene.width, this.scene.height
		),
		{color:this.bgcolor, style:"fill"},
		this.scene
	);
	var x,y;
	for ( x = 0 ; x < this.scene.width ; x+=this.cellSize ) {
		for ( y = 0; y < this.scene.height ; y+=this.cellSize ) {
			$lib.Draw(
				$lib.Shapes.Rect(
					$lib.Shapes.Point(x, y),
					this.cellSize, this.cellSize
				),
				{color:this.linecolor, style:"stroke", lineWidth:this.lineWidth},
				this.scene
			);
		}
	}
};
Map.prototype.getCellByCoords = function(x, y) {
	var cell = Math.floor(x / this.cellSize);
	var row = Math.floor(y / this.cellSize);
	return [cell,row];
};