define(['app/settings','app/character','canvaslib','underscore'], function (settings, character, $lib, _) {

    /**
     * Target model
     * @constructor
     */
    function Target(startPoint) {
        var self = this;

        self.width = 40;
        self.height = 40;

        self.startPoint = startPoint;

        self._points = {};
        self._shapes = {};

        self._points.p1 = $lib.Shapes.Point(self.startPoint.x - (30 / 2), self.startPoint.y - (30 / 2));
        self._points.p2 = $lib.Shapes.Point(self.startPoint.x - (40 / 2), self.startPoint.y - (10 / 2));
        self._points.p3 = $lib.Shapes.Point(self.startPoint.x - (10 / 2), self.startPoint.y - (40 / 2));

        self.base = self._points.p2;

        self.leftPos = self._points.p2.x;
        self.rightPos = self._points.p2.x + self.width;

        self.movesTo = 'right';

        self.build();
    };

    _.extend(Target.prototype, character);

    /**
     * Build of the target details
     */
    Target.prototype.build = function() {
        var self = this;

        self._shapes.r1 = $lib.Shapes.Rect(self._points.p1, 30, 30);
        self._shapes.r2 = $lib.Shapes.Rect(self._points.p2, 40, 10);
        self._shapes.r3 = $lib.Shapes.Rect(self._points.p3, 10, 40);
    };

    /**
     * Updating the target position
     * @param number dt - time since previous update
     * @returns {boolean}
     */
    Target.prototype.update = function(dt) {
        var self = this,
            offset = Math.ceil(settings.target.speed * dt),
            leftLimit = self.leftPos - settings.target.shift,
            rightLimit = self.rightPos + settings.target.shift,
            modified = false;

        switch (self.movesTo) {
            case 'left':
                if ((self.base.x - offset) < leftLimit) {
                    if (self.base.x > leftLimit) {
                        modified = self.shift(self.base.x - leftLimit, 'left');
                    }
                    self.movesTo = 'right';
                } else {
                    modified = self.shift(offset, 'left');
                }
                break;
            case 'right':
                if ((self.base.x + self.width + offset) > rightLimit) {
                    if ((self.base.x + self.width) < rightLimit) {
                        modified = self.shift(rightLimit - (self.base.x + self.width), 'right');
                    }
                    self.movesTo = 'left';
                } else {
                    modified = self.shift(offset, 'right');
                }
                break;
        }

        if (modified) {
            self.build();
        }

        return !!modified;
    };

    /**
     * Draw target
     * @param {Scene} scene
     */
    Target.prototype.draw = function(scene) {
        var self = this;

        _.each(self._shapes, function(shape){
            $lib.Draw(shape, {color: 'blue', style: 'fill'}, scene);
        });
    };

    Target.prototype.getShapes = function() {
        var self = this;

        return self._shapes;
    };

    return Target;
});