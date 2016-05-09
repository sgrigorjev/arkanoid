define(['app/settings','app/character','canvaslib','underscore'], function (settings, character, $lib, _) {

    /**
     * Target model
     * @constructor
     */
    function Target(startPoint) {
        var self = this;

        self.width = 35;
        self.height = 35;

        self.startPoint = startPoint;

        self._points = {};
        self._shapes = {};

        self._points.p1 = $lib.Shapes.Point(self.startPoint.x - (30 / 2), self.startPoint.y - (30 / 2));
        self._points.p2 = $lib.Shapes.Point(self.startPoint.x - (40 / 2), self.startPoint.y - (30 / 2));
        self._points.p3 = $lib.Shapes.Point(self.startPoint.x - (10 / 2), self.startPoint.y - (30 / 2));

        /*
        self._points.p1 = $lib.Shapes.Point(self.startPoint.x - (15 / 2), self.startPoint.y - (5 / 2) - 15);
        self._points.p2 = $lib.Shapes.Point(self.startPoint.x - (25 / 2), self.startPoint.y - (5 / 2) - 10);
        self._points.p3 = $lib.Shapes.Point(self.startPoint.x - (35 / 2), self.startPoint.y - (5 / 2) - 5);
        self._points.p4 = $lib.Shapes.Point(self.startPoint.x - (5 / 2), self.startPoint.y - (5 / 2) - 5);
        self._points.p5 = $lib.Shapes.Point(self.startPoint.x + (35 / 2) - 5, self.startPoint.y - (5 / 2) - 5);
        self._points.p6 = $lib.Shapes.Point(self.startPoint.x - (35 / 2), self.startPoint.y - (5/ 2));
        self._points.p7 = $lib.Shapes.Point(self.startPoint.x - (15 / 2), self.startPoint.y - (5/ 2) + 5);
        self._points.p8 = $lib.Shapes.Point(self.startPoint.x + (15 / 2) - 5, self.startPoint.y - (5/ 2) + 5);
        self._points.p9 = $lib.Shapes.Point(self.startPoint.x - (25 / 2), self.startPoint.y - (5/ 2) + 10);
        self._points.p10 = $lib.Shapes.Point(self.startPoint.x - (5 / 2), self.startPoint.y - (5/ 2) + 10);
        self._points.p11 = $lib.Shapes.Point(self.startPoint.x + (25 / 2) - 5, self.startPoint.y - (5/ 2) + 10);
        */

        self.base = self._points.p2;

        self.leftPos = self.base.x;
        self.rightPos = self.base.x + self.width;

        self.indentLeft = 0;
        self.indentRight = 0;

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
        self._shapes.r2 = $lib.Shapes.Rect(self._points.p2, 40, 20);
        self._shapes.r3 = $lib.Shapes.Rect(self._points.p3, 10, 40);

        /*
        self._shapes.r1 = $lib.Shapes.Rect(self._points.p1, 15, 5);
        self._shapes.r2 = $lib.Shapes.Rect(self._points.p2, 25, 5);
        self._shapes.r3 = $lib.Shapes.Rect(self._points.p3, 5, 5);
        self._shapes.r4 = $lib.Shapes.Rect(self._points.p4, 5, 5);
        self._shapes.r5 = $lib.Shapes.Rect(self._points.p5, 5, 5);
        self._shapes.r6 = $lib.Shapes.Rect(self._points.p6, 35, 5);
        self._shapes.r7 = $lib.Shapes.Rect(self._points.p7, 5, 5);
        self._shapes.r8 = $lib.Shapes.Rect(self._points.p8, 5, 5);
        self._shapes.r9 = $lib.Shapes.Rect(self._points.p9, 5, 5);
        self._shapes.r10 = $lib.Shapes.Rect(self._points.p10, 5, 5);
        self._shapes.r11 = $lib.Shapes.Rect(self._points.p11, 5, 5);
        */
    };

    /**
     * Set indent to each target
     */
    Target.prototype.setIndent = function(left, right) {
        var self = this;

        self.indentLeft = left;
        self.indentRight = right;
    };

    /**
     * Updating the target position
     * @param number dt - time since previous update
     * @returns {boolean}
     */
    Target.prototype.update = function(dt) {
        var self = this,
            offset = Math.ceil(settings.target.speed * dt),
            leftLimit = self.leftPos - self.indentLeft - settings.target.shift,
            rightLimit = self.rightPos + self.indentRight + settings.target.shift,
            modified = false;

        switch (self.movesTo) {
            case 'left':
                if ((self.base.x - offset) < leftLimit) {
                    if (self.base.x > leftLimit) {
                        offset = self.base.x - leftLimit;
                    }
                    self.movesTo = 'right';
                }
                modified = self.shift(offset, 'left');
                break;
            case 'right':
                if ((self.base.x + self.width + offset) > rightLimit) {
                    if ((self.base.x + self.width) < rightLimit) {
                        offset = rightLimit - (self.base.x + self.width);
                    }
                    self.movesTo = 'left';
                }
                modified = self.shift(offset, 'right');
                break;
        }

        if (settings.target.fallFactor) {
            modified += self.shift(offset / settings.target.fallFactor, 'down');
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