define(function (require) {

    var $ = require('jquery');
    var _ = require('underscore');
    var $lib = require('canvaslib');
    var Map = require('canvasmap');

    var settings = require('app/settings');
    var Spaceship = require('app/spaceship');
    var Bullet = require('app/bullet');
    var Target = require('app/target');
    var Fleet = require('app/fleet');

    $(function() {

        settings.spaceship.spriteImage = new Image();
        settings.spaceship.spriteImage.src = settings.spaceship.sprite;

        settings.target.spriteImage = new Image();
        settings.target.spriteImage.src = settings.target.sprite;

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

        $('#target_fallFactor').slider({
            tooltip: 'hide',
            min: 0,
            max: 20,
            step: 1,
        }).on('slide', function(event) {
            settings.target.fallFactor = event.value;
            $("#target_fallFactor_value").text(event.value);
        });
        $("#target_fallFactor_value").text(settings.target.fallFactor);

        $("#settings").show();

        $('#spaceship_speed').slider('setValue', settings.spaceship.speed);
        $('#spaceship_accelerate').slider('setValue', settings.spaceship.accelerate);
        $('#bullet_speed').slider('setValue', settings.bullet.speed);
        $('#target_speed').slider('setValue', settings.target.speed);
        $('#target_shift').slider('setValue', settings.target.shift);
        $('#target_fallFactor').slider('setValue', settings.target.fallFactor);


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

        (function(){
            var starts = [];
            var startsCount = 50;
            var startsIndent = 10;

            var bg = $lib.Shapes.Rect(
                $lib.Shapes.Point(0,0),
                settings.width,
                settings.height
            );

            function randomStarts() {
                var i, x, y, s;
                starts = [];
                for (i = 0 ; i < startsCount ; ++i) {
                    x = _.random(startsIndent, settings.width - startsIndent);
                    y = _.random(startsIndent, settings.height - startsIndent);
                    s = _.random(1, 2);
                    starts.push($lib.Shapes.Rect($lib.Shapes.Point(x, y), s, s));
                };
            }
            function drawBg() {
                scenes.bg.clear();

                randomStarts();

                $lib.Draw(bg, {color: 'black', style: 'fill'}, scenes.bg);
                _.each(starts, function(star) {
                    $lib.Draw(star, {color: 'white', style: 'fill'}, scenes.bg);
                });

                window.setTimeout(function(){
                    drawBg();
                }, 5000);
            }

            drawBg();

        })();

        //var map = new Map(scenes.bg, 10);
        //map.draw();

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

        /** Fleet */

        var fleet = new Fleet();

        scenes.fleet = (function() {

            return $lib.Scene("fleet", function(dt) {

                var scene = this;

                if (fleet.update(dt)) {
                    scene.clear();
                    fleet.draw(this);
                }

            }, settings.width, settings.height).appendTo($container.get(0));

        })();
        scenes.fleet.onDraw(scenesDebugInfo(scenes.fleet.id));
        scenes.fleet.action();

        /** Bullet */

        var bullet = null;
        var shotAllowed = true;

        scenes.bullet = (function() {

            return $lib.Scene("bullet", function(dt){

                var scene = this;

                if (bullet && bullet.update(dt)) {
                    scene.clear();
                    bullet.draw(this);
                    if (fleet.checkHit(bullet)) {
                        scene.clear();
                        bullet = null;
                    }
                } else if(bullet) {
                    scene.clear();
                    bullet = null;
                }

                shotAllowed = !bullet;

            }, settings.width, settings.height).appendTo($container.get(0));

        })();
        scenes.bullet.onDraw(scenesDebugInfo(scenes.bullet.id));
        scenes.bullet.action();

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