define(['app/settings','canvaslib','underscore'], function (settings, $lib, _) {

    /**
     * Explosion model
     * @constructor
     */
    function Explosion(startPoint) {
        var self = this;

        self.width = 44;
        self.height = 44;

        self.lifetime = 0;
        self.lifetimeLimit = 400;

        self.completed = false;

        self.startPoint = startPoint;

        self._points = {};
        self._shapes = {};

        self.base = self._points.p1 = $lib.Shapes.Point(self.startPoint.x - (self.width / 2), self.startPoint.y - (self.height / 2));

        self.build();
    };

    /**
     * Explosion of the bullet details
     */
    Explosion.prototype.build = function() {
        var self = this;

        self._shapes.r1 = $lib.Shapes.Rect(self._points.p1, self.width, self.height);
    };

    /**
     * Updating the bullet position
     * @param number dt - time since previous update
     * @returns {boolean}
     */
    Explosion.prototype.update = function(dt) {
        var self = this,
            offsetMs = dt * 1000.0;

        if (!self.completed && self.lifetime + offsetMs <= self.lifetimeLimit) {
            self.lifetime = self.lifetime + offsetMs;
            return true;
        }
        self.completed = true;
        return false;
    };

    /**
     * Draw explosion
     * @param {Scene} scene
     */
    Explosion.prototype.draw = function(scene) {
        var self = this,
            img;

        _.each(self._shapes, function(shape){
            //$lib.Draw(shape, {color: 'yellow', style: 'fill'}, scene);
        });

        if (self.lifetime < self.lifetimeLimit / 2) {
            img = settings.explosion.sprite2Image;
        } else {
            img = settings.explosion.sprite1Image;
        }

        $lib.Draw(img, {
            point: self._points.p1,
            width: self.width,
            height: self.height
        }, scene);

    };

    return Explosion;
});