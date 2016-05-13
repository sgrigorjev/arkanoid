define(function (require) {
    return {
        width: 800,
        height: 600,
        spaceship: {
            speed: 800,
            accelerate: 250,
            bottomOffset: 10,
            sprite: "img/spaceship-white-33x33.png",
            spriteImage: null
        },
        bullet: {
            speed: 800
        },
        target: {
            speed: 40,
            shift: 30,
            fallFactor: 0,
            sprite: "img/target-white-33x33.png",
            spriteImage: null
        },
        fleet: {
            rows: 3,
            cols: 16,
            cols: 16,
            topOffset: 0,
            rowOffset: 0
        },
        explosion: {
            sprite1: "img/explode-1-white-44x44.png",
            sprite1Image: null,
            sprite2: "img/explode-2-white-44x44.png",
            sprite2Image: null
        }
    };
});