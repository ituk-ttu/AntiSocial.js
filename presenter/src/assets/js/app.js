// Environment variables

socketBase = "localhost:3000";

var app = angular.module("antiSocialPresenterView", [
    "ui.router",
    "ui.utils",
    'ui.bootstrap',
    'btford.socket-io',
    'ngAnimate'
]).run(function($rootScope, $state, $stateParams, socketService, $interval) {
    $rootScope.username = null;
    $rootScope.$on('$stateChangeStart', function(e, to, params) {
        if (to.data && to.data.requiresLogin) {
            if ($rootScope.username == null) {
                e.preventDefault();
                // TODO: save where user wanted to go
                $state.go('login');
            }
        }
    });
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.socket = socketService;
}).config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
        .otherwise("/main");
    $stateProvider
        .state("login", {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: "loginController"
        })
        .state("main", {
            url: "/main",
            templateUrl: "templates/main.html",
            controller: "mainController",
            data: {
                requiresLogin: true
            }
        });
});