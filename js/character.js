define(['app/settings','canvaslib','underscore'], function (settings, $lib, _) {

    return {
        shift: function (offset, direction) {
            var self = this,
                shifted = 0;

            _.each(self._points, function (point) {
                switch (direction) {
                    case 'left' : point.x -= offset; break;
                    case 'right': point.x += offset; break;
                    case 'up'   : point.y -= offset; break;
                    case 'down' : point.y += offset; break;
                }
                shifted++;
            });
            return shifted;
        }
    }
});