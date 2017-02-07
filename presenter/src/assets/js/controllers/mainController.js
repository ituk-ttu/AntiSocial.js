app.controller("mainController", ["$q", "$scope", "$stateParams", "socketService", "$rootScope", "$timeout",
    "$state", function($q, $scope, $stateParams, socketService, $rootScope, $timeout, $state) {
        $scope.username = $rootScope.username;
        $scope.countdown = 1;
        $scope.questions = [];
        $rootScope.socket.on('timer', function (target) {
            $scope.countdown = target;
        });
        $rootScope.socket.on('questions.list', function (data) {
            $scope.questions = data.questions;
            $scope.$apply();
        });
        $rootScope.socket.on('questions', function (data) {
            $scope.questions.push(data);
            $scope.$apply();
        });
        $rootScope.socket.emit('timer.get', null);
        $rootScope.socket.emit('questions.get', null);
        $scope.getTimer = function () {
            var t = $scope.countdown - Math.floor(Date.now() /1000);
            if (t > 0) {
                if (t % 60 < 10) {
                    return Math.floor(t / 60) + ":0" + t % 60
                } else {
                    return Math.floor(t / 60) + ":" + t % 60
                }
            } else {
                return "Out of Time!";
            }
        };
        $scope.time = $scope.getTimer();
        setInterval(function () {
            $scope.time = $scope.getTimer();
            $scope.$apply();
        }, 1000);
    }]);