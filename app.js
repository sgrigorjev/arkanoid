requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '..',
        jquery: 'jquery-1.10.2.min'
    }
});
requirejs(['app/arkanoid2']);