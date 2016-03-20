angular.module('trump', ['ui.bootstrap'])

.controller('TrumpCtrl', function ($scope, $uibModal, $http) {


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
  const server = 'http://localhost:3000/api/createContract';

  var handler = StripeCheckout.configure({
    key: 'pk_test_xi8hyOSW2WZaKX1LZ2mgdMAH', //pk_live_R2hcONSAEfIcn8vC18Xiv7gE
    locale: 'auto',
    token: function(token) {
      console.log(token);
      $http.post(server, {
        stripeToken: token
      });
      //Send to token and details REST backend server
        //Backend server will validate token with stripe
        //Backend server will create goal and stake info in firebase
        //Backend server creates stripe customer and attaches it to firebase customer data
        //Return success, or error
      //Display success confirmation
    }
  });

  $scope.getCardDetails = function(email, recipient) {
    handler.open({
      name: recipient.name,
      image: recipient.stripeCheckoutImage,
      //description: 'No charge until due date',
      description: ('(Only pay if goal is not completed)'),
      amount: 2000,
      email: email,
      panelLabel: "Create {{amount}} commitment contract"
    });
  };


  //$('#customButton').on('click', function(e) {
  //  // Open Checkout with further options
  //  handler.open({
  //    name: 'Stripe.com',
  //    description: '2 widgets',
  //    amount: 2000
  //  });
  //  e.preventDefault();
  //});

  // Close Checkout on page navigation
  $(window).on('popstate', function() {
    handler.close();
  });





  $scope.open = function (size) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      scope: $scope,
      controller: function ($scope, $uibModalInstance) {

        //$scope.items = items;
        //$scope.selected = {
        //  item: $scope.items[0]
        //};

        $scope.ok = function () {
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
      if($scope.recipient === 'hillary') {
        $('#homeFullScreen').css('background-size', 'cover');
        $('#homeFullScreen').css('background-image', 'url("https://static-secure.guim.co.uk/sys-images/Guardian/Pix/pictures/2015/4/15/1429115266876/Hillary-Clinton-009.jpg")');
      }
      else if(recipient === 'trump') {
        $('#homeFullScreen').css('background-size', 'cover');
        $('#homeFullScreen').css('background-image', 'url("https://static6.businessinsider.com/image/55918b77ecad04a3465a0a63/nbc-fires-donald-trump-after-he-calls-mexicans-rapists-and-drug-runners.jpg")');
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
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    //TODO: Disable old dates

    //var date = data.date,
    //  mode = data.mode;
    //return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

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

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }
});
