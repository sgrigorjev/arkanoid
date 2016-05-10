define(['app/settings','app/target','canvaslib','underscore'], function (settings, Target, $lib, _) {

    /**
     * Fleet model
     * @constructor
     */
    function Fleet(startPoint) {
        var self = this,
            row, col, line;

        self._targets = [];
        self._targetsAmount = 0;

        self._indentLeft = 0;
        self._indentRight = 0;

        self._xinterval = settings.width / (settings.fleet.cols + 1);
        self._yinterval = settings.fleet.rowOffset ? settings.fleet.rowOffset : self._xinterval;

        for (row = settings.fleet.rows ; row > 0 ; --row) {
            line = [];
            for (col = 1 ; col <= settings.fleet.cols ; ++col) {
                line.push(
                    new Target(
                        $lib.Shapes.Point(Math.round(self._xinterval * col), Math.round(settings.fleet.topOffset + (self._yinterval * row)))
                    )
                );
                self._targetsAmount++;
            }
            self._targets.push(line);
        }

    };

    /**
     * Updating the fleet position
     * @param number dt - time since previous update
     * @returns {boolean}
     */
    Fleet.prototype.update = function(dt) {
        var self = this,
            row, col,
            modified = false;

        if (self._targetsAmount > 0) {
            for (row = 0 ; row < settings.fleet.rows ; ++row) {
                for (col = 0 ; col < settings.fleet.cols ; ++col) {
                    if (self._targets[row][col] && self._targets[row][col].update(dt)) {
                        modified = true;
                    }
                }
            }
        } else if (self._targetsAmount === 0) {
            modified = true;
            self._targetsAmount = -1;
        }

        return modified;
    };

    /**
     * Draw fleet
     * @param {Scene} scene
     */
    Fleet.prototype.draw = function(scene) {
        var self = this,
            row, col;

        for (row = 0 ; row < settings.fleet.rows ; ++row) {
            for (col = 0 ; col < settings.fleet.cols ; ++col) {
                if (self._targets[row][col]) {
                    self._targets[row][col].draw(scene);
                }
            }
        }

    };

    /**
     * Check whether the bullet hit to one of the targets
     * @param {Bullet} bullet
     * @returns {boolean}
     */
    Fleet.prototype.checkHit = function(bullet) {
        var self = this,
            row, col,
            targetHit = false;

        check_intersections:
        for (row = 0 ; row < settings.fleet.rows ; ++row) {
            for (col = 0 ; col < settings.fleet.cols ; ++col) {
                if (self._targets[row][col]) {
                    _.some(self._targets[row][col].getShapes(), function(shape) {
                        if (bullet.intersec(shape)) {
                            return targetHit = true;
                        }
                    });
                    if (targetHit) {
                        self._targets[row][col] = null;
                        self._targetsAmount--;
                        if (self._targetsAmount > 0) {
                            self.checkIndent();
                        }
                        break check_intersections;
                    }
                }
            }
        }

        return targetHit;
    };

    Fleet.prototype.checkIndent = function() {
        var self = this,
            row, col,
            emptyColumns;

        self._indentLeft = 0;
        self._indentRight = 0;

        /** Check left indent */
        for (col = 0 ; col < settings.fleet.cols ; ++col) {
            emptyColumns = 0;
            for (row = 0 ; row < settings.fleet.rows ; ++row) {
                !self._targets[row][col] && emptyColumns++;
            }
            if (emptyColumns === row) {
                self._indentLeft = Math.round(self._indentLeft + self._xinterval);
            } else {
                break;
            }
        }

        /** Check right indent */
        for (col = settings.fleet.cols - 1 ; col >= 0 ; --col) {
            emptyColumns = 0;
            for (row = 0 ; row < settings.fleet.rows ; ++row) {
                !self._targets[row][col] && emptyColumns++;
            }
            if (emptyColumns === row) {
                self._indentRight = Math.round(self._indentRight + self._xinterval);
            } else {
                break;
            }
        }

        self.setIndent(self._indentLeft, self._indentRight);

    };

    /**
     * Set indent to each target
     */
    Fleet.prototype.setIndent = function() {
        var self = this,
            row, col;

        for (row = 0 ; row < settings.fleet.rows ; ++row) {
            for (col = 0 ; col < settings.fleet.cols ; ++col) {
                if (self._targets[row][col]) {
                    self._targets[row][col].setIndent(self._indentLeft, self._indentRight);
                }
            }
        }

    };

    return Fleet;
});