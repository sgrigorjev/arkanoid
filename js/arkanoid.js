define(function (require) {

    var $ = require('jquery');
    var _ = require('underscore');
    var $lib = require('canvaslib');
    var Map = require('canvasmap');

    var settings = require('app/settings');
    var Spaceship = require('app/spaceship');
    var Bullet = require('app/bullet');
    var Target = require('app/target');

    $(function() {


        $('#spaceship_speed').slider({
            min: 100,
            max: 2000,
            step: 1,
            tooltip: 'hide'
        }).on('slide', function(event) {
            settings.spaceship.speed = event.value;
            $("#spaceship_speed_value").text(settings.spaceship.speed);
        });
        $("#spaceship_speed_value").text(settings.spaceship.speed);

        $('#spaceship_accelerate').slider({
            min: 0,
            max: 1000,
            step: 1,
            tooltip: 'hide'
        }).on('slide', function(event) {
            settings.spaceship.accelerate = event.value;
            $("#spaceship_accelerate_value").text(settings.spaceship.accelerate);
        });
        $("#spaceship_accelerate_value").text(settings.spaceship.accelerate);

        $('#bullet_speed').slider({
            min: 10,
            max: 2000,
            step: 1,
            tooltip: 'hide'
        }).on('slide', function(event) {
            settings.bullet.speed = event.value;
            $("#bullet_speed_value").text(settings.bullet.speed);
        });
        $("#bullet_speed_value").text(settings.bullet.speed);

        $('#target_speed').slider({
            min: 0,
            max: 500,
            step: 5,
            tooltip: 'hide'
        }).on('slide', function(event) {
            settings.target.speed = event.value;
            $("#target_speed_value").text(settings.target.speed);
        });
        $("#target_speed_value").text(settings.target.speed);

        $('#target_shift').slider({
            min: 0,
            max: 100,
            step: 1,
            tooltip: 'hide'
        }).on('slide', function(event) {
            settings.target.shift = event.value;
            $("#target_shift_value").text(settings.target.shift);
        });
        $("#target_shift_value").text(settings.target.shift);

        $("#settings").show();

        $('#spaceship_speed').slider('setValue', settings.spaceship.speed);
        $('#spaceship_accelerate').slider('setValue', settings.spaceship.accelerate);
        $('#bullet_speed').slider('setValue', settings.bullet.speed);
        $('#target_speed').slider('setValue', settings.target.speed);
        $('#target_shift').slider('setValue', settings.target.shift);


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

        function scenesDebugInfo(sceneName) {
            var $element = $('<div></div>').appendTo($sidebar);
            return function(count, obj) {
                var text = '' + sceneName + ': ' + count + ' (' + obj.constructor.name + ')';
                if ($element.text() != text) {
                    $element.text(text);
                }
            };
        }

        var scenes = {};

        scenes.bg = $lib.Scene("background", null, settings.width, settings.height).appendTo($container.get(0));
        scenes.bg.onDraw(scenesDebugInfo(scenes.bg.id));
        scenes.bg.action();

        var map = new Map(scenes.bg, 10);
        map.draw();

        /** Spaceship */

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

        /** Bullet */

        var bullet = null;
        var shotAllowed = true;

        scenes.bullet = (function() {

            return $lib.Scene("bullet", function(dt){

                var scene = this;

                if (bullet && bullet.update(dt)) {

                    scene.clear();
                    bullet.draw(this);

                    _.some(targets, function(target, inx){
                        var intersec = false;
                        _.some(target.getShapes(), function(shape) {
                            if (bullet.intersec(shape)) {
                                return intersec = true;
                            }
                        });
                        if (intersec) {
                            targets.splice(inx, 1);
                            console.info(targets.length);
                            drawTargets();
                            scene.clear();
                            bullet = null;
                            return true;
                        }
                    });

                } else {
                    if (bullet) {
                        scene.clear();
                        bullet = null;
                    }
                    shotAllowed = true;
                }

            }, settings.width, settings.height).appendTo($container.get(0));

        })();
        scenes.bullet.onDraw(scenesDebugInfo(scenes.bullet.id));
        scenes.bullet.action();

        /** Target */

        var targets = [];

        for (var n = 240 ; n > 0 ; n -= 80) {
            for (var m = 80 ; m < settings.width - 40 ; m += 80) {
                targets.push(new Target($lib.Shapes.Point(m, n)));
            }
        }

        scenes.target = (function() {
            
            return $lib.Scene("target", function(dt) {

                _.each(targets, function(target){
                    target.update(dt);
                });

                drawTargets();

            }, settings.width, settings.height).appendTo($container.get(0));

        })();
        scenes.target.onDraw(scenesDebugInfo(scenes.target.id));
        scenes.target.action();

        function drawTargets() {
            scenes.target.clear();
            _.each(targets, function(target){
                target.draw(scenes.target);
            });
        }

        drawTargets();

        /** Key controls */

        $(document).on('keydown', function(event){
            switch (event.keyCode) {
                case 37: // left arrow
                case 65: // A
                    spaceship.startMovesTo('left');
                    break;
                case 39: // right arrow
                case 68: // D
                    spaceship.startMovesTo('right');
                    break;
                case 32: // Space
                    if (shotAllowed) {
                        bullet = new Bullet(spaceship.getShotPoint());
                        shotAllowed = false;
                    }
                    break;
                default:
                    console.log(event.keyCode);
            }
        });
        $(document).on('keyup', function(event){
            switch (event.keyCode) {
                case 37: // left arrow
                case 65: // A
                    spaceship.movesTo == 'left' && spaceship.stopMoves();
                    break;
                case 39: // right arrow
                case 68: // D
                    spaceship.movesTo == 'right' && spaceship.stopMoves();
                    break;
                case 32: // Space
                    break;
            }
        });

    });

});