angular.module('trump', ['ui.bootstrap', 'backand', '720kb.socialshare'])

.config(function (BackandProvider) {
  BackandProvider.setAppName('trumpyourgoals');
  BackandProvider.setAnonymousToken('a8ee36f3-99f7-4b35-96ca-4c6625e9fb42');
})

.controller('TrumpCtrl', function ($scope, $uibModal, $http, Backand) {

  $scope.shareURL = "http://www.trumpyourgoals.com";

  $scope.recipient = "";
  $scope.background = 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Donald_Trump_August_19,_2015_(cropped).jpg';
  $scope.backgroundCSS = {'background-image': ("background-image:url('" + $scope.background + "')") };

  $(window).resize(function() {
    console.log("window resize ran");
    $('.goal-container').css('height', window.innerHeight - (window.innerHeight *.10) +'px');
    $('.goal-container-inside').css('height', window.innerHeight - (window.innerHeight *.50) +'px');
  });

  $('.goal-container').css('height', window.innerHeight - (window.innerHeight *.10) +'px');

  $scope.recipients = {
    'trump': {
      name: 'Donald Trump',
      website: 'http://donaldjtrump.com',
      stripeCheckoutImage: 'https://pbs.twimg.com/profile_images/649272612997210112/u2cilcdq.jpg'
    },
    'hillary': {
      name: 'Hillary Clinton',
      website: 'http://hillaryclinton.com',
      stripeCheckoutImage: 'https://pbs.twimg.com/profile_images/588068152854052865/FFNOz-xQ.jpg'
    }
  };

  var createStripeCustomer = function(tokenID) {
    return $http ({
      method: 'POST',
      url: Backand.getApiUrl() + '/1/objects/action/goals/?name=createStripeCustomer',
      data: {
        email: $scope.email,
        stripe_token_id: tokenID
      }
    });

    // return $http ({
    //   method: 'POST',
    //   url: Backand.getApiUrl() + '/1/objects/action/goals/1?name=createStripeCustomer',
    //   data: {
    //     // email: 'asdf@fdsza.com',
    //     // stripe_token_id: 'tok_18l8bM273fOFEuQM2Kok0BX0'
    //     stripe_token_id: token,
    //     email: $scope.email
    //   }
    // });
    // $http({
    //   method: 'GET',
    //   url: Backand.getApiUrl() + '/1/objects/action/goals/1?name=createStripeCustomer',
    //   params:{
    //     parameters:{
    //       stripe_token_id: token,
    //       email: $scope.email
    //     }
    //   }
    // }).then(function () {
    //   console.log('success creating customer');
    // }).catch(function (err) {
    //     if (err.type && /^Stripe/.test(err.type)) {
    //       console.error('Stripe error: ', err);
    //     }
    //     else {
    //       console.error('Other error occurred, possibly with your API', err.message);
    //     }
    //   });
  };

  var handler = null;

  $scope.getCardDetails = function(email, recipient) {
    if (!handler) {
      handler = handler || StripeCheckout.configure({
          key: 'pk_test_xi8hyOSW2WZaKX1LZ2mgdMAH', //pk_live_R2hcONSAEfIcn8vC18Xiv7gE
          locale: 'auto',
          token: function(token) {
            //debugger;
            console.log(token);
            $scope.tokenID = token.id;
            createStripeCustomer(token.id)
              .then(function(stripeCustomerResponse) {
                var customerID = stripeCustomerResponse.data.data.id;
                console.log("Customer created from Stripe customer successfully!!");
                console.log(stripeCustomerResponse);
                return $http({
                  method: 'POST',
                  url: Backand.getApiUrl() + '/1/objects/goals',
                  data: {
                    "title": $scope.goal,
                    "due_date": "2016-08-22T01:12:45.828Z",
                    "amount": $scope.amount,
                    "recipient": $scope.recipient,
                    "stake_type": "anticharity",
                    "user_email": $scope.email,
                    "judge_email": $scope.judgeEmail,
                    "user_name": $scope.name,
                    "judge_name": $scope.judgeName,
                    "stripe_token_id": $scope.tokenID,
                    "stripe_token_details": JSON.stringify(token),
                    "stripe_customer_details": JSON.stringify(stripeCustomerResponse),
                    "stripe_customer_id": customerID,
                    "status": "created",
                    "created_at": new Date().toISOString().slice(0, 19).replace('T', ' ')
                  }
                }).then(function successCallback(response) {
                  // this callback will be called asynchronously
                  // when the response is available
                  console.log("success, resp:", response);
                  $scope.openSuccess();
                }, function errorCallback(response) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
                  alert("Error saving goal, please try again later.\n\nNo Charge has been made.");
                  console.error("ERROR, resp:", response);
                });
              })
              .catch(function (err) {
                if (err.type && /^Stripe/.test(err.type)) {
                  console.error('Stripe error: ', err);
                  alert("Error saving goal, please try again later.\n\nNo Charge has been made.");
                }
                else {
                  console.error('Other error occurred, possibly with your API', err.message);
                  console.error(err);
                  alert("Error saving goal, please try again later.\n\nNo Charge has been made.");
                }
              });
          }
        });

      // Close Checkout on page navigation
      $(window).on('popstate', function() {
        handler.close();
      });
    }


    handler.open({
      name: recipient.name,
      image: recipient.stripeCheckoutImage,
      //description: 'No charge until due date',
      description: ('(Only pay if goal is not completed)'),
      amount: $scope.amount * 100,
      email: email,
      panelLabel: "Commit to "
    });
  };

  $scope.openSuccess = function (size) {
    var scope = $scope;
    
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'success.html',
      scope: $scope,
      controller: function ($scope, $uibModalInstance) {
        $scope.amount = scope.amount;
        $scope.due_date = scope.due_date;
        $scope.recipient = scope.recipient;
        $scope.goal = scope.goal;
        $scope.shareURL = "http://www.trumpyourgoals.com";
        var recipient = $scope.recipient === 'trump' ? 'Donald Trump' : 'Hillary Clinton';

        $scope.emailTitle = function() {
          return 'I\'m going to pay $' + $scope.amount + ' to ' + recipient + ' if I don\'t complete my goal!';
        };

        $scope.emailAddress = function() {
          return ($scope.recipient === 'trump') ? 'Donald@TrumpYourGoals.com' : 'Hillary@TrumpYourGoals.com';
        };

        $scope.shareString = function(platform) {
          switch (platform) {
            case 'twitter':
              return 'I have just committed to ' + $scope.goal + ', and will send $' + $scope.amount + ' to ' + recipient + ' if I fail.';
            default:
              return 'I have just committed to achieving the goal of ' + $scope.goal + ', and have set the personal stake of sending $' + $scope.amount + ' directly to ' + recipient + ' if I fail to accomplish this goal.' +
                      ' You can Trump YOUR goals, too, at http://trumpyourgoals.com';
          }

          //return "I've agreed to pay $" + $scope.amount + " to " + recipient + " if I don't complete my goal by" + $scope.due_date;
        };

        $scope.ok = function () {
          $uibModalInstance.close(true);
        };

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      },
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      //$log.info('Modal dismissed at: ' + new Date());
    });
  };

  function validateGoalForm() {
    var error = "";
    // Goal
    if (!$scope.goal || $scope.goal.length <= 1) {
      error+="Goal length must be at least 2 characters\n";
    }
    // Date
    if (!$scope.date) {

    }
    // Amount
    if (isNaN($scope.amount) || $scope.amount < 5) {
      error+="Please enter 5 or more dollars before proceeding\n";
    }
    // Anti-Charity
    if ($scope.recipient !== 'trump' && $scope.recipient !== 'hillary') {
      error+="Please select your anti-charity before proceeding\n";
    }

    return (error === "") ? true : error;
  }

  $scope.open = function (size) {
    //Error checking
    var validation = validateGoalForm();
    if (validation !== true) {
      alert(validation);
      return false;
    }

    var scope = $scope;
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      scope: $scope,
      controller: function ($scope, $uibModalInstance) {
        $scope.ok = function () {
          scope.email = $scope.email;
          scope.name = $scope.name;
          scope.judgeEmail = $scope.judgeEmail;
          scope.judgeName = $scope.judgeName;

          $scope.getCardDetails($scope.email, $scope.recipients[$scope.recipient]);

          $uibModalInstance.close(true);
        };

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      },
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      //$log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.select = function(recipient) {
    $scope.recipient = recipient;
    var width = $(window).width(), height = $(window).height();

    var trumpImageURL = (width <= 2136) ? 'https://res.cloudinary.com/flight/image/upload/c_fit,w_0.5/v1473640624/donald-trump-bg_o4aa5j.jpg' : 'https://res.cloudinary.com/flight/image/upload/v1473640624/donald-trump-bg_o4aa5j.jpg';
    var hillaryImageURL = 'https://res.cloudinary.com/flight/image/upload/q_auto:good/v1473640744/hillary-clinton-bg_qjtute.jpg';

    if($scope.recipient === 'hillary') {
      $('#homeFullScreen').css('background-size', 'cover');
      $('#homeFullScreen').css('background-image', 'url(' + hillaryImageURL + ')');
    }
    else if(recipient === 'trump') {
      $('#homeFullScreen').css('background-size', 'cover');
      $('#homeFullScreen').css('background-image', 'url(' + trumpImageURL + ')');
    }
  };

  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  $scope.inlineOptions = {
    // customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    // dateDisabled: disabled,
    formatYear: 'yy',
    // maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    // startingDay: 1
    showWeeks: false
  };

  // Disable weekend selection
  function disabled(data) {
    // return (data.date.withoutTime() <= new Date().withoutTime());
    // if (data.date.getTime() > new Date().getTime()) {
    //   alert("The first date is after the second date!");
    // }
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  // $scope.toggleMin();
  // $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = 'mediumDate';
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  // var tomorrow = new Date();
  // tomorrow.setDate(tomorrow.getDate() + 1);
  // var afterTomorrow = new Date();
  // afterTomorrow.setDate(tomorrow.getDate() + 1);
  // $scope.events = [
  //   {
  //     date: tomorrow,
  //     status: 'full'
  //   },
  //   {
  //     date: afterTomorrow,
  //     status: 'partially'
  //   }
  // ];
  //
  // function getDayClass(data) {
  //   var date = data.date,
  //     mode = data.mode;
  //   if (mode === 'day') {
  //     var dayToCheck = new Date(date).setHours(0,0,0,0);
  //
  //     for (var i = 0; i < $scope.events.length; i++) {
  //       var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
  //
  //       if (dayToCheck === currentDay) {
  //         return $scope.events[i].status;
  //       }
  //     }
  //   }
  //
  //   return '';
  // }




  // $scope.today = function() {
  //   $scope.dt = new Date();
  // };
  // $scope.today();
  //
  // $scope.clear = function() {
  //   $scope.dt = null;
  // };
  //
  // $scope.inlineOptions = {
  //   customClass: getDayClass,
  //   minDate: new Date(),
  //   showWeeks: true
  // };
  //
  // $scope.dateOptions = {
  //   dateDisabled: disabled,
  //   formatYear: 'yy',
  //   maxDate: new Date(2020, 5, 22),
  //   minDate: new Date(),
  //   startingDay: 1
  // };
  //
  // // Disable weekend selection
  // function disabled(data) {
  //   var date = data.date,
  //     mode = data.mode;
  //   return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  // }
  //
  // $scope.toggleMin = function() {
  //   $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
  //   $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  // };
  //
  // $scope.toggleMin();
  //
  // $scope.open1 = function() {
  //   $scope.popup1.opened = true;
  // };
  //
  // $scope.open2 = function() {
  //   $scope.popup2.opened = true;
  // };
  //
  // $scope.setDate = function(year, month, day) {
  //   $scope.dt = new Date(year, month, day);
  // };
  //
  // $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  // $scope.format = $scope.formats[0];
  // $scope.altInputFormats = ['M!/d!/yyyy'];
  //
  // $scope.popup1 = {
  //   opened: false
  // };
  //
  // $scope.popup2 = {
  //   opened: false
  // };
  //
  // var tomorrow = new Date();
  // tomorrow.setDate(tomorrow.getDate() + 1);
  // var afterTomorrow = new Date();
  // afterTomorrow.setDate(tomorrow.getDate() + 1);
  // $scope.events = [
  //   {
  //     date: tomorrow,
  //     status: 'full'
  //   },
  //   {
  //     date: afterTomorrow,
  //     status: 'partially'
  //   }
  // ];
  //
  // function getDayClass(data) {
  //   var date = data.date,
  //     mode = data.mode;
  //   if (mode === 'day') {
  //     var dayToCheck = new Date(date).setHours(0,0,0,0);
  //
  //     for (var i = 0; i < $scope.events.length; i++) {
  //       var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
  //
  //       if (dayToCheck === currentDay) {
  //         return $scope.events[i].status;
  //       }
  //     }
  //   }
  //
  //   return '';
  // }



});

Date.prototype.withoutTime = function () {
  var d = new Date(this);
  d.setHours(0, 0, 0, 0, 0);
  return d
};