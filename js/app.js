let map, client_ID, client_secret;

function AppViewModel() {
    let self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    /**
     * Deals with filling of the info window with the maker's corresponding details
     * @param marker
     * @param info_window
     */
    this.populateInfoWindow = function(marker, info_window) {
        if (info_window.marker != marker) {
            info_window.setContent('');
            info_window.marker = marker;

            /**
             * Foursquare Client
             * @type {string}
             */

            client_ID = "2G4BOAVMDDTBVKZOU0WI0IBXSQOCMDTIOWZCKXS4XO1RAC0R";
            client_secret =
                "3UZMRJ1XEB1WDHZROFUCCIGDJCFMWPVRG5J4FFDWVDNHEV4K";

            /**
             * URL for Foursquare API
             * @type {string}
             */

            let apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + client_ID +
                '&client_secret=' + client_secret + '&query=' + marker.title +
                '&v=20170708' + '&m=foursquare';

            /**
             * Foursquare API
             */

            $.getJSON(apiUrl).done(function(marker) {
                let response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                self.zip = response.location.formattedAddress[3];
                self.country = response.location.formattedAddress[4];
                self.category = response.categories[0].shortName;

                self.htmlContentFoursquare =
                    '<h5 class="iw_subtitle">(' + self.category +
                    ')</h5>' + '<div>' +
                    '<h6 class="iw_address_title"> Address: </h6>' +
                    '<p class="iw_address">' + self.street + '</p>' +
                    '<p class="iw_address">' + self.city + '</p>' +
                    '<p class="iw_address">' + self.zip + '</p>' +
                    '<p class="iw_address">' + self.country +
                    '</p>' + '</div>' + '</div>';

                info_window.setContent(self.htmlContent + self.htmlContentFoursquare);
            }).fail(function() {
                alert(
                    "Error occurred during the loading the Foursquare API. Try again please."
                );
            });

            this.htmlContent = '<div>' + '<h4 class="iw_title">' + marker.title +
                '</h4>';

            info_window.open(map, marker);

            info_window.addListener('closeclick', function() {
                info_window.marker = null;
            });
        }
    };

    this.populateAndBounceMarker = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };

    this.initMap = function() {
        let mapCanvas = document.getElementById('map');
        /**
         * Initial center
         * @type {{lat: number, lng: number}}
         */
        let center = {
            lat: 22.539,
            lng: 88.3958
        };
        let mapOptions = {
            center,
            zoom: 11,
            styles: styles
        };
        map = new google.maps.Map(mapCanvas, mapOptions);

        /**
         * Sets InfoWindow
         */

        this.largeInfoWindow = new google.maps.InfoWindow();
        for (let i = 0; i < myLocations.length; i++) {
            this.markerTitle = myLocations[i].title;
            this.markerLat = myLocations[i].lat;
            this.markerLng = myLocations[i].lng;
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateAndBounceMarker);
        }
    };

    this.initMap();

    /**
     *  Appends locations to a list using data-bind
     *  & serves to make the filter work
     */

    this.myLocationsFilter = ko.computed(function() {
        let result = [];
        for (let i = 0; i < this.markers.length; i++) {
            let markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

googleError = function googleError() {
    alert(
        'Sorry! Google Maps did not load. Refresh the page and try again.'
    );
};

function startApp() {
    ko.applyBindings(new AppViewModel());
}