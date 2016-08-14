(function() {
'use strict';

    angular
        .module('app.services')
        .service('PersistenceService', PersistenceService);

    PersistenceService.$inject = ['$rootScope', '$q', 'OH2StorageService', 'localStorageService'];
    function PersistenceService($rootScope, $q, OH2StorageService, localStorageService) {
        this.getDashboards = getDashboards;
        this.getDashboard = getDashboard;
        this.saveDashboards = saveDashboards;

        function loadDashboardsFromLocalStorage() {
            $rootScope.dashboards = localStorageService.get("dashboards") || [];
        }

        function saveDashboardsToLocalStorage() {
            if (!$rootScope.dashboards) return;

            localStorageService.set("dashboards", $rootScope.dashboards);
        }

        ////////////////



        function loadDashboards() {
            var deferred = $q.defer();
            OH2StorageService.tryGetServiceConfiguration().then(function (data) {
                $rootScope.useRegistry = true;

                if (OH2StorageService.getCurrentPanelConfig()) {
                    OH2StorageService.useCurrentPanelConfig();
                } else {
                    loadDashboardsFromLocalStorage();
                }

                deferred.resolve($rootScope.dashboards);
            }, function (err) {
                // No OH2 service, use local storage
                loadDashboardsFromLocalStorage();
                deferred.resolve($rootScope.dashboards);
            });

            return deferred.promise;
        }

        function getDashboards() {
            if (!$rootScope.dashboards) {
                return loadDashboards();
            }
            
            return $rootScope.dashboards; 
        }

        function getDashboard(id) {
            
            if (!$rootScope.dashboards) {
                return loadDashboards().then(function () { return _.find($rootScope.dashboards, ['id', id]); });
            }

            return _.find($rootScope.dashboards, ['id', id]);
        }

        function saveDashboards() {
            var deferred = $q.defer();

            saveDashboardsToLocalStorage();
            if ($rootScope.useRegistry && OH2StorageService.getCurrentPanelConfig()) {
                OH2StorageService.saveCurrentPanelConfig().then(function (data) {
                    console.log('Saved to openHAB 2 service configuration');
                    deferred.resolve();
                }, function (err) {
                    console.log('Error while saving to openHAB 2 configuration');
                    deferred.reject(err);
                });
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        }
    }
})();
