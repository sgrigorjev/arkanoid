requirejs.config({
    baseUrl: 'js/lib',
    urlArgs: '_=' + (new Date()).getTime(),
    paths: {
        app: '..',
        jquery: 'jquery-1.10.2.min',
        canvaslib: 'canvas/lib-1.7',
        canvasmap: 'canvas/map-1.0'
    },
    shim: {
        canvaslib: {
            exports: "$lib"
        },
        canvasmap: {
            exports: "Map"
        },
        underscore: {
            exports: "_"
        }
    }
});
requirejs(['app/arkanoid']);