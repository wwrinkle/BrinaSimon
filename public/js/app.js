var app = angular.module('BrinaSimonApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap']);
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
        .when('/biography', {
            templateUrl: 'views/biography.html',
            controller: 'BiographyController'
        })
        .when('/projects', {
            templateUrl: 'views/projects.html',
            controller: 'ProjectsController'
        })
        .when('/lessons', {
            templateUrl: 'views/lessons.html',
            controller: 'LessonsController'
        })
        .when('/calendar', {
            templateUrl: 'views/calendar.html',
            controller: 'CalendarController'
        })
        .when('/media', {
            templateUrl: 'views/media.html',
            controller: 'MediaController'
        })
        .when('/contact', {
            templateUrl: 'views/contact.html',
            controller: 'ContactController'
        })
        .otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
}]);

app.run(function($rootScope) {
    $rootScope.setButton;
});

app.directive('offClick', ['$rootScope', '$parse', function($rootScope, $parse) {
    var id = 0;
    var listeners = {};

    document.addEventListener("touchend", offClickEventHandler, true);
    document.addEventListener('click', offClickEventHandler, true);

    function targetInFilter(target, elms) {
        if (!target || !elms) return false;
        var elmsLen = elms.length;
        for (var i = 0; i < elmsLen; ++i)
            if (elms[i].contains(target)) return true;
        return false;
    }

    function offClickEventHandler(event) {
        var target = event.target || event.srcElement;
        angular.forEach(listeners, function(listener, i) {
            if (!(listener.elm.contains(target) || targetInFilter(target, listener.offClickFilter))) {
                $rootScope.$evalAsync(function() {
                    listener.cb(listener.scope, {
                        $event: event
                    });
                });
            }

        });
    }

    return {
        restrict: 'A',
        compile: function($element, attr) {
            var fn = $parse(attr.offClick);
            return function(scope, element) {
                var elmId = id++;
                var offClickFilter;
                var removeWatcher;

                offClickFilter = document.querySelectorAll(scope.$eval(attr.offClickFilter));

                if (attr.offClickIf) {
                    removeWatcher = $rootScope.$watch(function() {
                        return $parse(attr.offClickIf)(scope);
                    }, function(newVal) {
                        if (newVal) {
                            on();
                        } else if (!newVal) {
                            off();
                        }
                    });
                } else {
                    on();
                }

                attr.$observe('offClickFilter', function(value) {
                    offClickFilter = document.querySelectorAll(scope.$eval(value));
                });

                scope.$on('$destroy', function() {
                    off();
                    if (removeWatcher) {
                        removeWatcher();
                    }
                });

                function on() {
                    listeners[elmId] = {
                        elm: element[0],
                        cb: fn,
                        scope: scope,
                        offClickFilter: offClickFilter
                    };
                }

                function off() {
                    delete listeners[elmId];
                }
            };
        }
    };
}]);

app.directive('elastic', [
    '$timeout',
    function($timeout) {
        return {
            restrict: 'A',
            link: function($scope, element) {
                $scope.initialHeight = $scope.initialHeight || element[0].style.height;
                var resize = function() {
                    element[0].style.height = $scope.initialHeight;
                    element[0].style.height = "" + element[0].scrollHeight + "px";
                };
                element.on("blur keyup change", resize);
                $timeout(resize, 0);
            }
        };
    }
]);

app.filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);
app.factory('audio', function($q, $http) {
    var audioDeferred = $q.defer();
    $http.get('/data/audio.json').success(function(response) {
        audioDeferred.resolve(response);
    });
    return audioDeferred.promise;
});
app.factory('slides', function($q, $http) {
    var slidesDeferred = $q.defer();
    $http.get('/data/slides.json').success(function(response) {
        slidesDeferred.resolve(response);
    });
    return slidesDeferred.promise;
});
app.factory('projects', function($q, $http, $sce) {
    projectsDeferred = $q.defer();
    $http.get('/data/projects.json').success(function(response) {
        var projectsArray = response;
        for (i = 0; i < projectsArray.length; i++) {
            if (projectsArray[i].projectUrl != undefined) {
                projectsArray[i].projectTitleHTML = $sce.trustAsHtml('<a href=' + projectsArray[i].projectUrl + ' target="_blank" class="project-link project-has link"><h3 class="project-title project-has-link">' + projectsArray[i].projectTitle + '</h3></a>');
                projectsArray[i].projectImageHTML = $sce.trustAsHtml('<a href=' + projectsArray[i].projectUrl + ' target="_blank"><img src=' + projectsArray[i].projectImg + ' class="projects-img"></a>');
            } else {
                projectsArray[i].projectTitleHTML = $sce.trustAsHtml('<h3 class="project-title">' + projectsArray[i].projectTitle + '</h3>');
                projectsArray[i].projectImageHTML = $sce.trustAsHtml('<img src=' + projectsArray[i].projectImg + ' class="projects-img">');
            }
        }
        projectsDeferred.resolve(projectsArray);
    });
    return projectsDeferred.promise;
});
app.factory('performances', function($q, $http, $filter) {
    var performancesDeferred = $q.defer();
    $http.get('/data/performances.json')
        .success(function(response) {
            var performanceObj = {};
            var allPerformances = response;
            performanceObj.upcomingPerformances = allPerformances.slice();
            performanceObj.pastPerformances = allPerformances.slice();
            var currentDate = new Date();
            var orderBy = $filter('orderBy');
            for (var i = performanceObj.upcomingPerformances.length - 1; i >= 0; i--) {
                if (new Date(performanceObj.upcomingPerformances[i].gigTime) < currentDate) {
                    performanceObj.upcomingPerformances.splice(i, 1);
                }
            }
            var orderUpcoming = function(predicate, reverse) {
                performanceObj.upcomingPerformances = orderBy(performanceObj.upcomingPerformances, predicate, reverse);
            };
            orderUpcoming('+gigTime', false);
            for (var j = performanceObj.pastPerformances.length - 1; j >= 0; j--) {
                if (new Date(performanceObj.pastPerformances[j].gigTime) > currentDate) {
                    performanceObj.pastPerformances.splice(j, 1);
                }
            }
            var orderPast = function(predicate, reverse) {
                performanceObj.pastPerformances = orderBy(performanceObj.pastPerformances, predicate, reverse);
            };
            orderPast('-gigTime', false);
            performancesDeferred.resolve(performanceObj);
        });
    return performancesDeferred.promise;
});
app.factory('videos', function($q, $http) {
    videosDeferred = $q.defer();
    $http.get('/data/videos.json').success(function(response) {
        videosDeferred.resolve(response);
    });
    return videosDeferred.promise;
});
app.factory('images', function($q, $http) {
    imagesDeferred = $q.defer();
    $http.get('/data/images.json').success(function(response) {
        imagesDeferred.resolve(response);
    });
    return imagesDeferred.promise;
});
app.service('contact', function($q, $http) {
    this.post = function(postData) {
        return $q(function(resolve, reject) {
            $http({
                    method: 'POST',
                    url: '/php/process.php',
                    data: postData,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .success(function(data) {
                    if (data.success) {
                        console.log(data);
                        console.log('success');
                        resolve(data);
                    } else {
                        reject(data);
                    }
                });
        });
    };
});
app.controller('NavController', function($scope, $rootScope, $timeout, $window, $location, $anchorScroll) {
    $scope.isCollapsed;
    this.windowWidth = $window.innerWidth;

    $scope.$watch(function() {
        return $window.innerWidth;
    }, function(value) {
        this.windowWidth = value;

        if (this.windowWidth <= 904) {
            $timeout(function() {
                $scope.isCollapsed = true;
            }, 25);
            $scope.collapseFunc = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
            };
            $scope.offClickCollapse = function() {
                $scope.isCollapsed = true;
            };
        }
        if (this.windowWidth > 905) {
            $timeout(function() {
                $scope.isCollapsed = false;
            }, 25);
        }
    });
    this.buttonClass = function(buttonCheck) {
        return $rootScope.setButton === buttonCheck;
    };
    this.selectButton = function(buttonSelect) {
        $rootScope.setButton = buttonSelect;
        $anchorScroll();
        if (this.windowWidth <= 904) {
            $scope.collapseFunc();
        }
    };
    this.scrollToTop = function() {
        $anchorScroll();
    };
    $scope.getDimensionsFunc = function() {
        $scope.windowHeight = window.innerHeight;
        $scope.documentHeight = document.documentElement.scrollHeight;
        $scope.navHeight = document.getElementsByTagName('nav')[0].offsetHeight;
        $scope.contentHeight = $scope.documentHeight - $scope.navHeight;
        $scope.windowWidth = window.innerWidth;
    };
    $scope.$on('$routeChangeSuccess', function(next, current) {
        $timeout(function() {
            $scope.getDimensionsFunc();
        });
    });
    angular.element($window).bind('resize', function() {
        $scope.getDimensionsFunc();
    });
    $scope.navPosition = document.getElementById("nav-super-container").offsetTop;
    $scope.stickyBool;
    $scope.scrollPosition;
    angular.element($window).bind("scroll", function() {
        $scope.scrollPosition = $window.pageYOffset;
        if ($scope.windowWidth > 904) {
            if ($scope.scrollPosition >= ($scope.navHeight - 50)) {
                $scope.stickyBool = true;
                $rootScope.viewStickyBool = true;
                $scope.$apply();
            }
            if ($scope.scrollPosition < ($scope.navHeight - 50)) {
                $scope.stickyBool = false;
                $rootScope.viewStickyBool = false;
                $scope.$apply();
            }
        }
    });
});

app.controller('AudioController', function($scope, $rootScope, $timeout, $window, audio) {
    $scope.audioIndex = 0;
    $rootScope.mediaAudioIndex = 0;
    $scope.audioElm = document.getElementById('audio');
    $scope.playWithoutWatch = function() {
        $scope.audioElm.autoplay = false;
        $scope.audioElm.load();
        $scope.audioElm.oncanplay = function() {
            $scope.audioElm.play();
        };
    };
    $scope.$watch(function() {
        return $rootScope.mediaAudioIsClicked;
    }, function() {
        $rootScope.mediaAudioIsClicked = false;
        $scope.audioIndex = $rootScope.mediaAudioIndex;
        $timeout(function() {
            /*$scope.audioElm.autoplay = false;
            $scope.audioElm.load();
            $scope.audioElm.oncanplay = function() {
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) == false) {
                    $scope.audioElm.play();
                }
            };
            $scope.trackPosition = 0;
            $scope.duration = 0;*/
            $scope.playWithoutWatch();
        }, 100);
    });
    audio.then(function(response) {
        $scope.tracks = response;
        $rootScope.tracks = response;
    });
    $rootScope.forceHoverBool = false;
    angular.element(document).ready(function() {
        $scope.audioElm.autoplay = false;
        $scope.audioElm.load();
    });
    $scope.playerHeadPositionStyle = {
        'left': '40px'
    };
    $scope.firstPlayBool = true;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) == false) {
        $scope.firstPlayBool = false;
        $scope.isMobile = true;
    }
    $scope.trackPosition = 0;
    $scope.loadPause = false;
    $scope.playWithWatch = function() {
        $scope.audioElm.autoplay = false;
        $scope.audioElm.load();
        $scope.audioElm.oncanplay = function() {
            $scope.$watch(function() {
                return $scope.loadPause;
            }, function() {
                if (!$scope.loadPause) {
                    $scope.audioElm.play();
                }
            });
        };
    };
    $scope.back = function() {
        $scope.firstPlayBool = false;
        if ($scope.audioIndex > 0) {
            $scope.audioIndex--;
        }
        $timeout(function() {
            $scope.playWithWatch();
            $scope.trackPosition = 0;
            $scope.duration = 0;
        }, 100);
    };
    $scope.forward = function() {
        $scope.firstPlayBool = false;
        if ($scope.audioIndex < ($scope.tracks.length - 1)) {
            $scope.audioIndex++;
        }
        $timeout(function() {
            $scope.playWithWatch();
            $scope.trackPosition = 0;
            $scope.duration = 0;
        }, 100);
    };
    $scope.muteBool = false;
    $scope.muteSound = function() {
        if (!$scope.muteBool) {
            $scope.audioElm.muted = true;
            $scope.muteBool = !$scope.muteBool;
        } else {
            $scope.audioElm.muted = false;
            $scope.muteBool = !$scope.muteBool;
        }
    };
    $scope.audioElm.onended = function() {
        console.log('over');
        if ($scope.audioIndex < ($scope.tracks.length - 1)) {
            $timeout(function() {
                $scope.forward();
            }, 100);
        }
    };
    $scope.pauseBool;
    $scope.playBool = true;
    $scope.loadBool = false;
    $scope.duration = 0;
    $scope.audioElm.onloadstart = function() {
        console.log('loading');
        $timeout(function() {
            $scope.pauseBool = false;
            $scope.playBool = false;
            $scope.loadBool = false;
            $scope.playerHeadPositionStyle = {
                'left': '40px'
            };
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && $scope.firstPlayBool) {
                $scope.playBool = true;
                $scope.loadBool = true;
            }
        }, 50);
    };
    $scope.audioElm.oncanplay = function() {
        console.log('can play');
        $timeout(function() {
            $scope.playBool = true;
            $scope.pauseBool = false;
            $scope.loadBool = true;
        }, 100);
    };
    $scope.audioElm.onplay = function() {
        console.log('playing');
        $timeout(function() {
            $scope.pauseBool = true;
            $scope.playBool = false;
            $scope.loadBool = true;
        }, 100);
    };
    $scope.audioElm.onpause = function() {
        console.log('paused');
        $timeout(function() {
            $scope.pauseBool = false;
            $scope.playBool = true;
            $scope.loadBool = true;
        }, 100);
    };
    $scope.pausePlay = function() {
        if ($scope.pauseBool && ($scope.isMobile || $scope.firstPlayBool)) {
            $timeout(function() {
                $scope.audioElm.pause();
                $scope.firstPlayBool = false;
            }, 100);
        } else if ($scope.pauseBool) {
            $scope.audioElm.pause();
        } else if ($scope.playBool) {
            $scope.audioElm.play();
            console.log('dong');
        }
    };
    $rootScope.audioPauseAvoidConflict = false;
    $scope.audioRestartBool;
    $scope.$watch(function() {
        return $rootScope.audioPauseAvoidConflict;
    }, function() {
        if ($rootScope.audioPauseAvoidConflict && $scope.playBool) {
            $scope.audioElm.pause();
            $scope.audioRestartBool = true;
        }
        if ($rootScope.audioPauseAvoidConflict && !$scope.loadBool) {
            $scope.loadPause = true;
            $scope.audioRestartBool = true;
        }
        if (!$rootScope.audioPauseAvoidConflict && $scope.audioRestartBool) {
            $scope.audioRestartBool = false;
            $scope.loadPause = false;
            $timeout(function() {
                $scope.audioElm.play();
            }, 500);
        }
    });
    $scope.trackPercentage;
    $scope.audioElm.ondurationchange = function() {
        $scope.duration = $scope.audioElm.duration;
        $scope.$apply();
    };
    $scope.audioElm.ontimeupdate = function() {
        $scope.trackPosition = $scope.audioElm.currentTime;
        $scope.trackPercentage = $scope.trackPosition / $scope.duration;
        $scope.playerHeadPosition = 40 + ($scope.trackPercentage * 234);
        $scope.playerHeadPositionStyle = {
            'left': $scope.playerHeadPosition + 'px'
        };
        $scope.$apply();
    };
    $scope.positionChange = function(event) {
        $scope.changePercentage;
        if (event.offsetX) {
            $scope.changePercentage = event.offsetX / 240;
        } else {
            console.log('firefox workaround');
            var clickPos = event.pageX;
            var windowWidth = window.innerWidth;
            var durationLeftExtreme = (windowWidth / 2) - 120;
            $scope.changePercentage = (clickPos - durationLeftExtreme) / 240;
        }
        $scope.audioElm.currentTime = $scope.audioElm.duration * $scope.changePercentage;
    };
    $scope.dragBool = false;
    $scope.playerHeadMouseDown = function() {
        console.log('player head mouse down');
        $scope.audioElm.pause();
        $scope.dragBool = true;
    };
    $scope.playerHeadMouseMove = function(event) {
        this.mouseXPos = event.x;
        if (this.mouseXPos === undefined) {
            this.mouseXPos = event.pageX;
        }
        this.windowWidth = window.innerWidth;
        this.durationLeftExtreme = (this.windowWidth / 2) - 120;
        this.durationRightExtreme = (this.windowWidth / 2) + 120;
        this.playerHeadStyleNumber;
        if (this.mouseXPos < this.durationLeftExtreme && $scope.dragBool) {
            this.playerHeadStyleNumber = 40;
            $scope.playerHeadPositionStyle = {
                'left': '40px'
            };
            $scope.audioElm.currentTime = 0;
        }
        if (this.mouseXPos >= this.durationLeftExtreme && this.mouseXPos <= this.durationRightExtreme && $scope.dragBool) {
            this.playerHeadStyleNumber = (this.mouseXPos - this.durationLeftExtreme) + 40;
            $scope.playerHeadPositionStyle = {
                'left': this.playerHeadStyleNumber + 'px'
            };
            $scope.audioElm.currentTime = ((this.mouseXPos - this.durationLeftExtreme) / 240) * $scope.audioElm.duration;
        }
        if (this.mouseXPos > this.durationRightExtreme && $scope.dragBool) {
            this.playerHeadStyleNumber = 280;
            $scope.playerHeadPositionStyle = {
                'left': '280px'
            };
            $scope.audioElm.currentTime = $scope.audioElm.duration;
        }
    };
    $scope.playerHeadRelease = function(event) {
        if ($scope.dragBool) {
            console.log('release');
            $scope.audioElm.play();
            $scope.dragBool = false;
        }
    };
    $scope.$watch(function() {
        return $scope.audioIndex;
    }, function() {
        if ($scope.tracks) {
            if ($scope.tracks[$scope.audioIndex].title.length > 17) {
                $scope.longTrackBool = true;
            } else {
                $scope.longTrackBool = false;
            }
        }
    });
});
app.controller('HomeController', function($scope, $rootScope, $window, $timeout, slides) {
    $rootScope.setButton = 1;
    $scope.carouselInterval = 4000;
    slides.then(function(response) {
        $scope.slides = response;
    });
    var slides = $scope.slides;
    $scope.windowSize;
    $scope.resizeStyle;
    $scope.initialWindowSize = function() {
        $scope.windowSize = window.innerWidth;
        if ($scope.windowSize < 768) {
            $scope.resizeStyle = {
                'height': ($scope.windowSize * 0.66) + 'px'
            };
        }
        if ($scope.windowSize > 767) {
            $scope.resizeStyle = {
                'height': 'auto'
            };
        }
    };
    angular.element($window).bind('resize', function() {
        $scope.windowSize = window.innerWidth;
        if ($scope.windowSize < 768) {
            $timeout(function() {
                $scope.resizeStyle = {
                    'height': ($scope.windowSize * 0.66) + 'px'
                };

            }, 50);
        }
        if ($scope.windowSize > 767) {
            $timeout(function() {
                $scope.resizeStyle = {
                    'height': 'auto'
                };
            }, 50);
        }
    });
});

app.controller('BiographyController', function($rootScope) {
    $rootScope.setButton = 2;
});

app.controller('ProjectsController', function($scope, $rootScope, projects) {
    $rootScope.setButton = 3;
    projects.then(function(response) {
        $scope.projects = response;
    });
});

app.controller('LessonsController', function($rootScope) {
    $rootScope.setButton = 4;
});

app.controller('CalendarController', function($scope, $rootScope, $sce, $timeout, performances) {
    $rootScope.setButton = 5;
    $scope.openAccordionNumber;
    $scope.openFunc = function(accordionNumber) {
        this.clickBool;
        if (this.clickBool === false) {
            $scope.openAccordionNumber = null;
            this.clickBool = true;
        } else {
            $scope.openAccordionNumber = accordionNumber;
            this.clickBool = false;
        }
    };
    $scope.pastOpenFunc = function(accordionNumber) {
        this.clickBool;
        if (this.clickBool === false) {
            $scope.openAccordionNumber = null;
            this.clickBool = true;
        } else {
            $scope.openAccordionNumber = (accordionNumber * -1);
            this.clickBool = false;
        }
    };
    $scope.isOpenFunc = function(accordionNumber) {
        return $scope.openAccordionNumber === accordionNumber;
    };
    $scope.closeAll = function() {
        $scope.openAccordionNumber = null;
    };
    performances.then(function(response) {
        $scope.upcomingPerformances = response.upcomingPerformances;
        $scope.pastPerformances = response.pastPerformances;
    });
    $scope.mapUrl = function(index, array) {
        var venue = array[index].venue.replace(/[&]/g, 'and');
        return $sce.trustAsResourceUrl('https://www.google.com/maps/embed/v1/place?key=[APIKEY]' + venue.replace(/\s+/g, '+') + ',' + array[index].gigAddress.city.replace(/\s+/g, '+') + '+' + array[index].gigAddress.state);
    };
});
app.controller('MediaController', function($scope, $rootScope, $modal, $window, videos, images) {
    $rootScope.setButton = 6;
    videos.then(function(response) {
        $rootScope.videos = response;
        $scope.videoThumbBools = [];
        for (var i = 0; i < $rootScope.videos.length; i++) {
            $scope.videoThumbBools.push({
                resizeNeeded: false
            });
        }
    });
    /*$scope.$on('$viewContentLoaded', function(event) {
        var firstThumb = document.getElementById('video-thumbnail-3');
        console.log(firstThumb.width);
    });
    /*$scope.thumbnailSize = function(index){
        var firstThumb = document.getElementById('video-thumbnail-' + index);
        //console.log(firstThumb.width + ' video ' + index);
        console.log(index);
    };*/
    $scope.windowSizeForThumbs = function() {
        var windowWidth = window.innerWidth;
        $scope.thumbMax = 160;
        if (windowWidth >= 1060) {
            $scope.thumbMax = 222;
        }
    };
    $scope.windowSizeForThumbs();
    angular.element($window).bind('resize', function() {
        $scope.windowSizeForThumbs();
    });
    $scope.thumbnailGenerator = function(videoIndex) {
        var videoId = $scope.videos[videoIndex].videoUrl.slice(32);
        return 'http://img.youtube.com/vi/' + videoId + '/mqdefault.jpg';
    };
    images.then(function(response) {
        $rootScope.images = response;
    });
    $scope.animationsEnabled = true;
    $scope.openVideos = function(vidIndex) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'vidModal.html',
            controller: 'ModalInstanceCtrl'
        });
        $rootScope.vidIndex = vidIndex;
        $rootScope.audioPauseAvoidConflict = true;
    };
    $scope.open = function(imgIndex) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'imgModal.html',
            controller: 'ModalInstanceCtrl'
        });
        $rootScope.imgIndex = imgIndex;
    };
    $scope.openAudioPlayer = function(mediaAudioIndex) {
        $rootScope.forceHoverBool = true;
        $rootScope.mediaAudioIndex = mediaAudioIndex;
        $rootScope.mediaAudioIsClicked = true;
    };
    $scope.closeAudioPlayer = function() {
        $rootScope.forceHoverBool = false;
    };
});
app.controller('ModalInstanceCtrl', function($scope, $rootScope, $modalInstance, $sce) {
    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };
    $scope.modalImages = $rootScope.images;
    $scope.modalVideos = $rootScope.videos;
    $scope.modalImgIndex = $rootScope.imgIndex;
    $scope.modalVidIndex = $rootScope.vidIndex;
    $scope.embedGenerator = function(embedIndex) {
        var videoId = $scope.modalVideos[embedIndex].videoUrl.slice(32);
        return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + videoId + '?autoplay=1');
    };
    $scope.imgControlLeft = function() {
        $scope.modalImgIndex--;
        if ($scope.modalImgIndex < 0) {
            $scope.modalImgIndex = ($scope.modalImages.length - 1);
        }
    };
    $scope.imgControlRight = function() {
        $scope.modalImgIndex++;
        if ($scope.modalImgIndex > ($scope.modalImages.length - 1)) {
            $scope.modalImgIndex = 0;
        }
    };
    $scope.$on('modal.closing', function() {
        if ($rootScope.audioPauseAvoidConflict === true) {
            $rootScope.audioPauseAvoidConflict = false;
        }
    });
});
app.controller('ContactController', function($scope, $rootScope, $http, contact) {
    $rootScope.setButton = 7;
    $scope.contactFormData = {};
    $scope.contactSubmitMessageFailureBool = false;
    $scope.contactSubmitMessageSuccessBool = false;
    $scope.submitForm = function(data) {
        $scope.contactFormData.submit = true;
        if (!$scope.contactFormData.subject) {
            $scope.contactFormData.subject = 'No Subject';
        };
        contact.post($scope.contactFormData, $scope.error).then(function(response) {
            console.log(response);
            $scope.contactSubmitMessageSuccessBool = true;
            $scope.contactSubmitMessageFailureBool = false;
            $scope.contactFormData = {};
        }, function(error) {
            $scope.contactSubmitMessageFailureBool = true;
            console.log(error);
        });
        if ($scope.contactFormData.subject == 'No Subject') {
            $scope.contactFormData.subject = '';
        };
    };
});