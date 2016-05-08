define(['app/settings','app/character','canvaslib','underscore'], function (settings, character, $lib, _) {

    /**
     * Bullet model
     * @constructor
     */
    function Bullet(startPoint) {
        var self = this;

        self.width = 5;
        self.height = 15;

        self.startPoint = startPoint;

        self._points = {};
        self._shapes = {};

        self.base = self._points.p1 = $lib.Shapes.Point(self.startPoint.x - (self.width / 2), self.startPoint.y - self.height);

        self.build();
    };

    _.extend(Bullet.prototype, character);

    /**
     * Building of the bullet details
     */
    Bullet.prototype.build = function() {
        var self = this;

        self._shapes.r1 = $lib.Shapes.Rect(self._points.p1, self.width, self.height);
    };

    /**
     * Updating the bullet position
     * @param number dt - time since previous update
     * @returns {boolean}
     */
    Bullet.prototype.update = function(dt) {
        var self = this,
            offset = settings.bullet.speed * dt,
            modified = false;

        if ((self.base.y - offset) < 0) {
            if (self.base.y > 0) {
                modified = self.shift(self.base.y, 'up');
            }
        } else {
            modified = self.shift(offset, 'up');
        }

        if (modified) {
            self.build();
        }

        return !!modified;
    };

    /**
     * Draw bullet
     * @param {Scene} scene
     */
    Bullet.prototype.draw = function(scene) {
        var self = this;

        _.each(self._shapes, function(shape){
            $lib.Draw(shape, {color: 'red', style: 'fill'}, scene);
        });
    };

    Bullet.prototype.intersec = function(shapeA) {
        var self = this,
            isIntersec = false;

        _.each(self._shapes, function(shapeB){
            if ($lib.Fn.intersec(shapeA, shapeB)) {
                return isIntersec = true;
            }
        });
        
        return isIntersec;
    };

    return Bullet;
});