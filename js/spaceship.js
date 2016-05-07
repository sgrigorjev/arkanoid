define(['app/settings','canvaslib','underscore'], function (settings, $lib, _) {

    /**
     * Spaceship model
     * @constructor
     */
    function Spaceship() {
        var self = this;

        /**
         *     #
         *  # ### #
         * #########
         *  ### ###
         */
        self.width = 40;
        self.height = 45;

        self.movingStartMs = 0;
        self.movesTo = null;

        self.points = {};
        self.shapes = {};

        self.points.p1 = $lib.Shapes.Point((settings.width - 5) / 2, settings.height - self.height - settings.spaceship.bottomOffset);
        self.points.p2 = $lib.Shapes.Point((settings.width - 10) / 2, settings.height - self.height + 15 - settings.spaceship.bottomOffset);
        self.points.p3 = $lib.Shapes.Point((settings.width - 30) / 2, settings.height - self.height + 20 - settings.spaceship.bottomOffset);
        self.points.p4 = $lib.Shapes.Point(((settings.width - 5) / 2) - 30, settings.height - self.height + 20 - settings.spaceship.bottomOffset);
        self.points.p5 = $lib.Shapes.Point(((settings.width - 5) / 2) + 30, settings.height - self.height + 20 - settings.spaceship.bottomOffset);
        self.points.p6 = $lib.Shapes.Point((settings.width - 90) / 2, settings.height - self.height + 25 - settings.spaceship.bottomOffset);
        self.points.p7 = $lib.Shapes.Point((settings.width - 40) / 2, settings.height - self.height + 30 - settings.spaceship.bottomOffset);
        self.points.p8 = $lib.Shapes.Point((settings.width - 50) / 2, settings.height - self.height + 35 - settings.spaceship.bottomOffset);
        self.points.p9 = $lib.Shapes.Point(((settings.width - 30) / 2) - 20, settings.height - self.height + 40 - settings.spaceship.bottomOffset);
        self.points.p10 = $lib.Shapes.Point(((settings.width - 30) / 2) + 20, settings.height - self.height + 40 - settings.spaceship.bottomOffset);

        self.base = self.points.p7;

        self.build();
    };

    /**
     * Building of the spaceship details
     */
    Spaceship.prototype.build = function() {
        var self = this;

        self.shapes.r1 = $lib.Shapes.Rect(self.points.p1, 5, 15);
        self.shapes.r2 = $lib.Shapes.Rect(self.points.p2, 10, 5);
        self.shapes.r3 = $lib.Shapes.Rect(self.points.p3, 30, 5);
        self.shapes.r4 = $lib.Shapes.Rect(self.points.p4, 5, 5);
        self.shapes.r5 = $lib.Shapes.Rect(self.points.p5, 5, 5);
        self.shapes.r6 = $lib.Shapes.Rect(self.points.p6, 90, 5);
        self.shapes.r7 = $lib.Shapes.Rect(self.points.p7, 40, 5);
        self.shapes.r8 = $lib.Shapes.Rect(self.points.p8, 50, 5);
        self.shapes.r9 = $lib.Shapes.Rect(self.points.p9, 30, 5);
        self.shapes.r10 = $lib.Shapes.Rect(self.points.p10, 30, 5);
    };

    /**
     * Shifting the spaceship position
     * @param {number} offset
     * @param {string} direction
     * @returns {number}
     */
    Spaceship.prototype.shift = function(offset, direction) {
        var self = this,
            shifted = 0;

        _.each(self.points, function(point){
            switch (direction) {
                case 'left' : point.x -= offset; break;
                case 'right': point.x += offset; break;
                case 'up'   : point.y -= offset; break;
                case 'down' : point.y += offset; break;
            }
            shifted++;
        });
        return shifted;
    };

    /**
     * Updating the spaceship position
     * @param number dt - time since previous update
     * @returns {boolean}
     */
    Spaceship.prototype.update = function(dt) {
        var self = this,
            nowMs = (new Date()).getTime(),
            movingMs = 0,
            speed = settings.spaceship.speed,
            offset,
            modified = false;

        /** Smoothly accelerate the spaceship speed */
        if (self.movesTo && self.movingStartMs) {
            movingMs = nowMs - self.movingStartMs;
            if (movingMs > 0 && movingMs < settings.spaceship.accelerate) {
                speed = speed * (movingMs / settings.spaceship.accelerate);
            }
        }

        offset = speed * dt;

        switch (self.movesTo) {
            case 'left':
                if ((self.base.x - offset) < 0) {
                    if (self.base.x > 0) {
                        modified = self.shift(self.base.x, 'left');
                    }
                } else {
                    modified = self.shift(offset, 'left');
                }
                break;
            case 'right':
                if ((self.base.x + self.width + offset) > settings.width) {
                    if ((self.base.x + self.width) < settings.width) {
                        modified = self.shift(settings.width - (self.base.x + self.width), 'right');
                    }
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
     * Draw spaceship
     * @param {Scene} scene
     */
    Spaceship.prototype.draw = function(scene) {
        var self = this;

        _.each(self.shapes, function(shape){
            $lib.Draw(shape, {color: 'orange', style: 'fill'}, scene);
        });
    };

    /**
     * Set moving direction
     * @param {string} direction
     */
    Spaceship.prototype.startMovesTo = function(direction) {
        var self = this;

        if (_.indexOf(['left','right'], direction) === -1) {
            throw new Error('Invalid spaceship direction');
        }

        if (self.movesTo !== direction) {
            self.movesTo = direction;
            self.movingStartMs = (new Date()).getTime();
        }
    };

    /**
     * Stop moves
     */
    Spaceship.prototype.stopMoves = function() {
        var self = this;

        self.movesTo = null;
        self.movingStartMs = 0;
    };

    return Spaceship;
});