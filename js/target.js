define(['app/settings','app/character','canvaslib','underscore'], function (settings, character, $lib, _) {

    /**
     * Target model
     * @constructor
     */
    function Target(startPoint) {
        var self = this;

        self.width = 33;
        self.height = 33;

        self.startPoint = startPoint;

        self._points = {};
        self._shapes = {};

        self._points.p1 = $lib.Shapes.Point(self.startPoint.x - (self.width / 2), self.startPoint.y - (self.height / 2));

        self.base = self._points.p1;

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

        self._shapes.r1 = $lib.Shapes.Rect(self._points.p1, self.width, self.height);
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

        /*
        _.each(self._shapes, function(shape){
            $lib.Draw(shape, {color: 'red', style: 'fill'}, scene);
        });
        */

        settings.target.sprite.done(function(img){
            $lib.Draw(img, {
                point: self._points.p1,
                width: self.width,
                height: self.height
            }, scene);
        });
    };

    Target.prototype.getShapes = function() {
        var self = this;

        return self._shapes;
    };

    Target.prototype.getCenter = function() {
        var self = this;

        return $lib.Shapes.Point(self.base.x + (self.width / 2), self.base.y + (self.height / 2));
    };

    return Target;
});