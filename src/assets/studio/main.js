/*! Studio-v2 - v2.0.0 - 2017-06-29
* https://github.com/kaltura/player-studio
* Copyright (c) 2017 Kaltura */
'use strict';
var cl = function (val) {
  return console.log(val);
};
var KMCModule = angular.module('KMCModule', [
    'pascalprecht.translate',
    'ngRoute',
    'KMC.controllers',
    'KMC.filters',
    'KMC.services',
    'KMC.directives',
    'ngAnimate',
    'LocalStorageModule',
    'KMCmenu',
    'JSONedit'
  ]);
KMCModule.config([
  '$routeProvider',
  '$locationProvider',
  '$httpProvider',
  '$tooltipProvider',
  '$translateProvider',
  function ($routeProvider, $locationProvider, $httpProvider, $tooltipProvider, $translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'i18n/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en_US');
    $translateProvider.fallbackLanguage('en_US');
    if (window.location.href.indexOf('debug') != -1) {
    }
    $translateProvider.useStorage('localStorageService');
    $tooltipProvider.options({
      placement: 'right',
      'appendToBody': true,
      'popupDelay': 800
    });
    $tooltipProvider.setTriggers({ 'customShow': 'customShow' });
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    var $http, interceptor = [
        '$q',
        '$injector',
        function ($q, $injector) {
          var notificationChannel;
          function success(response) {
            $http = $http || $injector.get('$http');
            if ($http.pendingRequests.length < 1) {
              notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
              notificationChannel.requestEnded();
            }
            return response;
          }
          function error(response) {
            logTime('httpRequest failed -');
            $http = $http || $injector.get('$http');
            if ($http.pendingRequests.length < 1) {
              notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
              notificationChannel.requestEnded();
            }
            return $q.reject(response);
          }
          return function (promise) {
            notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
            notificationChannel.requestStarted();
            return promise.then(success, error);
          };
        }
      ];
    $httpProvider.responseInterceptors.push(interceptor);
    $routeProvider.when('/login', {
      templateUrl: 'view/login.html',
      controller: 'LoginCtrl',
      resolve: {
        'apiService': [
          'api',
          'apiService',
          function (api, apiService) {
            return apiService;
          }
        ]
      }
    });
    $routeProvider.when('/list', {
      templateUrl: 'view/list.html',
      controller: 'PlayerListCtrl',
      resolve: {
        'apiService': [
          'api',
          'apiService',
          'localStorageService',
          '$location',
          function (api, apiService, localStorageService, $location) {
            return ksCheck(api, apiService, localStorageService, $location).then(function () {
              return apiService;
            });
          }
        ]
      }
    });
    var ksCheck = function (api, apiService, localStorageService, $location) {
      try {
        var kmc = window.parent.kmc;
        if (kmc && kmc.vars) {
          if (kmc.vars.ks)
            localStorageService.add('ks', kmc.vars.ks);
        }
      } catch (e) {
        cl('Could not located parent.kmc: ' + e);
      }
      var ks = localStorageService.get('ks');
      if (!ks) {
        $location.path('/login');
        return false;
      } else {
        api.then(function () {
          apiService.setKs(ks);
        });
      }
      return api;
    };
    $routeProvider.when('/edit/:id', {
      templateUrl: 'view/edit.html',
      controller: 'EditCtrl',
      reloadOnSearch: false,
      resolve: {
        'PlayerData': [
          'PlayerService',
          '$route',
          'api',
          'apiService',
          'localStorageService',
          '$location',
          function (PlayerService, $route, api, apiService, localStorageService, $location) {
            var apiLoaded = ksCheck(api, apiService, localStorageService, $location);
            if (apiLoaded) {
              return apiLoaded.then(function (api) {
                return PlayerService.getPlayer($route.current.params.id);
              });
            }
          }
        ],
        'editProperties': 'editableProperties'
      }
    });
    $routeProvider.when('/newByTemplate', {
      templateUrl: 'view/new-template.html',
      controller: 'PlayerCreateCtrl',
      reloadOnSearch: false,
      resolve: {
        'templates': [
          'playerTemplates',
          function (playerTemplates) {
            return playerTemplates.listSystem();
          }
        ],
        'userId': function () {
          return '1';
        }
      }
    });
    $routeProvider.when('/new', {
      templateUrl: 'view/edit.html',
      controller: 'EditCtrl',
      reloadOnSearch: false,
      resolve: {
        'api': [
          'api',
          'apiService',
          'localStorageService',
          '$location',
          function (api, apiService, localStorageService, $location) {
            return ksCheck(api, apiService, localStorageService, $location);
          }
        ],
        'PlayerData': [
          'api',
          'PlayerService',
          function (api, PlayerService) {
            return api.then(function () {
              return PlayerService.newPlayer();
            });
          }
        ]
      }
    });
    $routeProvider.when('/logout', {
      resolve: {
        'logout': [
          'localStorageService',
          'apiService',
          '$location',
          function (localStorageService, apiService, $location) {
            if (localStorageService.isSupported()) {
              localStorageService.clearAll();
            }
            apiService.unSetks();
            $location.path('/login');
          }
        ]
      }
    });
    $routeProvider.otherwise({
      resolve: {
        'res': [
          'api',
          'apiService',
          'localStorageService',
          '$location',
          function (api, apiService, localStorageService, $location) {
            if (ksCheck(api, apiService, localStorageService, $location)) {
              return $location.path('/list');
            }
          }
        ]
      }
    });
  }
]).run([
  '$rootScope',
  '$rootElement',
  '$location',
  function ($rootScope, $rootElement, $location) {
    var appLoad = new Date();
    var debug = false;
    setTimeout(function () {
      window.localStorage.setItem('updateHash', 'true');
    }, 1000);
    if (typeof window.parent.kmc != 'undefined') {
      $('html').addClass('inKmc');
    }
    var logTime = function (eventName) {
      if ($location.search()['debug']) {
        var now = new Date();
        var diff = Math.abs(appLoad.getTime() - now.getTime());
        cl(eventName + ' ' + Math.ceil(diff / 1000) + 'sec ' + diff % 1000 + 'ms');
      }
    };
    window.logTime = logTime;
    logTime('AppJsLoad');
    $rootScope.constructor.prototype.$safeApply = function (fn) {
      var phase = this.$root.$$phase;
      if (phase == '$apply' || phase == '$digest')
        this.$eval(fn);
      else
        this.$apply(fn);
    };
    $rootScope.constructor.prototype.openTooltip = function ($event) {
      $($event.target).trigger('customShow');
      $event.preventDefault();
      $event.stopPropagation();
      return false;
    };
    $rootScope.routeName = '';
    $rootScope.$on('$routeChangeSuccess', function () {
      appLoad = new Date();
      var url = $location.url().split('/');
      if (debug) {
        $location.search({ debug: true });
      }
      if (url[1].indexOf('?') != -1) {
        url[1] = url[1].substr(0, url[1].indexOf('?'));
      }
      $rootScope.routeName = url[1];
    });
    $rootScope.$on('$routeChangeStart', function () {
      if ($location.search()['debug']) {
        debug = true;
      } else {
        debug = false;
      }
    });
    var kmc = window.parent.kmc;
    if (kmc && kmc.vars.studio.showFlashStudio === false) {
      $('.kmcSubNav').hide();
    }
    if (kmc && kmc.vars.studio.showHTMLStudio === false) {
      $('#htmlStudioBtn').hide();
    }
  }
]);
'use strict';
var DirectivesModule = angular.module('KMC.directives', [
    'ui.bootstrap',
    'ui.select2',
    'ui.sortable'
  ]);
DirectivesModule.directive('bindOnce', function () {
  return {
    scope: true,
    link: function ($scope) {
      setTimeout(function () {
        $scope.$destroy();
      }, 0);
    }
  };
});
DirectivesModule.directive('onFinishRender', [
  '$timeout',
  '$compile',
  function ($timeout, $compile) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            if ($('.playlistSetup').length === 0) {
              $('div:contains("Playlist Configuration").panel').before('<div class="playlistSetup">Playlist setup:</div>');
            }
            if ($('.addPlugin').length === 0) {
              var addPluginBtn = $compile(angular.element('<p style="margin-top: 40px; margin-bottom: 36px"><button ng-click="addPlugin()" class="btn btn-default addPlugin"><i class="glyphicon glyphicon-plus">&nbsp;</i>Create New Plugin</button></p>'))(scope);
              $('div:contains("UI Variables").panel').after(addPluginBtn);
            }
            if ($('.importPlugin').length === 0) {
              var importPluginBtn = $compile(angular.element('<p style="float: left; margin-right: 20px"><button ng-click="importPlugin()" class="btn btn-default importPlugin"><i class="glyphicon glyphicon-import">&nbsp;</i>Import Plugin</button></p>'))(scope);
              $('.addPlugin').after(importPluginBtn);
            }
          }, 50);
          $timeout(function () {
            $('.numeric').not('.allowNegative').numeric({
              allowMinus: false,
              allowDecSep: false
            });
            $('.allowNegative').numeric({
              allowMinus: true,
              allowDecSep: false
            });
            $('.float').numeric({
              allowMinus: false,
              allowDecSep: true
            });
            $('.alpha').alphanum({
              allow: '-_=+,.!:;/@#$%^&*(){}[]|?~\'',
              disallow: '"'
            });
            $('.numbersArray').alphanum({
              allow: ',.',
              allowUpper: false,
              allowLower: false,
              disallow: '-_=+"!:;/@#$%^&*(){}[]|?~\''
            });
          }, 3000);
        }
      }
    };
  }
]);
DirectivesModule.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});
DirectivesModule.directive('timeago', [function () {
    return {
      restrict: 'CA',
      link: function (scope, iElement, iAttrs) {
        if (typeof $.timeago == 'function') {
          scope.$observe('timeago', function (newVal) {
            if (newVal && !isNaN(newVal)) {
              var date = scope.timestamp * 1000;
              iElement.text($.timeago(date));
            }
          });
        }
      }
    };
  }]);
DirectivesModule.directive('hiddenValue', [function () {
    return {
      template: '<input type="hidden" value="{{model}}"/>',
      scope: { model: '=' },
      controller: function ($scope, $element, $attrs) {
        if ($attrs['initvalue']) {
          $scope.model = $attrs['initvalue'];
        }
      },
      restrict: 'EA'
    };
  }]);
DirectivesModule.directive('sortOrder', [
  'sortSvc',
  function (sortSvc) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {},
      templateUrl: 'template/formcontrols/sortOrder.html',
      controller: [
        '$scope',
        function ($scope) {
          $scope.getObjects = function () {
            $scope.containers = sortSvc.getObjects();
          };
          $scope.getObjects();
          sortSvc.sortScope = $scope;
          $scope.$on('sortContainersChanged', function () {
            $scope.getObjects();
          });
          $scope.$watchCollection('containers', function (newVal, oldVal) {
            if (newVal != oldVal) {
              sortSvc.saveOrder($scope.containers);
            }
          });
          $scope.sortableOptions = {
            update: function (e, ui) {
              cl($scope.containers);
            },
            axis: 'y'
          };
        }
      ],
      link: function (scope, element, attrs) {
      }
    };
  }
]);
DirectivesModule.directive('onbeforeunload', [
  '$window',
  '$filter',
  '$location',
  function ($window, $filter, $location) {
    var unloadtext, forms = [];
    function handleOnbeforeUnload() {
      var i, form, isDirty = false;
      for (i = 0; i < forms.length; i++) {
        form = forms[i];
        if (form.scope[form.name].$dirty) {
          isDirty = true;
          break;
        }
      }
      if (isDirty) {
        return unloadtext;
      } else {
        return undefined;
      }
    }
    return function ($scope, $element) {
      if ($element[0].nodeName.toLowerCase() !== 'form') {
        throw new Error('onbeforeunload directive must only be set on a angularjs form!');
      }
      forms.push({
        'name': $element[0].name,
        'scope': $scope
      });
      try {
        unloadtext = $filter('translate')('onbeforeunload');
      } catch (err) {
        unloadtext = '';
      }
      var formName = $element[0].name;
      $scope.$watch(formName + '.$dirty', function (newVal, oldVal) {
        if (newVal && newVal != oldVal) {
          $window.onbeforeunload = handleOnbeforeUnload;
        }
      });
      $scope.$on('$locationChangeSuccess', function (e, origin, dest) {
        if (origin.split('?')[0] != dest.split('?')[0]) {
          $window.ononbeforeunload = false;
        }
      });
      $scope.$on('$destory', function () {
        $window.ononbeforeunload = false;
      });
    };
  }
]);
DirectivesModule.directive('mcustomScrollbar', [
  '$timeout',
  function ($timeout) {
    return {
      priority: 0,
      scope: {},
      restrict: 'AC',
      link: function (scope, element, attr) {
        var afterScroll;
        var height = '99%';
        if (scope['pagename'] == 'search')
          return;
        scope.scroller = null;
        var options = scope.$eval(attr['mcustomScrollbar']);
        var timeVar = null;
        scope.$on('layoutChange', function () {
          if (timeVar) {
            $timeout.cancel(timeVar);
          }
          timeVar = $timeout(function () {
            if (scope.scroller)
              scope.scroller.mCustomScrollbar('update');
            timeVar = null;
          }, 300);
        });
        var opts = {
            horizontalScroll: false,
            mouseWheel: true,
            autoHideScrollbar: true,
            contentTouchScroll: true,
            theme: 'dark',
            set_height: height,
            advanced: {
              autoScrollOnFocus: false,
              updateOnBrowserResize: true,
              updateOnContentResize: false
            }
          };
        angular.extend(opts, options);
        var makeOrUpdateScroller = function () {
          return $timeout(function () {
            if (typeof $().mCustomScrollbar == 'function') {
              if (scope.scroller) {
                scope.scroller.mCustomScrollbar('update');
              } else {
                scope.scroller = element.mCustomScrollbar(opts);
              }
            }
          }, 1000);
        };
        if (attr['menuscroller']) {
          scope.$on('menuChange', function (e, menupage) {
            if (attr['menuscroller'] == menupage) {
              makeOrUpdateScroller();
            } else if (scope.scroller) {
              scope.scroller.mCustomScrollbar('destroy');
              scope.scroller = null;
            }
          });
        } else {
          afterScroll = makeOrUpdateScroller();
        }
        var checkScroll = function (value) {
          if (value == 'block') {
            $('#tableHead').css('padding-right', '18px');
          } else {
            $('#tableHead').css('padding-right', '0px');
          }
        };
        if (scope.$root.routeName == 'list' && $('#tableHead').length) {
          afterScroll.then(function () {
            var scrollTools = $(element).find('.mCSB_scrollTools');
            scope.scrollerCss = scrollTools.css('display');
            $timeout(function () {
              checkScroll(scope.scrollerCss);
            }, 200);
            scope.$watch(function () {
              return scope.scrollerCss = scrollTools.css('display');
            }, function (value) {
              checkScroll(value);
            });
            var timeVar;
            $(window).resize(function () {
              if (timeVar) {
                $timeout.cancel(timeVar);
              }
              timeVar = $timeout(function () {
                checkScroll(scrollTools.css('display'));
                timeVar = null;
              }, 200);
            });
          });
        }
      }
    };
  }
]);
'use strict';
angular.module('KMC.filters', ['ngSanitize']).filter('HTMLunsafe', [
  '$sce',
  function ($sce) {
    return function (val) {
      return $sce.trustAsHtml(val);
    };
  }
]).filter('timeago', function () {
  return function (input) {
    if (typeof $.timeago == 'function' && !isNaN(input)) {
      var date = input * 1000;
      return $.timeago(date);
    } else
      return input;
  };
}).filter('range', function () {
  return function (input) {
    var lowBound, highBound;
    switch (input.length) {
    case 1:
      lowBound = 0;
      highBound = parseInt(input[0]) - 1;
      break;
    case 2:
      lowBound = parseInt(input[0]);
      highBound = parseInt(input[1]);
      break;
    default:
      return input;
    }
    var result = [];
    for (var i = lowBound; i <= highBound; i++)
      result.push(i);
    return result;
  };
}).filter('startFrom', function () {
  return function (input, start) {
    if (input) {
      start = +start;
      return input.slice(start);
    }
    return [];
  };
});
var KMCMenu = angular.module('KMCmenu', [
    'ui.bootstrap',
    'ngSanitize',
    'ui.select2',
    'angularSpectrumColorpicker'
  ]);
KMCMenu.controller('EditCtrl', [
  '$scope',
  '$http',
  '$timeout',
  'PlayerData',
  'PlayerService',
  'apiService',
  'editableProperties',
  'localStorageService',
  '$routeParams',
  '$modal',
  '$location',
  'requestNotificationChannel',
  'select2Svc',
  'utilsSvc',
  function ($scope, $http, $timeout, PlayerData, PlayerService, apiService, editableProperties, localStorageService, $routeParams, $modal, $location, requestNotificationChannel, select2Svc, utilsSvc) {
    $scope.playerData = angular.copy(PlayerData);
    $scope.isIE8 = window.ie8;
    $scope.invalidProps = [];
    $scope.dataChanged = false;
    var playerRatio = $scope.playerData.height / $scope.playerData.width;
    $scope.aspectRatio = playerRatio == 9 / 16 ? 'wide' : playerRatio == 3 / 4 ? 'narrow' : 'custom';
    $scope.newPlayer = !$routeParams.id;
    $scope.menuOpen = true;
    if (typeof $scope.playerData['autoUpdate'] === 'undefined') {
      $scope.playerData['autoUpdate'] = $scope.playerData.html5Url.indexOf('{latest}') !== -1;
    }
    $scope.autoPreview = localStorageService.get('autoPreview') ? localStorageService.get('autoPreview') == 'true' : false;
    $scope.simulateMobile = false;
    $scope.setAutoPreview = function () {
      localStorageService.set('autoPreview', !$scope.autoPreview);
    };
    $scope.setSimulateMobile = function () {
      setTimeout(function () {
        $scope.refreshPlayer();
      }, 0);
    };
    if (window.parent.kmc && window.parent.kmc.vars.studio.showFlashStudio === false) {
      $('.menuFooter').css('bottom', '1px');
    }
    window.parent.studioDataChanged = false;
    $scope.userEntries = [];
    $scope.selectedEntry = '';
    $scope.entriesTypeSelector = 'Entries';
    apiService.listMedia().then(function (data) {
      for (var i = 0; i < data.objects.length; i++) {
        $scope.userEntries.push({
          'id': data.objects[i].id,
          'text': data.objects[i].name
        });
      }
      if ($scope.playerData.tags.indexOf('player') !== -1) {
        $scope.selectDefaultEntry($scope.userEntries);
      }
    });
    $scope.entriesSelectBox = select2Svc.getConfig($scope.userEntries, apiService.searchMedia);
    $scope.userPlaylists = [];
    apiService.listPlaylists().then(function (data) {
      for (var i = 0; i < data.objects.length; i++) {
        $scope.userPlaylists.push({
          'id': data.objects[i].id,
          'text': data.objects[i].name
        });
      }
      if ($scope.playerData.tags.indexOf('playlist') !== -1) {
        $scope.selectDefaultEntry($scope.userPlaylists, function () {
          $scope.setPlaylistEntry($scope.selectedEntry.id, $scope.selectedEntry.text);
        });
        $scope.entriesTypeSelector = 'Playlist';
      }
    });
    $scope.playlistSelectBox = select2Svc.getConfig($scope.userPlaylists, apiService.searchPlaylists);
    $scope.setEntriesType = function (entriesType) {
      $scope.entriesTypeSelector = entriesType;
      if (entriesType === 'Entries') {
        if ($scope.playerData.config.plugins.playlistAPI && $scope.playerData.config.plugins.playlistAPI.plugin) {
          $scope.setPluginEnabled('playlistAPI', false);
        }
        $scope.selectDefaultEntry($scope.userEntries);
      } else {
        if (!$scope.playerData.config.plugins.playlistAPI || $scope.playerData.config.plugins.playlistAPI && !$scope.playerData.config.plugins.playlistAPI.plugin) {
          $scope.setPluginEnabled('playlistAPI', true);
        }
        $scope.selectDefaultEntry($scope.userPlaylists);
        $scope.setPlaylistEntry($scope.selectedEntry.id, $scope.selectedEntry.text);
      }
      $scope.refreshPlayer();
    };
    $scope.setPlaylistEntry = function (id, label) {
      if ($scope.entriesTypeSelector === 'Playlist' && $scope.playerData.config.plugins.playlistAPI && $scope.playerData.config.plugins.playlistAPI.plugin) {
        $scope.playerData.config.plugins.playlistAPI.kpl0Id = id;
        $scope.playerData.config.plugins.playlistAPI.kpl0Name = label;
        $scope.$broadcast('setPlaylistEvent', [
          id,
          label
        ]);
      }
    };
    $scope.selectDefaultEntry = function (entriesArr, callback) {
      if (localStorageService.get('defaultEntry')) {
        var previewEntry = localStorageService.get('defaultEntry');
        var found = false;
        for (var i = 0; i < entriesArr.length; i++) {
          if (entriesArr[i].id == previewEntry.id) {
            found = true;
            $scope.selectedEntry = previewEntry;
          }
        }
        if (!found) {
          $scope.selectedEntry = entriesArr[0];
        }
      } else {
        $scope.selectedEntry = entriesArr[0];
      }
      if (callback) {
        callback();
      }
    };
    $scope.toggleMenu = function () {
      $scope.menuOpen = !$scope.menuOpen;
    };
    editableProperties.then(function (data) {
      data = angular.copy(data);
      $scope.mergePlayerData(data);
      $scope.templatesToLoad = 0;
      $scope.propertiesSearch = [];
      $scope.menuData = [{
          'label': 'Menu Search',
          'description': 'Search allows you to find any plugin property within the menu.',
          'icon': 'TabSearch',
          'properties': [{
              'type': 'search',
              'model': 'menuProperties'
            }]
        }];
      var categoryIndex = 0;
      for (var cat in data) {
        categoryIndex++;
        var category = {
            'label': data[cat].label,
            'description': data[cat].description,
            'icon': data[cat].icon,
            properties: []
          };
        var plugs = data[cat].children;
        var plugins = [];
        var pluginIndex = -1;
        for (var plug in plugs) {
          var p = plugs[plug];
          if (p.children === undefined) {
            $scope.addPropertyToCategory(category, categoryIndex, p);
          } else {
            pluginIndex++;
            $scope.propertiesSearch.push({
              'label': p.label,
              'categoryIndex': categoryIndex,
              'accIndex': pluginIndex,
              'id': 'accHeader' + categoryIndex + '_' + pluginIndex
            });
            var plugin = {
                'enabled': p.enabled,
                'label': p.label,
                'description': p.description,
                'isopen': false,
                'model': p.model,
                'id': 'accHeader' + categoryIndex + '_' + pluginIndex
              };
            plugin.properties = [];
            var tabObj = {
                'type': 'tabs',
                'children': []
              };
            if (p.sections) {
              $scope.templatesToLoad++;
              for (var tab = 0; tab < p.sections.tabset.length; tab++) {
                tabObj.children.push(p.sections.tabset[tab]);
              }
            }
            for (var i = 0; i < p.children.length; i++) {
              if (p.children[i].filter !== undefined)
                p.children[i].initvalue = $scope.getFilter(p.children[i].initvalue, p.children[i].filter);
              $scope.templatesToLoad++;
              if (p.sections && p.children[i].section) {
                for (var t = 0; t < tabObj.children.length; t++) {
                  if (p.children[i].section == tabObj.children[t].key) {
                    tabObj.children[t].children.push($.extend(p.children[i], { 'id': 'prop' + $scope.templatesToLoad }));
                    $scope.propertiesSearch.push({
                      'label': p.children[i].label + ' (' + p.label + ')',
                      'categoryIndex': categoryIndex,
                      'accIndex': pluginIndex,
                      'tabIndex': t,
                      'id': 'prop' + $scope.templatesToLoad
                    });
                  }
                }
              } else {
                $scope.propertiesSearch.push({
                  'label': p.children[i].label + ' (' + p.label + ')',
                  'categoryIndex': categoryIndex,
                  'accIndex': pluginIndex,
                  'id': 'prop' + $scope.templatesToLoad
                });
                plugin.properties.push($.extend(p.children[i], { 'id': 'prop' + $scope.templatesToLoad }));
              }
            }
            if (p.sections) {
              plugin.properties.push(tabObj);
            }
            plugins.push(plugin);
          }
        }
        category.plugins = plugins;
        $scope.menuData.push(category);
      }
      for (var pl in $scope.playerData.config.plugins) {
        var custom_plugin = angular.copy($scope.playerData.config.plugins[pl]);
        if (custom_plugin.custom) {
          delete custom_plugin.custom;
          delete custom_plugin.enabled;
          delete custom_plugin.plugin;
          $scope.addCustomPlugin(pl, custom_plugin);
        }
      }
      for (var j = 2; j < $scope.menuData.length; j++) {
        $scope.menuData[j].pluginsNotLoaded = angular.copy($scope.menuData[j].plugins);
        delete $scope.menuData[j].plugins;
      }
      $scope.selectedCategory = $scope.menuData[1].label;
      requestNotificationChannel.requestEnded('edit');
      $scope.refreshPlayer();
    });
    $scope.addPropertyToCategory = function (category, categoryIndex, property) {
      $scope.templatesToLoad++;
      $scope.propertiesSearch.push({
        'label': property.label,
        'categoryIndex': categoryIndex,
        'accIndex': -1,
        'id': 'prop' + $scope.templatesToLoad
      });
      category.properties.push($.extend(property, { 'id': 'prop' + $scope.templatesToLoad }));
    };
    $scope.categorySelected = function (category) {
      $scope.selectedCategory = category;
      if (category == 'Menu Search') {
        $timeout(function () {
          $('#searchField').focus();
          for (var i = 2; i < $scope.menuData.length; i++)
            if ($scope.menuData[i].pluginsNotLoaded !== undefined) {
              $scope.menuData[i].plugins = angular.copy($scope.menuData[i].pluginsNotLoaded);
              delete $scope.menuData[i].pluginsNotLoaded;
            }
        }, 50, true);
      }
      $timeout(function () {
        for (var i = 2; i < $scope.menuData.length; i++)
          if ($scope.menuData[i].label == category && $scope.menuData[i].pluginsNotLoaded !== undefined) {
            $scope.menuData[i].plugins = angular.copy($scope.menuData[i].pluginsNotLoaded);
            delete $scope.menuData[i].pluginsNotLoaded;
          }
      }, 50, true);
    };
    $scope.menuLoaded = false;
    $scope.templatesLoaded = 0;
    $scope.$on('$includeContentLoaded', function (event) {
      $scope.templatesLoaded++;
      if ($scope.templatesLoaded == $scope.templatesToLoad) {
        $scope.menuLoaded = true;
        $timeout(function () {
          $('#searchField').focus();
        }, 100);
      }
    });
    $scope.togglePlugin = function (plugin, $event) {
      $event.stopPropagation();
      if (plugin.enabled) {
        $scope.removeValidation(plugin);
        delete $scope.playerData.config.plugins[plugin.model];
      } else {
        $scope.addValidation(plugin);
      }
      if (plugin.model == 'playlistAPI') {
        if (plugin.enabled) {
          $scope.entriesTypeSelector = 'Entries';
          $scope.selectDefaultEntry($scope.userEntries);
        } else {
          $scope.entriesTypeSelector = 'Playlist';
          $scope.selectDefaultEntry($scope.userPlaylists);
        }
      }
      $scope.dataChanged = true;
      window.parent.studioDataChanged = true;
      $timeout(function () {
        $scope.refreshPlayer();
      }, 0, true);
    };
    $scope.removeValidation = function (plugin) {
      for (var i = 0; i < plugin.properties.length; i++) {
        delete plugin.properties[i].invalidTooltip;
        var id = plugin.properties[i].id;
        if ($.inArray(id, $scope.invalidProps) != -1)
          $scope.invalidProps.splice($scope.invalidProps.indexOf(id), 1);
      }
    };
    $scope.addValidation = function (plugin) {
      for (var i = 0; i < plugin.properties.length; i++)
        $scope.validate(plugin.properties[i]);
    };
    $scope.searchProperty = function ($item, $model, $label) {
      $scope.selectedCategory = $scope.menuData[$item.categoryIndex].label;
      if ($item.accIndex != -1) {
        $scope.menuData[$item.categoryIndex].plugins[$item.accIndex].isopen = true;
      }
      if ($item.tabIndex && $item.tabIndex != -1) {
        var props = $scope.menuData[$item.categoryIndex].plugins[$item.accIndex].properties;
        for (var i = 0; i < props.length; i++) {
          if (props[i].type == 'tabs')
            props[i].children[$item.tabIndex].active = true;
        }
      }
      var counter = 0;
      var blinkID = setInterval(function () {
          var visible = $('#' + $item.id).css('visibility') == 'visible' ? 'hidden' : 'visible';
          $('#' + $item.id).css('visibility', visible);
          counter++;
          if (counter == 6)
            clearInterval(blinkID);
        }, 250);
    };
    $scope.lastRefreshID = '';
    $scope.propertyChanged = function (property, checkAutoRefresh) {
      if (property.selectedEntry && property.selectedEntry.id && property.model.indexOf('~') === 0) {
        $scope.selectedEntry = property.selectedEntry;
        localStorageService.set('defaultEntry', property.selectedEntry);
        $scope.setPlaylistEntry(property.selectedEntry.id, property.selectedEntry.text);
        $scope.refreshPlayer();
        return;
      }
      if (property['player-refresh'] && property['player-refresh'].indexOf('.') != -1) {
        var obj = property['player-refresh'].split('.')[0];
        var prop = property['player-refresh'].split('.')[1];
        var kdp = document.getElementById('kVideoTarget');
        kdp.setKDPAttribute(obj, prop, property.initvalue);
        return;
      }
      if (property.model === 'autoUpdate') {
        $scope.playerData['autoUpdate'] = property.initvalue;
        return;
      }
      $scope.dataChanged = true;
      window.parent.studioDataChanged = true;
      $scope.validate(property);
      if (property.aspectRatio && property.aspectRatio !== 'custom') {
        var aspect = property.aspectRatio == 'wide' ? 9 / 16 : 3 / 4;
        $scope.playerData.height = parseInt($scope.playerData.width * aspect);
      }
      $scope.refreshNeeded = property['player-refresh'] !== false;
      if (checkAutoRefresh !== false && $scope.refreshNeeded && $scope.autoPreview) {
        if (checkAutoRefresh == 'enter')
          $scope.lastRefreshID = property.id;
        if (checkAutoRefresh == 'blur' && $scope.lastRefreshID == property.id) {
          $scope.lastRefreshID = '';
        } else {
          $scope.refreshPlayer();
        }
      }
    };
    $scope.validate = function (property) {
      if (property.invalidTooltip)
        delete property.invalidTooltip;
      if ($.inArray(property.id, $scope.invalidProps) != -1)
        $scope.invalidProps.splice($scope.invalidProps.indexOf(property.id), 1);
      if (property.min && property.initvalue < property.min)
        property.invalidTooltip = 'Value must be equal or bigger than ' + property.min;
      if (property.max && parseInt(property.initvalue) > parseInt(property.max))
        property.invalidTooltip = 'Value must be equal or less than ' + property.max;
      if (property.require && property.initvalue === '')
        property.invalidTooltip = 'This field is required';
      if (property.invalidTooltip) {
        $scope.isValid = false;
        $scope.invalidProps.push(property.id);
      }
    };
    $scope.checkPlayerRefresh = function () {
      return $scope.refreshNeeded;
    };
    $scope.refreshPlayer = function () {
      $scope.refreshNeeded = false;
      if ($scope.selectedEntry !== '') {
        $scope.renderPlayer();
      } else {
        $scope.intervalID = setInterval(function () {
          if ($scope.selectedEntry !== '') {
            clearInterval($scope.intervalID);
            $scope.renderPlayer();
          }
        }, 100);
      }
    };
    $scope.renderPlayer = function () {
      $scope.updatePlayerData();
      $scope.$broadcast('beforeRenderEvent');
      $('.onpagePlaylistInterface').remove();
      $('#kVideoTarget').width($scope.playerData.width);
      $('#kVideoTarget').height($scope.playerData.height);
      for (var plug in $scope.playerData.config.plugins)
        if ($scope.playerData.config.plugins[plug]['enabled'] === true)
          $scope.playerData.config.plugins[plug]['plugin'] = true;
      $scope.setPlaylistEntry($scope.selectedEntry.id, $scope.selectedEntry.text);
      var flashvars = {};
      if ($scope.playerData.config.enviornmentConfig && $scope.playerData.config.enviornmentConfig.localizationCode) {
        angular.extend(flashvars, { 'localizationCode': $scope.playerData.config.enviornmentConfig.localizationCode });
      }
      if ($scope.simulateMobile) {
        angular.extend(flashvars, { 'EmbedPlayer.SimulateMobile': true });
      }
      delete $scope.playerData.config.enviornmentConfig;
      angular.extend(flashvars, { 'jsonConfig': angular.toJson($scope.playerData.config) });
      if (window.parent.kmc && window.parent.kmc.vars.ks) {
        angular.extend(flashvars, { 'ks': window.parent.kmc.vars.ks });
      }
      if ($scope.isIE8) {
        angular.extend(flashvars, { 'wmode': 'transparent' });
      }
      var entryID = $scope.selectedEntry.id ? $scope.selectedEntry.id : $scope.selectedEntry;
      PlayerService.renderPlayer($scope.playerData.partnerId, $scope.playerData.id, flashvars, entryID);
    };
    $scope.mergePlayerData = function (data) {
      if ($.isArray($scope.playerData.config.uiVars)) {
        var uiVarsObj = {};
        for (var i = 0; i < $scope.playerData.config.uiVars.length; i++)
          uiVarsObj[$scope.playerData.config.uiVars[i]['key']] = $scope.playerData.config.uiVars[i]['value'];
        $scope.playerData.config.uiVars = uiVarsObj;
      }
      $scope.excludedUiVars = [
        'autoPlay',
        'autoMute',
        'adsOnReplay',
        'enableTooltips',
        'EmbedPlayer.EnableMobileSkin'
      ];
      $scope.playerData.vars = [];
      var uivar;
      for (uivar in $scope.playerData.config.uiVars) {
        if ($scope.excludedUiVars.indexOf(uivar) === -1)
          $scope.playerData.vars.push({
            'label': uivar,
            'value': $scope.playerData.config.uiVars[uivar]
          });
      }
      for (uivar in $scope.playerData.config.uiVars) {
        if (uivar.indexOf('.') !== -1) {
          $scope.playerData.config.uiVars[uivar.split('.')[0]] = { 'enabled': true };
          $scope.playerData.config.uiVars[uivar.split('.')[0]][uivar.split('.')[1]] = $scope.playerData.config.uiVars[uivar];
          delete $scope.playerData.config.uiVars[uivar];
        }
      }
      if ($scope.playerData.config.plugins && $scope.playerData.config.plugins.playlistAPI) {
        var playlistData = $scope.playerData.config.plugins.playlistAPI;
        var playlistMenuArr = data.lookAndFeel.children.playlistAPI.children;
        var playlistIndex = 1;
        while (playlistData['kpl' + playlistIndex + 'Id']) {
          var found = false;
          for (var j = 0; j < playlistMenuArr.length; j++) {
            if (playlistMenuArr[j].model.indexOf('kpl' + playlistIndex + 'Id') !== -1) {
              found = true;
            }
          }
          if (!found) {
            playlistMenuArr.push({
              'model': 'config.plugins.playlistAPI.kpl' + playlistIndex + 'Id',
              'type': 'hiddenValue'
            });
            playlistMenuArr.push({
              'model': 'config.plugins.playlistAPI.kpl' + playlistIndex + 'Name',
              'type': 'hiddenValue'
            });
          }
          playlistIndex++;
        }
      }
      for (var cat in data) {
        var properties = data[cat].children;
        if ($.isArray(properties)) {
          $scope.getPlayerProperties(properties);
        } else {
          for (var plug in properties) {
            if (properties[plug].children) {
              properties[plug].model = plug;
              if ($scope.playerData.config.plugins[plug] || plug == 'uiVars') {
                properties[plug].enabled = true;
              } else {
                properties[plug].enabled = false;
              }
              $scope.getPlayerProperties(properties[plug].children);
            } else {
              $scope.getPlayerProperties([properties[plug]]);
            }
          }
        }
      }
    };
    $scope.getPlayerProperties = function (properties) {
      for (var i = 0; i < properties.length; i++) {
        if (properties[i].model && properties[i].model.indexOf('~') == -1) {
          var dataForModel = $scope.getDataForModel($scope.playerData, properties[i].model, properties[i].filter);
          if (dataForModel !== null) {
            properties[i].initvalue = dataForModel;
          }
        }
      }
    };
    $scope.getDataForModel = function (data, model, filter) {
      var val = angular.copy(data);
      var modelArr = model.split('.');
      for (var i = 0; i < modelArr.length; i++) {
        if (val[modelArr[i]] !== undefined) {
          val = val[modelArr[i]];
        } else {
          return null;
        }
      }
      return filter !== undefined ? $scope.getFilter(val, filter) : val;
    };
    $scope.getFilter = function (val, filter) {
      if (filter == 'companions' && !$.isArray(val)) {
        var companions = val.split(';');
        val = [];
        for (var i = 0; i < companions.length; i++)
          if (companions[i].indexOf(':') != -1)
            val.push({
              'label': companions[i].substr(0, companions[i].indexOf(':')),
              'width': companions[i].split(':')[1],
              'height': companions[i].split(':')[2]
            });
      }
      return val;
    };
    $scope.updatePlayerData = function () {
      for (var category = 1; category < $scope.menuData.length; category++) {
        if ($scope.menuData[category].properties !== undefined) {
          $scope.setPlayerProperties($scope.menuData[category].properties);
        }
        if ($scope.menuData[category]['plugins'] !== undefined || $scope.menuData[category]['pluginsNotLoaded'] !== undefined) {
          var pluginsStr = $scope.menuData[category]['plugins'] !== undefined ? 'plugins' : 'pluginsNotLoaded';
          for (var plug = 0; plug < $scope.menuData[category][pluginsStr].length; plug++)
            if ($scope.menuData[category][pluginsStr][plug].enabled === true) {
              var plugin = $scope.menuData[category][pluginsStr][plug];
              $scope.setPlayerProperties(plugin.properties);
              if (plugin.custom) {
                $scope.updateCustomPlugins(plugin.model);
              }
            }
        }
      }
      var uivar;
      for (uivar in $scope.playerData.config.uiVars) {
        if (typeof $scope.playerData.config.uiVars[uivar] === 'object') {
          var updatedUiVar, uiVarValue;
          for (var prop in $scope.playerData.config.uiVars[uivar]) {
            if (prop != 'enabled') {
              updatedUiVar = uivar + '.' + prop;
              uiVarValue = $scope.playerData.config.uiVars[uivar][prop];
            }
          }
          delete $scope.playerData.config.uiVars[uivar];
          $scope.playerData.config.uiVars[updatedUiVar] = uiVarValue;
        }
      }
      for (var i = 0; i < $scope.playerData.vars.length; i++) {
        if ($scope.excludedUiVars.indexOf($scope.playerData.vars[i].label) === -1)
          if ($scope.playerData.vars[i].label !== '' && $scope.playerData.vars[i].value !== '')
            $scope.playerData.config.uiVars[$scope.playerData.vars[i].label] = utilsSvc.str2val($scope.playerData.vars[i].value);
      }
      var uiVarsArray = [];
      for (uivar in $scope.playerData.config.uiVars) {
        var found = false;
        if ($scope.excludedUiVars.indexOf(uivar) !== -1)
          found = true;
        for (var j = 0; j < $scope.playerData.vars.length; j++) {
          if ($scope.playerData.vars[j].label === uivar)
            found = true;
        }
        if (!found)
          delete $scope.playerData.config.uiVars[uivar];
        else
          uiVarsArray.push({
            'key': uivar,
            'value': $scope.playerData.config.uiVars[uivar],
            'overrideFlashvar': false
          });
      }
      $scope.playerData.config.uiVars = uiVarsArray;
    };
    $scope.setPlayerProperties = function (properties) {
      for (var i = 0; i < properties.length; i++) {
        if (properties[i].type == 'tabs') {
          for (var tab = 0; tab < properties[i].children.length; tab++)
            for (var prop = 0; prop < properties[i].children[tab].children.length; prop++) {
              $scope.setDataForModel(properties[i].children[tab].children[prop]);
            }
        } else {
          $scope.setDataForModel(properties[i]);
        }
      }
    };
    $scope.setDataForModel = function (data) {
      if (data.model && data.model.indexOf('~') == -1 && data.type != 'readonly') {
        var objArr = data.model.split('.');
        var pData = $scope.playerData;
        for (var j = 0; j < objArr.length; j++) {
          var prop = objArr[j];
          if (j == objArr.length - 1 && data.initvalue !== undefined) {
            pData[prop] = data.filter ? $scope.setFilter(data.initvalue, data.filter) : data.initvalue;
          } else {
            if (j == objArr.length - 2 && !pData[prop]) {
              pData[prop] = data.custom ? {
                'custom': true,
                'enabled': true
              } : { 'enabled': true };
            }
            if (pData[prop]) {
              pData = pData[prop];
            }
          }
        }
      }
    };
    $scope.setFilter = function (data, filter) {
      var res = '';
      if (filter == 'companions') {
        for (var i = 0; i < data.length; i++) {
          res += data[i].label + ':' + data[i].width + ':' + data[i].height + ';';
        }
        return res.substr(0, res.length - 1);
      }
      if (filter == 'entry') {
        return data.id ? data.id : data;
      }
    };
    $scope.backToList = function () {
      if (!$scope.dataChanged) {
        $location.url('/list');
      } else {
        var modal = utilsSvc.confirm('Navigation confirmation', 'You are about to leave this page without saving, are you sure you want to discard the changes?', 'Continue');
        modal.result.then(function (result) {
          if (result) {
            $location.url('/list');
          }
        });
      }
    };
    $scope.save = function () {
      if ($scope.invalidProps.length > 0) {
        utilsSvc.alert('Save Player Settings', 'Some plugin features values are invalid. The player cannot be saved.');
      } else {
        $scope.updatePlayerData();
        $scope.dataChanged = false;
        window.parent.studioDataChanged = false;
        if ($scope.playerData.config.plugins.playlistAPI && $scope.playerData.config.plugins.playlistAPI.plugin) {
          $scope.playerData.tags = 'html5studio,playlist';
        } else {
          $scope.playerData.tags = 'html5studio,player';
        }
        PlayerService.savePlayer($scope.playerData).then(function (value) {
          localStorageService.remove('tempPlayerID');
          apiService.setCache(false);
          utilsSvc.alert('Save Player Settings', 'Player Saved Successfully');
        }, function (msg) {
          utilsSvc.alert('Player save failure', msg);
        });
      }
    };
    $scope.setPluginEnabled = function (model, enabled) {
      for (var cat in $scope.menuData) {
        var plugins = $scope.menuData[cat].pluginsNotLoaded ? $scope.menuData[cat].pluginsNotLoaded : $scope.menuData[cat].plugins;
        if (plugins && plugins.length > 0) {
          for (var i = 0; i < plugins.length; i++) {
            if (plugins[i].model === model) {
              plugins[i].enabled = enabled;
              if ($scope.playerData.config.plugins[model] && !enabled) {
                delete $scope.playerData.config.plugins[model];
              }
            }
          }
        }
      }
    };
    $scope.addPlugin = function () {
      var modal = utilsSvc.userInput('Add custom plugin', 'Plugin Name:', 'Add', { 'width': '50%' });
      $timeout(function () {
        $('.userInput').alphanum({ allowSpace: false });
      }, 50);
      modal.result.then(function (result) {
        if (result) {
          $scope.addCustomPlugin(result, {});
        }
      });
    };
    $scope.importPlugin = function () {
      var modal = utilsSvc.userInput('Import plugin', 'Plugin Configuration String:', 'Import', { 'width': '100%' });
      var keyVal;
      modal.result.then(function (result) {
        if (result) {
          var arr = result.split('&');
          if (arr[0].indexOf('=') == -1) {
            var model = arr[0];
            var data = {};
            for (var i = 1; i < arr.length; i++) {
              keyVal = arr[i].split('=');
              data[keyVal[0]] = keyVal[1];
            }
            $scope.addCustomPlugin(model, data);
          } else {
            for (var inx = 0; inx < arr.length; inx++) {
              keyVal = arr[inx].split('=');
              for (var j = 0; j < $scope.menuData.length; j++) {
                if ($scope.menuData[j].label === 'Plugins') {
                  for (var k = 0; k < $scope.menuData[j].plugins.length; k++) {
                    if ($scope.menuData[j].plugins[k].model === 'uiVars') {
                      var vars = $scope.menuData[j].plugins[k].properties[0].initvalue;
                      vars.push({
                        'label': keyVal[0],
                        'value': keyVal[1]
                      });
                    }
                  }
                }
              }
            }
          }
        }
      });
    };
    $scope.addCustomPlugin = function (model, data) {
      for (var i = 0; i < $scope.menuData.length; i++) {
        if ($scope.menuData[i].label === 'Plugins') {
          $scope.menuData[i].plugins.push({
            description: model + ' custom plugin.',
            enabled: true,
            isopen: $.isEmptyObject(data) ? true : false,
            custom: true,
            label: model + ' custom plugin',
            model: model,
            properties: [{
                initvalue: data,
                allowComplexTypes: false,
                custom: true,
                helpnote: 'Configuration options',
                label: 'Configuration options',
                model: 'config.plugins.' + model + '.config',
                type: 'json'
              }]
          });
        }
      }
    };
    $scope.updateCustomPlugins = function (plugin) {
      if ($scope.playerData.config.plugins[plugin] && $scope.playerData.config.plugins[plugin]['config']) {
        var conf = $scope.playerData.config.plugins[plugin]['config'];
        $scope.playerData.config.plugins[plugin] = {
          'enabled': true,
          'custom': true,
          'plugin': true
        };
        for (var prop in conf) {
          $scope.playerData.config.plugins[plugin][prop] = conf[prop];
        }
        delete $scope.playerData.config.plugins[plugin].config;
      }
    };
  }
]);
'use strict';
angular.module('KMCModule').controller('LoginCtrl', [
  '$scope',
  'apiService',
  '$location',
  'localStorageService',
  'requestNotificationChannel',
  '$filter',
  function ($scope, apiService, $location, localStorageService, requestNotificationChannel, $filter) {
    requestNotificationChannel.requestEnded('list');
    $scope.formError = true;
    $scope.formHelpMsg = $filter('translate')('You must login to use this application');
    $scope.email = '';
    $scope.pwd = '';
    $scope.login = function () {
      apiService.doRequest({
        'service': 'user',
        'action': 'loginbyloginid',
        'loginId': $scope.email,
        'password': $scope.pwd
      }).then(function (data) {
        if (localStorageService.isSupported()) {
          localStorageService.add('ks', data);
        }
        apiService.setKs(data);
        $location.path('/list');
      }, function (errorMsg) {
        $scope.formError = true;
        $scope.formHelpMsg = errorMsg;
      });
    };
  }
]);
'use strict';
angular.module('KMC.controllers', []).controller('ModalInstanceCtrl', [
  '$scope',
  '$modalInstance',
  'settings',
  function ($scope, $modalInstance, settings) {
    $scope.title = '';
    $scope.message = '';
    $scope.buttons = [
      {
        result: false,
        label: 'Cancel',
        cssClass: 'btn-default'
      },
      {
        result: true,
        label: 'OK',
        cssClass: 'btn-primary'
      }
    ];
    $scope.close = function (result) {
      $modalInstance.close(result);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    angular.extend($scope, settings);
  }
]).controller('ModalInstanceInputCtrl', [
  '$scope',
  '$modalInstance',
  'settings',
  function ($scope, $modalInstance, settings) {
    $scope.userInput = '';
    $scope.title = '';
    $scope.message = '';
    $scope.buttons = [
      {
        result: false,
        label: 'Cancel',
        cssClass: 'btn-default'
      },
      {
        result: true,
        label: 'OK',
        cssClass: 'btn-primary'
      }
    ];
    $scope.close = function (result) {
      result = result ? this.userInput : false;
      $modalInstance.close(result);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    angular.extend($scope, settings);
  }
]);
;
KMCMenu.controller('entrySelectorCtrl', [
  '$scope',
  function ($scope) {
    $scope.getLabel = function (id, configObject) {
      var searchArr = configObject == 'playlistSelectBox' ? $scope.userPlaylists : $scope.userEntries;
      for (var i = 0; i < searchArr.length; i++) {
        if (searchArr[i].id === id) {
          return searchArr[i].text;
        }
      }
      return id;
    };
  }
]);
KMCMenu.controller('jsonCtrl', [
  '$scope',
  function ($scope) {
    $scope.$on('jsonChangeEvent', function (event, mass) {
      $scope.propertyChanged({ 'player-refresh': 'true' }, false);
    });
  }
]);
KMCMenu.controller('keyValuePairsCtrl', [
  '$scope',
  function ($scope) {
    $scope.keyValuePairs = [];
    if ($scope.playerData.config.plugins && $scope.playerData.config.plugins[$scope.plugin.model]) {
      var data = $scope.playerData.config.plugins[$scope.plugin.model];
      for (var key in data) {
        if (key !== 'plugin' && key !== 'enabled' && key !== 'keyValuePairs') {
          $scope.keyValuePairs.push({
            'key': key,
            'value': data[key]
          });
        }
      }
    }
    $scope.$on('beforeRenderEvent', function (event) {
      $scope.updateKeyValueData();
    });
    $scope.updateData = function () {
      $scope.updateKeyValueData();
    };
    $scope.updateKeyValueData = function () {
      if ($scope.playerData.config.plugins && $scope.playerData.config.plugins[$scope.plugin.model]) {
        var data = $scope.playerData.config.plugins[$scope.plugin.model];
        for (var prop in data) {
          if (prop !== 'plugin' && prop !== 'enabled') {
            delete data[prop];
          }
        }
        for (var i = 0; i < $scope.keyValuePairs.length; i++) {
          data[$scope.keyValuePairs[i].key.toString()] = $scope.keyValuePairs[i].value.toString();
        }
      }
    };
  }
]);
'use strict';
angular.module('KMCModule').controller('PlayerCreateCtrl', [
  '$scope',
  '$filter',
  'templates',
  'userId',
  'playerTemplates',
  function ($scope, $filter, templates, userId, playerTemplates) {
    $scope.title = $filter('translate')('New player - from template');
    $scope.templates = templates.data;
    $scope.templateType = 'system';
    $scope.userId = userId;
    $scope.loading = false;
    $scope.$watch('templateType', function (newVal, oldVal) {
      if (newVal != oldVal) {
        if (newVal == 'user') {
          $scope.loading = true;
          playerTemplates.listUser($scope.userID).success(function (response) {
            $scope.templates = response;
            $scope.loading = false;
          });
        } else {
          $scope.loading = true;
          $scope.templates = templates.data;
          $scope.loading = false;
        }
      }
    });
    $scope.makeTooltip = function (index) {
      var item = $scope.templates[index];
      if (item && typeof item.settings != 'undefined' && typeof item.settings.name != 'undefined')
        return item.settings.name + '<br/>' + item.id + '<br/> Any information you will decide to show';
    };
  }
]);
;
'use strict';
angular.module('KMCModule').controller('PlayerListCtrl', [
  'apiService',
  'loadINI',
  '$location',
  '$rootScope',
  '$scope',
  '$filter',
  '$modal',
  '$timeout',
  '$log',
  '$compile',
  '$window',
  'localStorageService',
  'requestNotificationChannel',
  'PlayerService',
  '$q',
  'utilsSvc',
  function (apiService, loadINI, $location, $rootScope, $scope, $filter, $modal, $timeout, $log, $compile, $window, localStorageService, requestNotificationChannel, PlayerService, $q, utilsSvc) {
    requestNotificationChannel.requestStarted('list');
    $rootScope.lang = 'en-US';
    var getHTML5Version = function (path) {
      var version = '';
      if (path.indexOf('{latest}') !== -1) {
        version = 'latest';
      } else {
        version = path.substring(path.lastIndexOf('/v') + 2, path.indexOf('/mwEmbedLoader.php'));
      }
      return version;
    };
    $scope.search = '';
    $scope.searchSelect2Options = {};
    $scope.currentPage = 1;
    $scope.maxSize = parseInt(localStorageService.get('listSize')) || 10;
    $scope.$watch('maxSize', function (newval, oldval) {
      if (newval != oldval) {
        localStorageService.set('listSize', newval);
        $scope.$broadcast('layoutChange');
      }
    });
    $scope.triggerLayoutChange = function () {
      $scope.$broadcast('layoutChange');
    };
    $scope.uiSelectOpts = {
      width: '60px',
      minimumResultsForSearch: -1
    };
    var config = null;
    try {
      var kmc = window.parent.kmc;
      if (kmc && kmc.vars && kmc.vars.studio.config) {
        config = kmc.vars.studio.config;
        $scope.UIConf = angular.fromJson(config);
      }
    } catch (e) {
      $log.error('Could not located parent.kmc: ' + e);
    }
    if (!config) {
      loadINI.getINIConfig().success(function (data) {
        $scope.UIConf = data;
      });
    }
    PlayerService.getKDPConfig();
    if (localStorageService.get('tempPlayerID')) {
      var deletePlayerRequest = {
          'service': 'uiConf',
          'action': 'delete',
          'id': localStorageService.get('tempPlayerID')
        };
      apiService.doRequest(deletePlayerRequest).then(function (data) {
        localStorageService.remove('tempPlayerID');
      });
    }
    var playersRequest = {
        'filter:tagsMultiLikeOr': 'kdp3,html5studio',
        'filter:orderBy': '-updatedAt',
        'filter:objTypeIn': '1,8',
        'filter:objectType': 'KalturaUiConfFilter',
        'filter:creationModeEqual': '2',
        'ignoreNull': '1',
        'responseProfile:objectType': 'KalturaDetachedResponseProfile',
        'responseProfile:type': '1',
        'responseProfile:fields': 'id,name,html5Url,createdAt,updatedAt,tags',
        'page:objectType': 'KalturaFilterPager',
        'pager:pageIndex': '1',
        'pager:pageSize': '999',
        'service': 'uiConf',
        'action': 'list'
      };
    apiService.doRequest(playersRequest).then(function (data) {
      $scope.data = data.objects;
      $scope.calculateTotalItems();
      PlayerService.cachePlayers(data.objects);
      requestNotificationChannel.requestEnded('list');
      setTimeout(function () {
        $scope.triggerLayoutChange();
      }, 300);
    });
    $scope.filtered = $filter('filter')($scope.data, $scope.search) || $scope.data;
    $scope.calculateTotalItems = function () {
      if ($scope.filtered)
        $scope.totalItems = $scope.filtered.length;
      else if ($scope.data) {
        $scope.totalItems = $scope.data.length;
      }
    };
    $scope.requiredVersion = PlayerService.getRequiredVersion();
    $scope.sort = {
      sortCol: 'createdAt',
      reverse: true
    };
    $scope.sortBy = function (colName) {
      $scope.sort.sortCol = colName;
      $scope.sort.reverse = !$scope.sort.reverse;
    };
    $scope.checkV2Upgrade = function (item) {
      var html5libVersion = getHTML5Version(item.html5Url);
      return !$scope.checkVersionNeedsUpgrade(item) && window.MWEMBED_VERSION !== html5libVersion && html5libVersion !== 'latest';
    };
    $scope.checkVersionNeedsUpgrade = function (item) {
      var html5libVersion = getHTML5Version(item.html5Url)[0];
      return html5libVersion == '1';
    };
    $scope.checkOldPlaylistPlayer = function (item) {
      var html5libVersion = getHTML5Version(item.html5Url)[0];
      return html5libVersion == '1' && item.tags.indexOf('playlist') !== -1;
    };
    $scope.showSubTitle = true;
    $scope.getThumbnail = function (item) {
      if (typeof item.thumbnailUrl != 'undefined')
        return item.thumbnailUrl;
      else
        return $scope.defaultThumbnailUrl;
    };
    $scope.defaultThumbnailUrl = 'img/mockPlayerThumb.png';
    var timeVar;
    $scope.$watch('search', function (newValue, oldValue) {
      $scope.showSubTitle = newValue;
      if (newValue.length > 0) {
        $scope.title = $filter('translate')('search for') + ' "' + newValue + '"';
      } else {
        if (oldValue)
          $scope.title = $filter('translate')('Players list');
      }
      if (timeVar) {
        $timeout.cancel(timeVar);
      }
      timeVar = $timeout(function () {
        $scope.triggerLayoutChange();
        $scope.calculateTotalItems();
        timeVar = null;
      }, 100);
    });
    $scope.oldVersionEditText = $filter('translate')('This player must be updated before editing. <br/>' + 'Some features and design may be lost.');
    $scope.oldPlaylistEditText = $filter('translate')('Playlists created in Flash Studio cannot be edited in Universal Studio.<br>Please use Flash Studio to edit this player.');
    var goToEditPage = function (id) {
      requestNotificationChannel.requestStarted('edit');
      $location.path('/edit/' + id);
    };
    $scope.goToEditPage = function (item, $event) {
      if ($event)
        $event.preventDefault();
      if (!$scope.checkVersionNeedsUpgrade(item) && !$scope.checkOldPlaylistPlayer(item)) {
        goToEditPage(item.id);
        return false;
      } else {
        var msgText, buttons;
        if ($scope.checkVersionNeedsUpgrade(item)) {
          msgText = $filter('translate')('This player must be updated before editing. <br/>Some features and design may be lost.');
          buttons = [
            {
              result: false,
              label: 'Cancel',
              cssClass: 'btn-default'
            },
            {
              result: true,
              label: 'Update',
              cssClass: 'btn-primary'
            }
          ];
        }
        if ($scope.checkOldPlaylistPlayer(item)) {
          msgText = $filter('translate')('Playlists created in Flash Studio cannot be edited in Universal Studio.<br>Please use Flash Studio to edit this player.');
          buttons = [{
              result: false,
              label: 'OK',
              cssClass: 'btn-default'
            }];
        }
        var modal = $modal.open({
            templateUrl: 'templates/message.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
              settings: function () {
                return {
                  'title': 'Edit confirmation',
                  'message': msgText,
                  buttons: buttons
                };
              }
            }
          });
        modal.result.then(function (result) {
          if (result) {
            $scope.update(item).then(function () {
              goToEditPage(item.id);
            });
          }
        }, function () {
          return $log.info('edit when outdated modal dismissed at: ' + new Date());
        });
      }
    };
    $scope.newPlayer = function () {
      $location.path('/new');
    };
    $scope.duplicate = function (item) {
      PlayerService.clonePlayer(item).then(function (data) {
        $scope.data.unshift(data[1]);
        PlayerService.cachePlayers($scope.data);
        $scope.goToEditPage(data[1]);
      });
    };
    $scope.deletePlayer = function (item) {
      var modal = $modal.open({
          templateUrl: 'templates/message.html',
          controller: 'ModalInstanceCtrl',
          resolve: {
            settings: function () {
              return {
                'title': 'Delete confirmation',
                'message': 'Are you sure you want to delete the player?'
              };
            }
          }
        });
      modal.result.then(function (result) {
        if (result)
          PlayerService.deletePlayer(item.id).then(function () {
            $scope.data.splice($scope.data.indexOf(item), 1);
            $scope.triggerLayoutChange();
          }, function (reason) {
            $modal.open({
              templateUrl: 'templates/message.html',
              controller: 'ModalInstanceCtrl',
              resolve: {
                settings: function () {
                  return {
                    'title': 'Delete failure',
                    'message': reason
                  };
                }
              }
            });
          });
      }, function () {
        $log.info('Delete modal dismissed at: ' + new Date());
      });
    };
    $scope.upgrade = function (player) {
      var upgradeProccess = $q.defer();
      var html5libVersion = getHTML5Version(player.html5Url);
      var currentVersion = window.MWEMBED_VERSION;
      var msg = 'This will update the player "' + player.name + '" (ID: ' + player.id + ').';
      msg += '<br>Current player version: ' + html5libVersion;
      msg += '<br>Update to version: ' + currentVersion + '<a href="https://github.com/kaltura/mwEmbed/releases/tag/v' + currentVersion + '" target="_blank"> (release notes)</a>';
      var modal = utilsSvc.confirm('Updating confirmation', msg, 'Update');
      modal.result.then(function (result) {
        if (result) {
          var html5lib = player.html5Url.substr(0, player.html5Url.lastIndexOf('/v') + 2) + window.MWEMBED_VERSION + '/mwEmbedLoader.php';
          PlayerService.playerUpgrade(player, html5lib).then(function (data) {
            player.html5Url = html5lib;
            upgradeProccess.resolve('update finished successfully');
            utilsSvc.alert('Player Updated', 'The player was updated successfully.');
            if ($('#kcms', window.parent.document).length > 0) {
              $('#kcms', window.parent.document)[0].refreshPlayersList();
            }
          }, function (reason) {
            utilsSvc.alert('Update player failure', reason);
            upgradeProccess.reject('update canceled');
          });
        } else {
          $log.info('Update player dismissed at: ' + new Date());
          upgradeProccess.reject('update canceled');
        }
      });
      return upgradeProccess.promise;
    };
    $scope.update = function (player) {
      var upgradeProccess = $q.defer();
      var currentVersion = player.html5Url.split('/v')[1].split('/')[0];
      var text = '<span>' + $filter('translate')('Do you want to upgrade this player?<br>Some features and design may be lost.') + '</span>';
      var isPlaylist = player.tags.indexOf('playlist') !== -1;
      if (isPlaylist) {
        text += '<br><span><b>Note:</b> Playlist configuration will not be updated.<br>Please re-configure your playlist plugin after this upgrade.</span>';
      }
      var html5lib = player.html5Url.substr(0, player.html5Url.lastIndexOf('/v') + 2) + window.MWEMBED_VERSION + '/mwEmbedLoader.php';
      var modal = utilsSvc.confirm('Upgrade confirmation', text, 'Upgrade');
      modal.result.then(function (result) {
        if (result)
          PlayerService.playerUpdate(player, html5lib, isPlaylist).then(function (data) {
            player.config = angular.fromJson(data.config);
            player.html5Url = html5lib;
            player.tags = isPlaylist ? 'html5studio,playlist' : 'html5studio,player';
            upgradeProccess.resolve('upgrade finished successfully');
            if ($('#kcms', window.parent.document).length > 0) {
              $('#kcms', window.parent.document)[0].refreshPlayersList();
            }
          }, function (reason) {
            utilsSvc.alert('Update player failure', reason);
            upgradeProccess.reject('upgrade canceled');
          });
      }, function () {
        $log.info('Update player dismissed at: ' + new Date());
        upgradeProccess.reject('upgrade canceled');
      });
      return upgradeProccess.promise;
    };
  }
]);
;
KMCMenu.controller('playlistCtrl', [
  '$scope',
  '$modal',
  'utilsSvc',
  function ($scope, $modal, utilsSvc) {
    $scope.additionalPlaylists = [];
    for (var i = 0; i < $scope.plugin.properties.length; i++) {
      var prop = $scope.plugin.properties[i];
      if (prop.model.indexOf('config.plugins.playlistAPI.kpl') === 0 && prop.model.indexOf('Id') === prop.model.length - 2) {
        var playlistID = prop.initvalue;
        var playlistName = $scope.plugin.properties[i + 1].initvalue;
        var editable = prop.model.indexOf('config.plugins.playlistAPI.kpl0Id') === -1;
        $scope.additionalPlaylists.push({
          'id': playlistID,
          'name': playlistName,
          'editable': editable
        });
      }
    }
    if ($scope.playerData.config.plugins && $scope.playerData.config.plugins.playlistAPI) {
      $scope.additionalPlaylists[0] = {
        'id': $scope.playerData.config.plugins.playlistAPI.kpl0Id,
        'name': $scope.playerData.config.plugins.playlistAPI.kpl0Name,
        'editable': false
      };
    }
    $scope.$on('setPlaylistEvent', function (event, params) {
      $scope.additionalPlaylists[0] = {
        'id': params[0],
        'name': params[1],
        'editable': false
      };
    });
    $scope.addPlaylist = function (prop) {
      $scope.additionalPlaylists.push({
        'id': '',
        'name': '',
        'editable': true
      });
      $scope.propertyChanged(prop, true);
    };
    $scope.deletePlaylist = function (index, prop) {
      $scope.additionalPlaylists.splice(index, 1);
      $scope.updatePlaylist(prop, true);
    };
    $scope.updatePlaylist = function (prop, trigger) {
      for (var i = $scope.plugin.properties.length - 1; i >= 0; i--) {
        var p = $scope.plugin.properties[i];
        if (p.model.indexOf('config.plugins.playlistAPI.kpl') === 0) {
          $scope.plugin.properties.splice(i, 1);
        }
      }
      for (var playlistIndex = 0; playlistIndex < $scope.additionalPlaylists.length; playlistIndex++) {
        $scope.plugin.properties.push({
          'model': 'config.plugins.playlistAPI.kpl' + playlistIndex + 'Id',
          'initvalue': $scope.additionalPlaylists[playlistIndex].id,
          'type': 'hiddenValue'
        });
        $scope.plugin.properties.push({
          'model': 'config.plugins.playlistAPI.kpl' + playlistIndex + 'Name',
          'initvalue': $scope.additionalPlaylists[playlistIndex].name,
          'type': 'hiddenValue'
        });
      }
      if ($scope.playerData.config.plugins && $scope.playerData.config.plugins.playlistAPI) {
        var pData = $scope.playerData.config.plugins.playlistAPI;
        if (pData['kpl' + $scope.additionalPlaylists.length + 'Id']) {
          delete pData['kpl' + $scope.additionalPlaylists.length + 'Id'];
          delete pData['kpl' + $scope.additionalPlaylists.length + 'Name'];
        }
      }
      $scope.propertyChanged(prop, trigger);
    };
  }
]);
KMCMenu.controller('relatedCtrl', [
  '$scope',
  function ($scope) {
    $scope.relatedOption = 'relatedToEntry';
    $scope.entryList = '';
    $scope.playlistId = {
      id: '',
      text: ''
    };
    if ($scope.playerData.config.plugins && $scope.playerData.config.plugins['related']) {
      var data = $scope.playerData.config.plugins['related'];
      if (data.entryList && data.entryList !== '') {
        $scope.relatedOption = 'entryList';
        $scope.entryList = data.entryList;
      }
      if (data.playlistId && data.playlistId !== '') {
        $scope.relatedOption = 'playlistId';
        $scope.playlistId = data.playlistId;
      }
    }
    $scope.entryListChange = function () {
      $scope.playerData.config.plugins['related'].playlistId = null;
      $scope.playlistId = {
        id: '',
        text: ''
      };
      $scope.playerData.config.plugins['related'].entryList = $scope.entryList;
    };
    $scope.playlistIdChange = function () {
      $scope.playerData.config.plugins['related'].entryList = null;
      $scope.entryList = '';
      $scope.playerData.config.plugins['related'].playlistId = $scope.playlistId.id;
    };
    $scope.relatedSelected = function () {
      $scope.playerData.config.plugins['related'].playlistId = undefined;
      $scope.playerData.config.plugins['related'].entryList = null;
      $scope.playlistId = {
        id: '',
        text: ''
      };
      $scope.entryList = '';
      $scope.propertyChanged('related', true);
    };
    $scope.getLabel = function (id, configObject) {
      var searchArr = configObject == 'playlistSelectBox' ? $scope.userPlaylists : $scope.userEntries;
      for (var i = 0; i < searchArr.length; i++) {
        if (searchArr[i].id === id) {
          return searchArr[i].text;
        }
      }
      return id;
    };
  }
]);
'use strict';
var KMCServices = angular.module('KMC.services', []);
KMCServices.config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
]);
KMCServices.factory('apiCache', [
  '$cacheFactory',
  function ($cacheFactory) {
    return $cacheFactory('apiCache', { capacity: 10 });
  }
]);
KMCServices.factory('select2Svc', [
  '$timeout',
  function ($timeout) {
    var select2Svc = {
        'getConfig': function (entries, searchFunc) {
          var confObj = {
              allowClear: false,
              width: '100%',
              initSelection: function (element, callback) {
                callback($(element).data('$ngModelController').$modelValue);
              },
              query: function (query) {
                var timeVar = null;
                var data = { results: [] };
                if (query.term) {
                  if (timeVar) {
                    $timeout.cancel(timeVar);
                  }
                  timeVar = $timeout(function () {
                    searchFunc(query.term).then(function (results) {
                      angular.forEach(results.objects, function (entry) {
                        data.results.push({
                          id: entry.id,
                          text: entry.name
                        });
                      });
                      timeVar = null;
                      return query.callback(data);
                    });
                  }, 200);
                } else {
                  return query.callback({ results: entries });
                }
                query.callback(data);
              }
            };
          return confObj;
        }
      };
    return select2Svc;
  }
]);
KMCServices.factory('utilsSvc', [
  '$modal',
  function ($modal) {
    var utilsSvc = {
        'str2val': function (str) {
          if (typeof str !== 'string')
            return str;
          var retVal = str;
          if (str.toLowerCase() === 'true')
            retVal = true;
          if (str.toLowerCase() === 'false')
            retVal = false;
          if (!isNaN(parseFloat(str)) && parseFloat(str).toString().length === str.length)
            retVal = parseFloat(str);
          return retVal;
        },
        'alert': function (title, msg) {
          var retVal = $modal.open({
              templateUrl: 'templates/message.html',
              controller: 'ModalInstanceCtrl',
              resolve: {
                settings: function () {
                  return {
                    'title': title,
                    'message': msg,
                    buttons: [{
                        result: true,
                        label: 'OK',
                        cssClass: 'btn-primary'
                      }]
                  };
                }
              }
            });
          return retVal;
        },
        'confirm': function (title, msg, lbl) {
          var retVal = $modal.open({
              templateUrl: 'templates/message.html',
              controller: 'ModalInstanceCtrl',
              resolve: {
                settings: function () {
                  return {
                    'title': title,
                    'message': msg,
                    buttons: [
                      {
                        result: false,
                        label: 'Cancel',
                        cssClass: 'btn-default'
                      },
                      {
                        result: true,
                        label: lbl,
                        cssClass: 'btn-primary'
                      }
                    ]
                  };
                }
              }
            });
          return retVal;
        },
        'userInput': function (title, msg, lbl, inputStyle) {
          var retVal = $modal.open({
              templateUrl: 'templates/inputWindow.html',
              controller: 'ModalInstanceInputCtrl',
              resolve: {
                settings: function () {
                  return {
                    'title': title,
                    'inputStyle': inputStyle ? inputStyle : {},
                    'message': msg,
                    buttons: [
                      {
                        result: false,
                        label: 'Cancel',
                        cssClass: 'btn-default'
                      },
                      {
                        result: true,
                        label: lbl,
                        cssClass: 'btn-primary'
                      }
                    ]
                  };
                }
              }
            });
          return retVal;
        }
      };
    return utilsSvc;
  }
]);
KMCServices.factory('sortSvc', [function () {
    var containers = {};
    var sorter = {};
    var Container = function Container(name) {
      this.name = name;
      this.elements = [];
      containers[name] = this;
    };
    Container.prototype.addElement = function (model) {
      this.elements.push(model);
    };
    Container.prototype.callObjectsUpdate = function () {
      angular.forEach(this.elements, function (model) {
        cl(model.sortVal + ' ' + model.model);
      });
    };
    Container.prototype.removeElement = function (model) {
      var index = this.elements.indexOf(model);
      if (index != -1)
        this.elements.splice(index, 1);
    };
    sorter.sortScope = '';
    sorter.register = function (containerName, model) {
      var container = typeof containers[containerName] == 'undefined' ? new Container(containerName) : containers[containerName];
      container.addElement(model);
    };
    sorter.update = function (newVal, oldVal, model) {
      var oldContainer = containers[oldVal];
      var newContainer = !containers[newVal] ? new Container(newVal) : containers[newVal];
      if (oldContainer) {
        oldContainer.removeElement(model);
      }
      newContainer.addElement(model);
      if (typeof sorter.sortScope == 'object') {
        sorter.sortScope.$broadcast('sortContainersChanged');
      }
    };
    sorter.getObjects = function () {
      return containers;
    };
    sorter.saveOrder = function (containersObj) {
      containers = containersObj;
      angular.forEach(containers, function (container) {
        container.callObjectsUpdate();
      });
    };
    return sorter;
  }]);
KMCServices.factory('PlayerService', [
  '$http',
  '$modal',
  '$log',
  '$q',
  'apiService',
  '$filter',
  'localStorageService',
  '$location',
  'utilsSvc',
  function ($http, $modal, $log, $q, apiService, $filter, localStorageService, $location, utilsSvc) {
    var playersCache = {};
    var currentPlayer = {};
    var previewEntry;
    var previewEntryObj;
    var playerId = 'kVideoTarget';
    var currentRefresh = null;
    var nextRefresh = false;
    var kdpConfig = '';
    var defaultCallback = function () {
      playersService.refreshNeeded = false;
      currentRefresh.resolve(true);
      currentRefresh = null;
      if (nextRefresh) {
        nextRefresh = false;
        playerRefresh();
      }
      logTime('renderPlayerDone');
    };
    var playerRefresh = function () {
      if (!currentRefresh) {
        currentRefresh = $q.defer();
        try {
          playersService.renderPlayer(defaultCallback);
        } catch (e) {
          currentRefresh.reject(e);
        }
      } else {
        nextRefresh = true;
      }
      return currentRefresh.promise;
    };
    var playersService = {
        autoRefreshEnabled: false,
        clearCurrentRefresh: function () {
          currentRefresh = null;
        },
        'refreshNeeded': false,
        getCurrentRefresh: function () {
          return currentRefresh;
        },
        'clearCurrentPlayer': function () {
          currentPlayer = {};
        },
        'setPreviewEntry': function (previewObj) {
          localStorageService.set('previewEntry', previewObj);
          previewEntry = previewObj.id;
          previewEntryObj = previewObj;
        },
        'getPreviewEntry': function () {
          if (!previewEntry) {
            return localStorageService.get('previewEntry');
          } else {
            return previewEntryObj;
          }
        },
        'renderPlayer': function (wid, uiconf_id, flashvars, entry_id) {
          logTime('renderPlayer');
          $('#Comp_300x250').empty();
          $('#Comp_728x90').empty();
          window.mw.setConfig('forceMobileHTML5', true);
          window.mw.setConfig('Kaltura.EnableEmbedUiConfJs', true);
          kWidget.embed({
            'targetId': 'kVideoTarget',
            'wid': '_' + wid,
            'uiconf_id': uiconf_id,
            'flashvars': flashvars,
            'entry_id': entry_id,
            'readyCallback': function () {
              $('#kVideoTarget_ifp').contents().find('link[href$="playList.css"]').clone().appendTo($('head'));
            }
          });
        },
        'setKDPAttribute': function (attrStr, value) {
          var kdp = document.getElementById('kVideoTarget');
          if ($.isFunction(kdp.setKDPAttribute) && typeof attrStr != 'undefined' && attrStr.indexOf('.') != -1) {
            var obj = attrStr.split('.')[0];
            var property = attrStr.split('.')[1];
            kdp.setKDPAttribute(obj, property, value);
          }
        },
        playerRefresh: playerRefresh,
        newPlayer: function () {
          var deferred = $q.defer();
          playersService.getDefaultConfig().success(function (data, status, headers, config) {
            var request;
            if (window.parent && window.parent.kmc && window.parent.kmc.vars && window.parent.kmc.vars.default_kdp) {
              request = {
                service: 'multirequest',
                'action': null,
                '1:service': 'uiconf',
                '1:action': 'clone',
                '1:id': window.parent.kmc.vars.default_kdp.id,
                '2:service': 'uiconf',
                '2:action': 'update',
                '2:id': '{1:result:id}',
                '2:uiConf:name': 'New Player',
                '2:uiConf:objectType': 'KalturaUiConf',
                '2:uiConf:objType': 1,
                '2:uiConf:width': 560,
                '2:uiConf:height': 395,
                '2:uiConf:tags': 'html5studio,player',
                '2:uiConf:html5Url': '/html5/html5lib/v' + window.MWEMBED_VERSION + '/mwEmbedLoader.php',
                '2:uiConf:creationMode': 2,
                '2:uiConf:config': angular.toJson(data)
              };
            } else {
              request = {
                'service': 'uiConf',
                'action': 'add',
                'uiConf:objectType': 'KalturaUiConf',
                'uiConf:objType': 1,
                'uiConf:description': '',
                'uiConf:height': '395',
                'uiConf:width': '560',
                'uiConf:swfUrl': '/flash/kdp3/v3.9.8/kdp3.swf',
                'uiConf:fUrlVersion': '3.9.8',
                'uiConf:version': '161',
                'uiConf:name': 'New Player',
                'uiConf:tags': 'html5studio,player',
                'uiConf:html5Url': '/html5/html5lib/v' + window.MWEMBED_VERSION + '/mwEmbedLoader.php',
                'uiConf:creationMode': 2,
                'uiConf:confFile': kdpConfig,
                'uiConf:config': angular.toJson(data)
              };
            }
            apiService.setCache(false);
            apiService.doRequest(request).then(function (data) {
              var playerData = $.isArray(data) ? data[1] : data;
              playerData['autoUpdate'] = true;
              playersService.setCurrentPlayer(playerData);
              apiService.setCache(true);
              localStorageService.set('tempPlayerID', playerData.id);
              deferred.resolve(playerData);
            }, function (reason) {
              deferred.reject(reason);
            });
          }).error(function (data, status, headers, config) {
            cl('Error getting default player config');
          });
          return deferred.promise;
        },
        clonePlayer: function (srcUi) {
          var deferred = $q.defer();
          var request = {
              service: 'multirequest',
              'action': null,
              '1:service': 'uiconf',
              '1:action': 'clone',
              '1:id': srcUi.id,
              '2:service': 'uiconf',
              '2:action': 'update',
              '2:id': '{1:result:id}',
              '2:uiConf:name': 'Copy of ' + srcUi.name,
              '2:uiConf:objectType': 'KalturaUiConf'
            };
          apiService.doRequest(request).then(function (data) {
            deferred.resolve(data);
          }, function (reason) {
            deferred.reject(reason);
          });
          return deferred.promise;
        },
        'getPlayer': function (id) {
          var deferred = $q.defer();
          apiService.setCache(false);
          var request = {
              'service': 'uiConf',
              'action': 'get',
              'id': id
            };
          apiService.doRequest(request).then(function (result) {
            if (typeof result.config === 'string') {
              try {
                angular.fromJson(result.config);
                playersService.setCurrentPlayer(result);
                deferred.resolve(currentPlayer);
              } catch (e) {
                deferred.reject('invalid JSON config');
                utilsSvc.alert('Invalid Player', 'The player configuration object is not valid.<br>Consider deleting this player or contact support.<br>Player ID: ' + result.id);
                $location.url('/list');
              }
            }
          });
          return deferred.promise;
        },
        setCurrentPlayer: function (player) {
          if (typeof player.config == 'string') {
            player.config = angular.fromJson(player.config);
          }
          if (typeof player.config != 'undefined' && typeof player.config.plugins != 'undefined') {
            player.config = playersService.addFeatureState(player.config);
          }
          currentPlayer = player;
        },
        addFeatureState: function (data) {
          angular.forEach(data.plugins, function (value, key) {
            if ($.isArray(value))
              data.plugins[key] = {};
            if (angular.isObject(data.plugins[key]) && data.plugins[key].enabled !== false)
              data.plugins[key].enabled = true;
          });
          return data;
        },
        cachePlayers: function (playersList) {
          if ($.isArray(playersList)) {
            angular.forEach(playersList, function (player) {
              playersCache[player.id] = player;
            });
          } else {
            playersCache[playersList.id] = playersList;
          }
        },
        'deletePlayer': function (id) {
          var deferred = $q.defer();
          var rejectText = $filter('translate')('Delete action was rejected: ');
          if (typeof id == 'undefined' && currentPlayer)
            id = currentPlayer.id;
          if (id) {
            var request = {
                'service': 'uiConf',
                'action': 'delete',
                'id': id
              };
            apiService.doRequest(request).then(function (result) {
              deferred.resolve(result);
            }, function (msg) {
              deferred.reject(rejectText + msg);
            });
          } else {
            deferred.reject(rejectText);
          }
          return deferred.promise;
        },
        'getRequiredVersion': function () {
          return 2;
        },
        'getDefaultConfig': function () {
          return $http.get('js/services/defaultPlayer.json');
        },
        'getKDPConfig': function () {
          $http.get('js/services/kdp.xml').success(function (data, status, headers, config) {
            kdpConfig = data;
          });
        },
        'preparePluginsDataForRender': function (data) {
          var copyobj = data.plugins || data;
          angular.forEach(copyobj, function (value, key) {
            if (angular.isObject(value)) {
              if (value.enabled && value.enabled === false) {
                delete copyobj[key];
              } else {
                playersService.preparePluginsDataForRender(value);
              }
            } else {
              if (key == 'enabled') {
                copyobj['plugin'] = true;
                delete copyobj[key];
              }
            }
          });
          return copyobj;
        },
        'savePlayer': function (data) {
          var deferred = $q.defer();
          var data2Save = angular.copy(data.config);
          data2Save.plugins = playersService.preparePluginsDataForRender(data2Save.plugins);
          if (data2Save.plugins.playlistAPI) {
            if (data2Save.plugins.playlistAPI.kpl0Id) {
              delete data2Save.plugins.playlistAPI.kpl0Id;
            }
            if (data2Save.plugins.playlistAPI.kpl0Name) {
              delete data2Save.plugins.playlistAPI.kpl0Name;
            }
          }
          if (data2Save.enviornmentConfig) {
            delete data2Save.enviornmentConfig.enabled;
            if (data2Save.enviornmentConfig.localizationCode !== undefined && data2Save.enviornmentConfig.localizationCode === '') {
              delete data2Save.enviornmentConfig.localizationCode;
            }
            if (angular.equals({}, data2Save.enviornmentConfig)) {
              delete data2Save.enviornmentConfig;
            }
          }
          var request = {
              'service': 'uiConf',
              'action': 'update',
              'id': data.id,
              'uiConf:name': data.name,
              'uiConf:tags': data.tags,
              'uiConf:height': data.height,
              'uiConf:width': data.width,
              'uiConf:description': data.description ? data.description : '',
              'uiConf:config': JSON.stringify(data2Save, null, '\t')
            };
          if (data.html5Url.indexOf('/html5/html5lib/') === 0) {
            if (data.autoUpdate) {
              request['uiConf:html5Url'] = '/html5/html5lib/{latest}/mwEmbedLoader.php';
            } else {
              request['uiConf:html5Url'] = '/html5/html5lib/v' + window.MWEMBED_VERSION + '/mwEmbedLoader.php';
            }
          }
          apiService.doRequest(request).then(function (result) {
            playersCache[data.id] = data;
            currentPlayer = {};
            var kmc = window.parent.kmc;
            if (kmc && kmc.preview_embed) {
              kmc.preview_embed.updateList(data.tags.indexOf('playlist') !== -1);
            }
            deferred.resolve(result);
          });
          return deferred.promise;
        },
        'playerUpgrade': function (playerObj, html5lib) {
          var request = {
              'service': 'uiConf',
              'action': 'update',
              'id': playerObj.id,
              'uiConf:html5Url': html5lib
            };
          var deferred = $q.defer();
          var rejectText = $filter('translate')('Upgrade player action was rejected: ');
          apiService.doRequest(request).then(function (result) {
            deferred.resolve(result);
          }, function (msg) {
            deferred.reject(rejectText + msg);
          });
          return deferred.promise;
        },
        'playerUpdate': function (playerObj, html5lib, isPlaylist) {
          var deferred = $q.defer();
          var rejectText = $filter('translate')('Update player action was rejected: ');
          var method = 'get';
          var url = window.kWidget.getPath() + 'services.php';
          var params = {
              service: 'upgradePlayer',
              uiconf_id: playerObj.id,
              ks: localStorageService.get('ks')
            };
          if (window.IE < 10) {
            params['callback'] = 'JSON_CALLBACK';
            method = 'jsonp';
          }
          $http({
            url: url,
            method: method,
            params: params
          }).success(function (data, status, headers, config) {
            if (data['uiConfId']) {
              delete data['uiConfId'];
              delete data['widgetId'];
              delete data.vars['ks'];
            }
            if (isPlaylist && data.plugins.playlistAPI) {
              data.plugins.playlistAPI.includeInLayout = true;
            }
            var playerTag = playerObj.tags.indexOf('playlist') != -1 ? 'playlist' : 'player';
            var request = {
                'service': 'uiConf',
                'action': 'update',
                'id': playerObj.id,
                'uiConf:tags': 'html5studio,' + playerTag,
                'uiConf:html5Url': html5lib,
                'uiConf:config': angular.toJson(data).replace('"vars":', '"uiVars":')
              };
            apiService.doRequest(request).then(function (result) {
              deferred.resolve(result);
            }, function (msg) {
              deferred.reject(rejectText + msg);
            });
          }).error(function (data, status, headers, config) {
            deferred.reject('Error updating UIConf: ' + data);
            $log.error('Error updating UIConf: ' + data);
          });
          return deferred.promise;
        }
      };
    return playersService;
  }
]);
;
KMCServices.factory('requestNotificationChannel', [
  '$rootScope',
  function ($rootScope) {
    var _START_REQUEST_ = '_START_REQUEST_';
    var _END_REQUEST_ = '_END_REQUEST_';
    var obj = { 'customStart': null };
    obj.requestStarted = function (customStart) {
      $rootScope.$broadcast(_START_REQUEST_, customStart);
      if (customStart) {
        obj.customStart = customStart;
      }
    };
    obj.requestEnded = function (customStart) {
      if (obj.customStart) {
        if (customStart == obj.customStart) {
          $rootScope.$broadcast(_END_REQUEST_, customStart);
          obj.customStart = null;
        } else
          return;
      } else
        $rootScope.$broadcast(_END_REQUEST_);
    };
    obj.onRequestStarted = function ($scope, handler) {
      $scope.$on(_START_REQUEST_, function (event, evdata) {
        if (evdata != 'ignore')
          handler();
      });
    };
    obj.onRequestEnded = function ($scope, handler) {
      $scope.$on(_END_REQUEST_, function (event, evdata) {
        if (evdata != 'ignore')
          handler();
      });
    };
    return obj;
  }
]);
KMCServices.directive('canSpin', [function () {
    return {
      require: [
        '?^loadingWidget',
        '?^navmenu'
      ],
      priority: 1000,
      link: function ($scope, $element, $attrs, controllers) {
        $scope.target = $('<div class="spinWrapper"></div>').prependTo($element);
        $scope.spinner = null;
        $scope.spinRunning = false;
        $scope.opts = {
          lines: 15,
          length: 27,
          width: 8,
          radius: 60,
          corners: 1,
          rotate: 0,
          direction: 1,
          color: '#000',
          speed: 0.6,
          trail: 24,
          shadow: true,
          hwaccel: true,
          className: 'spinner',
          zIndex: 2000000000,
          top: 'auto',
          left: 'auto'
        };
        var initSpin = function () {
          $scope.spinner = new Spinner($scope.opts).spin();
        };
        $scope.endSpin = function () {
          if ($scope.spinner)
            $scope.spinner.stop();
          $scope.spinRunning = false;
        };
        $scope.spin = function () {
          if ($scope.spinRunning)
            return;
          if ($scope.spinner === null)
            initSpin();
          $scope.spinner.spin($scope.target[0]);
          $scope.spinRunning = true;
        };
        angular.forEach(controllers, function (controller) {
          if (typeof controller != 'undefined')
            controller.spinnerScope = $scope;
        });
      }
    };
  }]);
KMCServices.directive('loadingWidget', [
  'requestNotificationChannel',
  function (requestNotificationChannel) {
    return {
      restrict: 'EA',
      scope: {},
      replace: true,
      controller: function () {
      },
      template: '<div class=\'loadingOverlay\'><a can-spin></a></div>',
      link: function (scope, element, attrs, controller) {
        element.hide();
        var startRequestHandler = function () {
          element.show();
          controller.spinnerScope.spin();
        };
        var endRequestHandler = function () {
          element.hide();
          controller.spinnerScope.endSpin();
        };
        requestNotificationChannel.onRequestStarted(scope, startRequestHandler);
        requestNotificationChannel.onRequestEnded(scope, endRequestHandler);
      }
    };
  }
]);
;
KMCServices.factory('editableProperties', [
  '$q',
  'api',
  '$http',
  function ($q, api, $http) {
    var deferred = $q.defer();
    api.then(function () {
      var method = 'get';
      var url = window.kWidget.getPath() + 'services.php?service=studioService';
      if (window.IE < 10) {
        url += '&callback=JSON_CALLBACK';
        method = 'jsonp';
      }
      $http[method](url).then(function (result) {
        var data = result.data;
        if (typeof data == 'object')
          deferred.resolve(result.data);
        else {
          cl('JSON parse error of playerFeatures');
          deferred.reject(false);
        }
      }, function (reason) {
        deferred.reject(reason);
      });
    });
    return deferred.promise;
  }
]);
KMCServices.factory('loadINI', [
  '$http',
  function ($http) {
    var iniConfig = null;
    return {
      'getINIConfig': function () {
        if (!iniConfig) {
          iniConfig = $http.get('studio.ini', {
            responseType: 'text',
            headers: { 'Content-type': 'text/plain' },
            transformResponse: function (data, headers) {
              var config = data.match(/widgets\.studio\.config \= \'(.*)\'/)[1];
              data = angular.fromJson(config);
              return data;
            }
          });
        }
        return iniConfig;
      }
    };
  }
]);
KMCServices.provider('api', function () {
  var injector = angular.injector(['ng']);
  var $q = injector.get('$q');
  var apiObj = null;
  return {
    $get: [
      'loadINI',
      function (loadINI) {
        var deferred = $q.defer();
        if (!apiObj) {
          var require = function (file, callback) {
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.src = file;
            script.type = 'text/javascript';
            if (script.addEventListener) {
              script.addEventListener('load', callback, false);
            } else if (script.readyState) {
              script.onreadystatechange = callback;
            }
            head.appendChild(script);
          };
          var loadHTML5Lib = function (url) {
            var initKw = function () {
              if (typeof kWidget != 'undefined') {
                kWidget.api.prototype.type = 'POST';
                apiObj = new kWidget.api();
                deferred.resolve(apiObj);
              }
            };
            require(url, function () {
              if (typeof kWidget == 'undefined') {
                setTimeout(function () {
                  initKw();
                }, 100);
              } else {
                initKw();
              }
            });
          };
          var html5lib = null;
          try {
            var kmc = window.parent.kmc;
            if (kmc && kmc.vars && kmc.vars.studio.config) {
              var config = angular.fromJson(kmc.vars.studio.config);
              html5lib = kmc.vars.api_url + '/html5/html5lib/' + config.html5_version + '/mwEmbedLoader.php';
              loadHTML5Lib(html5lib);
            }
          } catch (e) {
            cl('Could not located parent.kmc: ' + e);
          }
          if (!html5lib) {
            loadINI.getINIConfig().success(function (data) {
              var url = data.html5lib;
              loadHTML5Lib(url);
            });
          }
        } else
          deferred.resolve(apiObj);
        return deferred.promise;
      }
    ]
  };
});
KMCServices.factory('apiService', [
  'api',
  '$q',
  '$timeout',
  '$location',
  'localStorageService',
  'apiCache',
  'requestNotificationChannel',
  '$filter',
  function (api, $q, $timeout, $location, localStorageService, apiCache, requestNotificationChannel, $filter) {
    var apiService = {
        apiObj: api,
        unSetks: function () {
          delete apiService.apiObj;
        },
        setKs: function (ks) {
          apiService.apiObj.then(function (api) {
            api.setKs(ks);
          });
        },
        setWid: function (wid) {
          apiService.getClient().then(function (api) {
            api.wid = wid;
          });
        },
        getKey: function (params) {
          var key = '';
          for (var i in params) {
            key += params[i] + '_';
          }
          return key;
        },
        listMedia: function () {
          var request = {
              'service': 'baseentry',
              'filter:mediaTypeIn': '1,2,5,6,201',
              'filter:objectType': 'KalturaMediaEntryFilter',
              'action': 'list'
            };
          return apiService.doRequest(request);
        },
        searchMedia: function (term) {
          var request = {
              'service': 'baseentry',
              'action': 'list',
              'filter:freeText': term,
              'filter:mediaTypeIn': '1,2,5,6,201',
              'filter:objectType': 'KalturaMediaEntryFilter',
              ignoreNull: '1'
            };
          return apiService.doRequest(request, true);
        },
        listPlaylists: function () {
          var request = {
              'service': 'baseentry',
              'filter:objectType': 'KalturaBaseEntryFilter',
              'filter:typeEqual': '5',
              'action': 'list'
            };
          return apiService.doRequest(request);
        },
        searchPlaylists: function (term) {
          var request = {
              'service': 'baseentry',
              'action': 'list',
              'filter:freeText': term,
              'filter:objectType': 'KalturaBaseEntryFilter',
              'filter:typeEqual': '5',
              ignoreNull: '1'
            };
          return apiService.doRequest(request, true);
        },
        useCache: true,
        setCache: function (useCache) {
          apiService.useCache = useCache;
        },
        doRequest: function (params, ignoreSpinner) {
          var deferred = $q.defer();
          var params_key = apiService.getKey(params);
          if (apiCache.get(params_key) && apiService.useCache) {
            deferred.resolve(apiCache.get(params_key));
          } else {
            if (!ignoreSpinner) {
              requestNotificationChannel.requestStarted('api');
            }
            apiService.apiObj.then(function (api) {
              api.doRequest(params, function (data) {
                if (data.code) {
                  if (data.code == 'INVALID_KS') {
                    localStorageService.remove('ks');
                    $location.path('/login');
                  }
                  if (!ignoreSpinner) {
                    requestNotificationChannel.requestEnded('api');
                  }
                  var message = $filter('translate')(data.code);
                  deferred.reject(message);
                } else {
                  apiCache.put(params_key, data);
                  apiService.useCache = true;
                  if (!ignoreSpinner) {
                    requestNotificationChannel.requestEnded('api');
                  }
                  deferred.resolve(data);
                }
              });
            });
          }
          return deferred.promise;
        }
      };
    return apiService;
  }
]);
KMCServices.factory('playerTemplates', [
  '$http',
  function ($http) {
    return {
      'listSystem': function () {
        return $http.get('http://mrjson.com/data/5263e32d85f7fef869f2a63b/template/list.json');
      },
      'listUser': function () {
        return $http.get('http://mrjson.com/data/5263e32d85f7fef869f2a63b/userTemplates/list.json');
      }
    };
  }
]);