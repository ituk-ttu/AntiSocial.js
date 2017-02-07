app.controller("loginController", ["$q", "$scope", "$stateParams", "socketService", "$rootScope", "$timeout",
    "$state", function($q, $scope, $stateParams, socketService, $rootScope, $timeout, $state) {
        $scope.data = $rootScope.data;
        $rootScope.username = null;
        $scope.working = false;
        $scope.error = false;
        $scope.user = {username: "", password: ""};
        $rootScope.socket.on('authenticate', function (data) {
            $scope.working = false;
            if (data.success) {
                $rootScope.username = data.user;
                $state.go('main');
            } else {$scope.error = true;}
        });
        $scope.login = function () {
            $rootScope.socket.emit('authenticate', $scope.user);
            $scope.working = true;
        }

    }]);