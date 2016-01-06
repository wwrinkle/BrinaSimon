var app = angular.module('Admin', ['ngFileUpload']);

app.controller('BackgroundController', function($scope) {
    $scope.containerBackground = function(index) {
        if (index % 2 == 0) {
            return true;
        } else {
            return false;
        }
    };
});

app.controller('SubmitController', function($scope, $rootScope, $http) {
    $scope.submitChanges = function() {
        if (confirm("Hit OK to save all changes.") == true) {
            console.log('ok');
            for (o = 0; o < $rootScope.audio.length; o++) {
                delete $rootScope.audio[o].aacUrlAdmin;
                delete $rootScope.audio[o].mp3UrlAdmin;
                delete $rootScope.audio[o].oggUrlAdmin;
            }
            for (p = 0; p < $rootScope.videos.length; p++) {
                delete $rootScope.videos[p].videoEmbedUrl;
            }
            for (q = 0; q < $rootScope.performances.length; q++) {
                $rootScope.performances[q].gigTime = new Date($rootScope.performances[q].gigTime).toJSON();
            }
            $scope.jsonToUpload = [{
                name: "slides.json",
                jsonData: $rootScope.slides
            }, {
                name: "audio.json",
                jsonData: $rootScope.audio
            }, {
                name: "images.json",
                jsonData: $rootScope.images
            }, {
                name: "videos.json",
                jsonData: $rootScope.videos
            }, {
                name: "projects.json",
                jsonData: $rootScope.projects
            }, {
                name: "performances.json",
                jsonData: $rootScope.performances
            }];
            for (r = 0; r < 6; r++) {
                $http({
                    method: "post",
                    url: '/php/json-post.php',
                    data: $scope.jsonToUpload[r],
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    console.log(data);
                });
            }
        }
    };
});

app.controller('PasswordController', function($scope, $rootScope, $http) {
    $scope.passwordBool = false;
    $scope.matchError = false;
    $scope.oldPasswordError = false;
    $rootScope.passwordOpen = function() {
        $scope.passwordBool = true;
        $scope.matchError = false;
        $scope.oldPasswordError = false;
        $scope.oldPassword = '';
        $scope.newPassword = '';
        $scope.retypedNewPassword = '';
    };
    $scope.submitPassword = function() {
        $http.get('password.php').
        success(function(data, status, headers, config) {
            $scope.password = data[1];
            if ($scope.newPassword != $scope.retypedNewPassword) {
                $scope.matchError = true;
            } else if ($scope.oldPassword != $scope.password) {
                $scope.oldPasswordError = true;
            } else {
                $scope.passwordBool = false;
                console.log('password can be sent');
                $http({
                    method: "post",
                    url: 'password-change.php',
                    data: $scope.newPassword,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    console.log(data);
                });
            }
        });
    };
});

app.controller('SlidesController', function($scope, $rootScope, $http) {
    $http.get('../data/slides.json').success(function(response) {
        $rootScope.slides = response;
        console.log($rootScope.slides);
    });
    $scope.removeSlide = function(index) {
        $rootScope.slides.splice(index, 1);
    }
    $scope.moveUpSlide = function(index) {
        if (index > 0) {
            var removedSlide = $rootScope.slides.slice(index, index + 1);
            $rootScope.slides.splice(index, 1);
            $rootScope.slides.splice(index - 1, 0, removedSlide[0]);
        }
    };
    $scope.moveDownSlide = function(index) {
        if (index < $rootScope.slides.length) {
            var removedSlide = $rootScope.slides.slice(index, index + 1);
            $rootScope.slides.splice(index, 1);
            $rootScope.slides.splice(index + 1, 0, removedSlide[0]);
        }
    };
    $scope.addingSlideBool = false;
    $scope.addSlideFunc = function(index) {
        var slideToAdd = $rootScope.images.slice(index, index + 1);
        var slideToAddObject = {
            image: slideToAdd[0].imageUrl
        }
        $rootScope.slides.splice(0, 0, slideToAddObject);
        $scope.addingSlideBool = false;
    };
});

app.controller('AudioController', function($scope, $rootScope, $timeout, $http, Upload) {
    $http.get('../data/audio.json').success(function(response) {
        $rootScope.audio = response;
        for (var i = 0; i < $rootScope.audio.length; i++) {
            $rootScope.audio[i].aacUrlAdmin = '../' + $rootScope.audio[i].aacUrl;
            $rootScope.audio[i].mp3UrlAdmin = '../' + $rootScope.audio[i].mp3Url;
            $rootScope.audio[i].oggUrlAdmin = '../' + $rootScope.audio[i].oggUrl;
        }
    });
    $scope.removeAudio = function(index) {
        $rootScope.audio.splice(index, 1);
    };
    $scope.moveUpAudio = function(index) {
        if (index > 0) {
            var removedAudio = $rootScope.audio.slice(index, index + 1);
            $rootScope.audio.splice(index, 1);
            $rootScope.audio.splice(index - 1, 0, removedAudio[0]);
        }
    };
    $scope.moveDownAudio = function(index) {
        if (index < $rootScope.audio.length) {
            var removedAudio = $rootScope.audio.slice(index, index + 1);
            $rootScope.audio.splice(index, 1);
            $rootScope.audio.splice(index + 1, 0, removedAudio[0]);
        }
    };
    $scope.editAudioIndex = null;
    $scope.editAudioTitle = function(index) {
        $scope.editAudioIndex = index;
        $scope.orignalAudioTitle = $rootScope.audio[index].title;
    };
    $scope.editAudioBool = function(index) {
        return $scope.editAudioIndex == index;
    };
    $scope.saveAudioTitle = function(index) {
        if ($rootScope.audio[index].title.length) {
            $rootScope.audio[index].title = $rootScope.audio[index].title;
            $scope.editAudioIndex = null;
        }
    };
    $scope.cancelAudioTitle = function(index) {
        $scope.editAudioIndex = null;
        $rootScope.audio[index].title = $scope.orignalAudioTitle;
    };
    $scope.audioUploadBool = false;
    $scope.audioSubmittedOnce;
    $scope.audioUploadOpen = function() {
        $scope.audioUploadBool = true;
        if ($scope.audioSubmittedOnce = true) {
            $scope.audioUploadError = {};
        }
    };
    $scope.clearAudio = function() {
        $scope.oggToUpload = '';
        $scope.mp3ToUpload = '';
        $scope.aacToUpload = '';
        $scope.newAudioTitle = '';
    };
    $scope.clearAudio();
    $scope.audioUploadClose = function() {
        $scope.audioUploadBool = false;
        $scope.clearAudio();
    };
    $scope.audioUpload = function() {
        $scope.audioUploadError = {
            ogg: false,
            mp3: false,
            aac: false,
            title: false
        };
        if ($scope.oggToUpload.size && $scope.mp3ToUpload.size && $scope.aacToUpload.size && $scope.newAudioTitle.length) {
            console.log('all audio ready for upload');
            $scope.newAudioObject = {
                oggUrl: 'audio/' + $scope.oggToUpload.name.replace(/\s+/g, ''),
                oggUrlAdmin: '../audio/' + $scope.oggToUpload.name.replace(/\s+/g, ''),
                mp3Url: 'audio/' + $scope.mp3ToUpload.name.replace(/\s+/g, ''),
                mp3UrlAdmin: '../audio/' + $scope.mp3ToUpload.name.replace(/\s+/g, ''),
                aacUrl: 'audio/' + $scope.aacToUpload.name.replace(/\s+/g, ''),
                aacUrlAdmin: '../audio/' + $scope.aacToUpload.name.replace(/\s+/g, ''),
                title: $scope.newAudioTitle
            };
            $rootScope.audio.splice(0, 0, $scope.newAudioObject);
            $scope.uploadArray = [
                $scope.oggToUpload,
                $scope.mp3ToUpload,
                $scope.aacToUpload
            ];
            $scope.progress = 0;
            for (var n = 0; n < 3; n++) {
                var file = $scope.uploadArray[n];
                Upload.upload({
                    url: '/php/audio-upload.php',
                    method: 'POST',
                    file: file
                }).then(function(res) {
                    $timeout(function() {
                        console.log(res);
                        $scope.progress += 100 / 3;
                        if ($scope.progress == 100) {
                            $scope.progress = undefined;
                        }
                    });
                }, function(res) {
                    if (res.status > 0)
                        console.log(res);
                }, function(evt) {
                    var particalProgress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                    if (particalProgress > $scope.progress && particalProgress < 100) {
                        $scope.progress = particalProgress;
                    }
                    console.log($scope.progress);
                });
            }
            $scope.audioUploadClose();
            $scope.clearAudio();
            $scope.audioSubmittedOnce = true;
        }
        if (!$scope.oggToUpload.length) {
            $scope.audioUploadError.ogg = true;
        }
        if (!$scope.mp3ToUpload.length) {
            $scope.audioUploadError.mp3 = true;
        }
        if (!$scope.aacToUpload.length) {
            $scope.audioUploadError.aac = true;
        }
        if (!$scope.newAudioTitle.length) {
            $scope.audioUploadError.title = true;
        }
    };
});

app.controller('ImageController', function($scope, $rootScope, $http, Upload) {
    $http.get('../data/images.json').success(function(response) {
        $rootScope.images = response;
        console.log($rootScope.images);
    });
    $scope.imageUploadBool = false;
    $scope.newImageDescription = '';
    $scope.imageUploadClose = function() {
        $scope.imageUploadBool = false;
        $scope.newImageDescription = '';
    };
    $scope.imageToUpload = '';
    $scope.imageUpload = function() {
        var file = $scope.imageToUpload;
        $scope.imageDescriptionWarning = false;
        $scope.imageFileWarning = false;
        if ($scope.newImageDescription.length && $scope.imageToUpload.size) {
            $scope.newImageObject = {
                imageUrl: "img/" + file.name.replace(/\s+/g, ''),
                imageDescription: $scope.newImageDescription
            };
            console.log($scope.newImageObject);
            $rootScope.images.splice(0, 0, $scope.newImageObject);
            $scope.imageUploadBool = false;
            Upload.upload({
                url: '/php/image-upload.php',
                method: 'POST',
                file: file
            }).success(function(data, status, headers, config) {
                console.log('file ' + config.file.name + ' uploaded. Response: ' + data);
            });
            $scope.newImageDescription = '';
        } else {
            if (!$scope.newImageDescription.length) {
                $scope.imageDescriptionWarning = true;
            }
            if (!$scope.imageToUpload.size) {
                $scope.imageFileWarning = true;
            }
        }
    };
    $scope.removeImage = function(index) {
        $rootScope.images.splice(index, 1);
    };
    $scope.moveUpImage = function(index) {
        if (index > 0) {
            var removedImage = $rootScope.images.slice(index, index + 1);
            $rootScope.images.splice(index, 1);
            $rootScope.images.splice(index - 1, 0, removedImage[0]);
        }
    };
    $scope.moveDownImage = function(index) {
        if (index < $rootScope.images.length) {
            var removedImage = $rootScope.images.slice(index, index + 1);
            $rootScope.images.splice(index, 1);
            $rootScope.images.splice(index + 1, 0, removedImage[0]);
        }
    };
    $scope.editImageIndex = null;
    $scope.editImageDescription = function(index) {
        $scope.editImageIndex = index;
        $scope.originalImageDescription = $rootScope.images[index].imageDescription;
    };
    $scope.editImageBool = function(index) {
        return $scope.editImageIndex == index;
    };
    $scope.saveImageDescription = function(index) {
        if ($rootScope.images[index].imageDescription.length) {
            $rootScope.images[index].imageDescription = $rootScope.images[index].imageDescription;
            $scope.editImageIndex = null;
        }
    };
    $scope.cancelImageDescription = function(index) {
        $scope.editImageIndex = null;
        $rootScope.images[index].imageDescription = $scope.originalImageDescription;
    };
});

app.controller('VideoController', function($scope, $rootScope, $http, $sce) {
    $http.get('../data/videos.json').success(function(response) {
        $rootScope.videos = response;
        for (j = 0; j < $rootScope.videos.length; j++) {
            var videoId = $rootScope.videos[j].videoUrl.slice(32);
            $rootScope.videos[j].videoEmbedUrl = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + videoId);
        }
    });
    $scope.removeVideo = function(index) {
        $rootScope.videos.splice(index, 1);
    };
    $scope.moveUpVideo = function(index) {
        if (index > 0) {
            var removedVideo = $rootScope.videos.slice(index, index + 1);
            $rootScope.videos.splice(index, 1);
            $rootScope.videos.splice(index - 1, 0, removedVideo[0]);
        }
    };
    $scope.moveDownVideo = function(index) {
        if (index < $rootScope.videos.length) {
            var removedVideo = $rootScope.videos.slice(index, index + 1);
            $rootScope.videos.splice(index, 1);
            $rootScope.videos.splice(index + 1, 0, removedVideo[0]);
        }
    };
    $scope.editVideoIndex = null;
    $scope.editVideoDetails = function(index) {
        $scope.editVideoIndex = index;
        $scope.originalVideoObject = JSON.parse(JSON.stringify($rootScope.videos[index]));
        console.log($scope.originalVideoObject);
    };
    $scope.editVideoBool = function(index) {
        return $scope.editVideoIndex == index;
    };
    $scope.cancelVideoDetails = function(index) {
        $scope.editVideoIndex = null;
        $rootScope.videos[index] = $scope.originalVideoObject;
        $rootScope.videos[index].videoEmbedUrl = $rootScope.videos[index].videoEmbedUrl.videoUrl;
    };
    $scope.saveVideoDetails = function(index) {
        if ($rootScope.videos[index].videoTitle.length && $rootScope.videos[index].videoUrl.length && $rootScope.videos[index].videoDescription.length) {
            $rootScope.videos[index].videoTitle = $rootScope.videos[index].videoTitle;
            $rootScope.videos[index].videoUrl = $rootScope.videos[index].videoUrl;
            $rootScope.videos[index].videoDescription = $rootScope.videos[index].videoDescription;
            var videoId = $rootScope.videos[index].videoUrl.slice(32);
            $rootScope.videos[index].videoEmbedUrl = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + videoId);
            $scope.editVideoIndex = null;
        }
    };
    $scope.videoUploadBool = false;
    $scope.videoUploadClose = function() {
        $scope.videoUploadBool = false;
        $scope.newVideoTitle = '';
        $scope.newVideoDescription = '';
        $scope.newVideoUrl = '';
    };
    $scope.videoUpload = function() {
        $scope.videoTitleWarning = false;
        $scope.videoDescriptionWarning = false;
        $scope.videoUrlWarning = false;
        if ($scope.newVideoTitle.length && $scope.newVideoDescription.length && $scope.newVideoUrl.length) {
            var videoId = $scope.newVideoUrl.slice(32);
            $scope.newVideoEmbedUrl = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + videoId);
            $scope.newVideoObject = {
                videoTitle: $scope.newVideoTitle,
                videoUrl: $scope.newVideoUrl,
                videoDescription: $scope.newVideoDescription,
                videoEmbedUrl: $scope.newVideoEmbedUrl
            };
            console.log($scope.newVideoObject);
            $rootScope.videos.splice(0, 0, $scope.newVideoObject);
            $scope.videoUploadBool = false;
            $scope.newVideoTitle = '';
            $scope.newVideoDescription = '';
            $scope.newVideoUrl = '';
        } else {
            if (!$scope.newVideoTitle.length) {
                $scope.videoTitleWarning = true;
            }
            if (!$scope.newVideoDescription.length) {
                $scope.videoDescriptionWarning = true;
            }
            if (!$scope.newVideoUrl.length) {
                $scope.videoUrlWarning = true;
            }
        }
    };
});

app.controller('ProjectsController', function($scope, $rootScope, $http, Upload) {
    $http.get('../data/projects.json').success(function(response) {
        $rootScope.projects = response;
    });
    $scope.removeProject = function(index) {
        $rootScope.projects.splice(index, 1);
    };
    $scope.moveUpProject = function(index) {
        if (index > 0) {
            var removedProject = $rootScope.projects.slice(index, index + 1);
            $rootScope.projects.splice(index, 1);
            $rootScope.projects.splice(index - 1, 0, removedProject[0]);
        }
    };
    $scope.moveDownProject = function(index) {
        if (index < $rootScope.projects.length) {
            var removedProject = $rootScope.projects.slice(index, index + 1);
            $rootScope.projects.splice(index, 1);
            $rootScope.projects.splice(index + 1, 0, removedProject[0]);
        }
    };
    $scope.editProjectIndex = null;
    $scope.editProjectDetails = function(index) {
        $scope.editProjectIndex = index;
        $scope.originalProjectTitle = $rootScope.projects[index].projectTitle;
        $scope.originalProjectDescription = $rootScope.projects[index].projectDescription;
    };
    $scope.editProjectBool = function(index) {
        return $scope.editProjectIndex == index;
    };
    $scope.cancelProjectDetails = function(index) {
        $scope.editProjectIndex = null;
        $rootScope.projects[index].projectTitle = $scope.originalProjectTitle;
        $rootScope.projects[index].projectDescription = $scope.originalProjectDescription;
    };
    $scope.saveProjectDetails = function(index) {
        if ($rootScope.projects[index].projectTitle.length && $rootScope.projects[index].projectDescription.length) {
            $rootScope.projects[index].projectTitle = $rootScope.projects[index].projectTitle;
            $rootScope.projects[index].projectDescription = $rootScope.projects[index].projectDescription;
            $scope.editProjectIndex = null;
        }
    };
    $scope.projectIndex = null;
    $scope.choosingProjectImageIndex = null;
    $scope.uploadProjectImageIndex = null;
    $scope.projectImageOptions = function(index) {
        $scope.projectIndex = index;
    };
    $scope.projectImageOptionsBool = function(index) {
        return $scope.projectIndex == index;
    };
    $scope.projectImageOptionsClose = function() {
        $scope.projectIndex = null;
        $scope.choosingProjectImageIndex = null;
        $scope.uploadProjectImageIndex = null;
    };
    $scope.chooseProjectImage = function(index) {
        $scope.choosingProjectImageIndex = index;
        $scope.uploadProjectImageIndex = null;
    };
    $scope.choosingProjectImageBool = function(index) {
        return $scope.choosingProjectImageIndex == index;
    };
    $scope.chooseProjectImageCloseFunc = function() {
        $scope.choosingProjectImageIndex = null;
    };
    $scope.chooseProjectImageFunc = function(index) {
        $rootScope.projects[$scope.projectIndex].projectImg = $rootScope.images[index].imageUrl;
        $scope.choosingProjectImageIndex = null;
    };
    $scope.uploadProjectImage = function(index) {
        $scope.uploadProjectImageIndex = index;
        $scope.choosingProjectImageIndex = null;
    };
    $scope.uploadProjectImageBool = function(index) {
        return $scope.uploadProjectImageIndex == index;
    };
    $scope.uploadProjectImageCancel = function() {
        $scope.uploadProjectImageIndex = null;
    };
    $scope.existingProjectImageUploadError = false;
    $scope.projectImageToUpload = [];
    $scope.projectImageUpload = function(index) {
        var file = $scope.projectImageToUpload[index].image;
        if (file == undefined) {
            file = '';
        }
        if (file.size) {
            $rootScope.projects[$scope.projectIndex].projectImg = "img/" + file.name.replace(/\s+/g, '');
            Upload.upload({
                url: '/php/image-upload.php',
                method: 'POST',
                file: file
            }).success(function(data, status, headers, config) {
                console.log(config);
                $scope.projectImageOptionsClose();
                $scope.existingProjectImageUploadError = false;
            });
        } else {
            $scope.existingProjectImageUploadError = true;
        }
    };
    $scope.projectUploadBool = false;
    $scope.choosingProjectImageAddBool = false;
    $scope.uploadProjectImageAddBool = false;
    $scope.chosenProjectImage = '';
    $scope.chosenProjectImageIndex = null;
    $scope.clearProjectAddErrors = function() {
        $scope.projectTitleAddWarning = false;
        $scope.projectDescriptionAddWarning = false;
        $scope.projectImageAddError = false;
    };
    $scope.clearProjectAddErrors();
    $scope.uploadProjectImageAddCancel = function() {
        $scope.projectUploadBool = false;
        $scope.choosingProjectImageAddBool = false;
        $scope.uploadProjectImageAddBool = false;
        $scope.chosenProjectImage = '';
        $scope.chosenProjectImageIndex = null;
        $scope.clearProjectAddErrors();
        $scope.newProjectTitle = '';
        $scope.newProjectUrl = '';
        $scope.newProjectDescription = '';
    };
    $scope.chooseProjectAddImage = function() {
        $scope.choosingProjectImageAddBool = true;
        $scope.uploadProjectImageAddBool = false;
    };
    $scope.uploadProjectAddImage = function() {
        $scope.choosingProjectImageAddBool = false;
        $scope.uploadProjectImageAddBool = true;
        $scope.chosenProjectImage = '';
        $scope.chosenProjectImageIndex = null;
    };
    $scope.chooseProjectAddImageFunc = function(index) {
        $scope.chosenProjectImage = $rootScope.images[index].imageUrl;
        $scope.chosenProjectImageIndex = index;
    };
    $scope.projectImageSelected = function(index) {
        return $scope.chosenProjectImageIndex == index;
    };
    $scope.newProjectTitle = '';
    $scope.newProjectUrl = '';
    $scope.newProjectDescription = '';
    $scope.newProjectImageToUpload = '';
    $scope.addNewProject = function() {
        console.log($scope.newProjectTitle);
        if ($scope.newProjectTitle.length && $scope.newProjectDescription.length && ($scope.chosenProjectImage.length || $scope.newProjectImageToUpload.length)) {
            console.log('new project ready');
            if ($scope.choosingProjectImageAddBool) {
                $scope.newProjectObject = {
                    projectTitle: $scope.newProjectTitle,
                    projectUrl: $scope.newProjectUrl,
                    projectImg: $scope.chosenProjectImage,
                    projectDescription: $scope.newProjectDescription
                };
                $rootScope.projects.splice(0, 0, $scope.newProjectObject);
                $scope.newProjectTitle = '';
                $scope.newProjectUrl = '';
                $scope.newProjectDescription = '';
                $scope.chosenProjectImage = '';
                $scope.newProjectObject = {};
            }
            if ($scope.uploadProjectImageAddBool) {
                var file = $scope.newProjectImageToUpload;
                $scope.newProjectObject = {
                    projectTitle: $scope.newProjectTitle,
                    projectUrl: $scope.newProjectUrl,
                    projectImg: "img/" + file[0].name.replace(/\s+/g, ''),
                    projectDescription: $scope.newProjectDescription
                };
                console.log($scope.newProjectObject);
                $rootScope.projects.splice(0, 0, $scope.newProjectObject);
                console.log($scope.newProjectTitle);
                $scope.newProjectTitle = '';
                $scope.newProjectDescription = '';
                $scope.chosenProjectImage = '';
                $scope.newProjectObject = {};
                Upload.upload({
                    url: '/php/image-upload.php',
                    method: 'POST',
                    file: file
                }).success(function(data, status, headers, config) {
                    console.log('file ' + config.file.name + ' uploaded. Response: ' + data);
                });
            }
            $scope.uploadProjectImageAddCancel();
            $scope.chosenProjectImageIndex = null;
            $scope.clearProjectAddErrors();
        } else {
            console.log('not ready');
            if (!$scope.newProjectTitle.length) {
                $scope.projectTitleAddWarning = true;
            }
            if (!$scope.newProjectDescription.length) {
                $scope.projectDescriptionAddWarning = true;
            }
            if (!$scope.chosenProjectImage.length && !$scope.newProjectImageToUpload.length) {
                $scope.projectImageAddError = true;
            }
        }
    };
});

app.controller('PerformancesController', function($scope, $rootScope, $http, $filter) {
    $http.get('../data/performances.json').success(function(response) {
        var orderBy = $filter('orderBy');
        $rootScope.performances = response;
        $scope.order = function(predicate, reverse) {
            $rootScope.performances = orderBy($rootScope.performances, predicate, reverse);
        };
        $scope.order('-gigTime', false);
        $scope.performancesTime = [];
        for (k = 0; k < $rootScope.performances.length; k++) {
            var performanceDate = new Date($rootScope.performances[k].gigTime);
            $scope.performancesTime[k] = {
                date: performanceDate,
                time: performanceDate
            };
        }
        console.log($rootScope.performances);
        console.log($scope.performancesTime);
    });
    $scope.editPerformanceIndex = null;
    $scope.editPerformance = function(index) {
        $scope.editPerformanceIndex = index;
        $scope.originalPerformanceObject = JSON.parse(JSON.stringify($rootScope.performances[index]));
        $scope.originalPerformanceTimeObject = JSON.parse(JSON.stringify($scope.performancesTime[index]));
        $scope.originalPerformanceTimeObject.date = new Date($scope.originalPerformanceTimeObject.date);
        $scope.originalPerformanceTimeObject.time = new Date($scope.originalPerformanceTimeObject.time);
        console.log($scope.originalPerformanceTimeObject);

    };
    $scope.editPerformanceBool = function(index) {
        return $scope.editPerformanceIndex == index;
    };
    $scope.cancelEditPerformance = function(index) {
        $scope.editPerformanceIndex = null;
        $rootScope.performances[index] = $scope.originalPerformanceObject;
        $scope.performancesTime[index] = $scope.originalPerformanceTimeObject;
    };
    $scope.savePerformanceEdit = function(index) {
        $scope.editPerformanceIndex = null;
        var date = $scope.performancesTime[index].date;
        var hours = $scope.performancesTime[index].time.getHours();
        var minutes = $scope.performancesTime[index].time.getMinutes();
        date.setHours(hours);
        date.setMinutes(minutes);
        $rootScope.performances[index].gigTime = date;
    };
    $scope.removePerformance = function(index) {
        $rootScope.performances.splice(index, 1);
        $scope.performancesTime.splice(index, 1);
    };
    $scope.addPerformanceBool = false;
    $scope.clearPerformanceToAdd = function() {
        $scope.performanceToAdd = {
            gigTitle: '',
            venue: '',
            venueUrl: '',
            gigTime: '',
            gigAddress: {
                street: '',
                city: '',
                state: '',
                zip: ''
            },
            gigDetails: ''
        };
    };
    $scope.clearPerformanceToAdd();
    $scope.clearPerformanceTimeToAdd = function() {
        $scope.performanceTimeToAdd = {
            date: '',
            time: ''
        };
    };
    $scope.clearPerformanceTimeToAdd();
    $scope.addPerformanceClose = function() {
        $scope.addPerformanceBool = false;
        $scope.clearPerformanceToAdd();
        $scope.clearPerformanceTimeToAdd();
    };
    $scope.clearPerformanceAddErrors = function() {
        $scope.performanceAddError = {
            title: false,
            date: false,
            time: false,
            venue: false,
            venueUrl: false,
            street: false,
            city: false,
            state: false,
            zip: false,
            details: false
        };
    };
    $scope.clearPerformanceAddErrors();
    $scope.addNewPerformance = function() {
        $scope.clearPerformanceAddErrors();
        if ($scope.performanceToAdd.gigTitle.length && $scope.performanceTimeToAdd.date != null && $scope.performanceTimeToAdd.time != null && $scope.performanceToAdd.venue.length && $scope.performanceToAdd.venueUrl.length && $scope.performanceToAdd.gigAddress.street.length && $scope.performanceToAdd.gigAddress.city.length && $scope.performanceToAdd.gigAddress.state.length && $scope.performanceToAdd.gigAddress.zip.length && $scope.performanceToAdd.gigDetails.length) {
            var date = $scope.performanceTimeToAdd.date;
            var hours = $scope.performanceTimeToAdd.time.getHours();
            var minutes = $scope.performanceTimeToAdd.time.getMinutes();
            date.setHours(hours);
            date.setMinutes(minutes);
            $scope.performanceToAdd.gigTime = date;
            $rootScope.performances.splice(0, 0, $scope.performanceToAdd);
            $scope.clearPerformanceToAdd();
            $scope.clearPerformanceTimeToAdd();
            $scope.addPerformanceBool = false;
        } else {
            if (!$scope.performanceToAdd.gigTitle.length) {
                $scope.performanceAddError.title = true;
            }
            if ($scope.performanceTimeToAdd.date == null) {
                $scope.performanceAddError.date = true;
            }
            if ($scope.performanceTimeToAdd.time == null) {
                $scope.performanceAddError.time = true;
            }
            if (!$scope.performanceToAdd.venue.length) {
                $scope.performanceAddError.venue = true;
            }
            if (!$scope.performanceToAdd.venueUrl.length) {
                $scope.performanceAddError.venueUrl = true;
            }
            if (!$scope.performanceToAdd.gigAddress.street.length) {
                $scope.performanceAddError.street = true;
            }
            if (!$scope.performanceToAdd.gigAddress.city.length) {
                $scope.performanceAddError.city = true;
            }
            if (!$scope.performanceToAdd.gigAddress.state.length) {
                $scope.performanceAddError.state = true;
            }
            if (!$scope.performanceToAdd.gigAddress.zip.length) {
                $scope.performanceAddError.zip = true;
            }
            if (!$scope.performanceToAdd.gigDetails.length) {
                $scope.performanceAddError.details = true;
            }
        }
    };
});