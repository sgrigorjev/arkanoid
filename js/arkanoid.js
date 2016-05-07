define(function (require) {

    var $ = require('jquery');
    var _ = require('underscore');
    var $lib = require('canvaslib');
    var Map = require('canvasmap');

    var settings = require('app/settings');
    var Spaceship = require('app/spaceship');

    $(function() {

        var $container = $('#container');
        $container.css({
            width: settings.width,
            height: settings.height
        });
        var $fps = $('#fps');
        $lib.Scene.fps(function(frames){
            $fps.text(frames);
        });

        var $sidebar = $('#sidebar');

        var scenesDebugInfo = function(sceneName){
            var $element = $('<div></div>').appendTo($sidebar);
            return function(count, obj) {
                var text = '' + sceneName + ': ' + count + ' (' + obj.constructor.name + ')';
                if ($element.text() != text) {
                    $element.text(text);
                }
            };
        };

        var scenes = {};

        scenes.bg = $lib.Scene("background", null, settings.width, settings.height).appendTo($container.get(0));
        scenes.bg.onDraw(scenesDebugInfo(scenes.bg.id));

        var map = new Map(scenes.bg, 10);
        map.draw();

        scenes.spaceshipOld = (function() {

            var shipBaseSize = 100;
            var shipSize = 10;
            var shipSpeed = 1000;
            var shipMove = null;
            var shipShoot = false;
            var shipShootInProgress = false;

            var bulletSize = 10;
            var bulletSpeed = 1000;

            var p1 = $lib.Shapes.Point((settings.width - shipBaseSize) / 2, settings.height - (shipSize * 2));
            var p2 = $lib.Shapes.Point(p1.x + ((shipBaseSize - shipSize) / 2), p1.y - shipSize);

            var rect1 = $lib.Shapes.Rect(p1, shipBaseSize, shipSize);
            var rect2 = $lib.Shapes.Rect(p2, shipSize, shipSize);

            var bulletPoint = $lib.Shapes.Point(p2.x, p2.y - (bulletSize * 2));
            var bullet = null;


            $(document).on('keydown', function(event){
                switch (event.keyCode) {
                    case 37: // left arrow
                    case 65: // A
                        shipMove = 'left';
                        spaceship.startMovesTo('left');
                        break;
                    case 39: // right arrow
                    case 68: // D
                        shipMove = 'right';
                        spaceship.startMovesTo('right');
                        break;
                    case 32: // Space
                        shipShoot = true;
                        break;
                    default:
                        console.log(event.keyCode);
                }
            });
            $(document).on('keyup', function(event){
                switch (event.keyCode) {
                    case 37: // left arrow
                    case 65: // A
                        shipMove == 'left' && (shipMove = null);
                        spaceship.movesTo == 'left' && spaceship.stopMoves();
                        break;
                    case 39: // right arrow
                    case 68: // D
                        shipMove == 'right' && (shipMove = null);
                        spaceship.movesTo == 'right' && spaceship.stopMoves();
                        break;
                    case 32: // Space
                        shipShoot = false;
                        break;
                }
            });

            return $lib.Scene("spaceshipOld", function(dt){

                var shipOffset = shipSpeed * dt;
                var bulletOffset;
                var bulletx, bullety;

                switch (shipMove) {
                    case 'left':
                        p1.x = p1.x - shipOffset;
                        if (p1.x < 0) {
                            p1.x = 0;
                        }
                        break;
                    case 'right':
                        p1.x = p1.x + shipOffset;
                        if ((p1.x + shipBaseSize) > settings.width) {
                            p1.x = settings.width - shipBaseSize;
                        }
                        break;
                }

                p2.x = p1.x + ((shipBaseSize - shipSize) / 2);

                rect1 = $lib.Shapes.Rect(p1, shipBaseSize, shipSize);
                rect2 = $lib.Shapes.Rect(p2, shipSize, shipSize);

                if (shipShootInProgress) {
                    bulletOffset = bulletSpeed * dt;
                    bulletx = bulletPoint.x;
                    bullety = bulletPoint.y - bulletOffset;

                    if (bullety >= 0) {
                        bulletPoint = $lib.Shapes.Point(bulletx, bullety);
                        bullet = $lib.Shapes.Rect(bulletPoint, bulletSize, bulletSize * 2);
                    } else {
                        bulletPoint = null;
                        bullet = null;
                        shipShootInProgress = false;
                    }
                } else if (shipShoot) {
                    bulletx = p2.x;
                    bullety = p2.y - (bulletSize * 2);
                    bulletPoint = $lib.Shapes.Point(bulletx, bullety);
                    bullet = $lib.Shapes.Rect(bulletPoint, bulletSize, bulletSize * 2);
                    shipShoot = false;
                    shipShootInProgress = true;
                }

                this.clear();

                if (bulletPoint && bullet) {
                    $lib.Draw(bullet,{color: 'red', style: 'fill'}, this);
                }
                $lib.Draw(rect1,{color: 'orange', style: 'fill'}, this);
                $lib.Draw(rect2,{color: 'orange', style: 'fill'}, this);



            }, settings.width, settings.height).appendTo($container.get(0));

        })();
        scenes.spaceshipOld.onDraw(scenesDebugInfo(scenes.spaceshipOld.id));
        //scenes.spaceshipOld.action();

        var spaceship = new Spaceship();

        scenes.spaceship = (function() {

            return $lib.Scene("spaceship", function(dt){

                if (spaceship.update(dt)) {
                    this.clear();
                    spaceship.draw(this);
                }

            }, settings.width, settings.height).appendTo($container.get(0));

        })();

        spaceship.draw(scenes.spaceship);

        scenes.spaceship.onDraw(scenesDebugInfo(scenes.spaceship.id));
        scenes.spaceship.action();




    });

});