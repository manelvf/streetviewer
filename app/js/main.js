var App = function() {};

App.prototype = {
  image_base_url: "static/photos/",
  images: [],
  markers: [],
  cells: 9,
  currentLocation: null,
  side: null,
  panorama: null,
  getMapSide: function() {
    var height = window.innerHeight;
    var width = window.innerWidth;
    var side = height > width? width : height;
    side -= 64;  // logo height
    this.side = side;
    return side;
  },
  setElementsSize: function() {
    var side = this.side;

    // add Footer
    $("#footer").css("width", side+"px");

    $("#footer ul li a").click(function() {
      window.location.href="#container";

      var href = $(this).attr("href");
      switch(href) {
        case "#contact":
          $("#info").html($("#contactText").html());
          break;
        case "#infotext":
          $("#info").html($("#infoText").html());
          break;
      }

      $("#info").show();
    });

    $("#info").click(function() {
      $(this).hide();
    });

    // add cells
    var cellSize = parseInt((side-18)/3);

    for (var i=this.cells; i>0; i--) {
      $("#gallery").prepend(
        '<div id="cell' + i + '" class="cell">' +
          '<div class="see"></div>' +
        '</div>'
      );
    }

    // size overlapped screens
    $('#container').css("height", side+"px").css("width", side+"px");
    $('#info').css("height", side+"px").css("width", side+"px");
    $('#col_2').css("height", side+"px").css("width", side+"px");
    $('#gallery').css("height", side+"px").css("width", side+"px");
    $('#pano').css("height", side+"px").css("width", side+"px");

    $('#gallery div.cell').css("height", cellSize+"px").css("width", cellSize+"px");
    $('.cell .see').css("height", cellSize+"px").css("width", cellSize+"px");

    var closeSize = parseInt(side/16);
    $('#gallery div.close')
      .css("font-size", parseInt(side/18)+"px")
      .css("left", (side - closeSize) + "px")
      .css("width", closeSize+"px")
      .css("height", closeSize+"px")
      .css("line-height", closeSize+"px")
      .click(function() {
        $("#gallery").fadeOut();
      }
    );

    $("#pano .disableLink")
      .css("top", (side - 30)+"px").css("left", "0px");

    $("#pano .close")
      .css("font-size", (side/18)+"px")
      .css("left", (side - closeSize) + "px")
      .css("width", closeSize+"px")
      .css("height", closeSize+"px")
      .css("line-height", closeSize+"px")
      .click(function() {
        $("#pano").fadeOut();
      });

    var hideFSSize = parseInt(side/4);
    $("#pano #hideFullscreen")
      .css("left", (hideFSSize*3)+"px")
      .css("width", hideFSSize+"px")
      .css("height", hideFSSize+"px");

    var checkView = parseInt(side/5);
    $("#pano #checkView")
      .css("left", (checkView * 2)+"px")
      .css("width", checkView+"px")
      .css("height", checkView+"px")
      .click(this.checkPosition());
  },
  checkPosition: function() {
    var that = this;

    return function() {
      var i, im, img_url, new_images = [];
      var loc = that.currentLocation;
      var pan = that.currentPanorama;

      if (loc[0] == pan[0] && loc[1] == pan[1]) {

        $("#pano img#checkView").attr("src", "static/icons/approval.svg");
        $('#gallery').hide();

        // remove the image guessed
        for (i=0; i < that.images.length; i++) {
          im = that.images[i].data_image;
          if (im[0] != loc[0] || im[1] != loc[1]) {
            new_images.push(that.images[i]);
          } else {
            img_url = that.images[i].src;
          }
        }
        that.images = new_images;

        var side = that.side > 300? that.side/8 : 64;

        // mark the marker as guessed
        for (i=0; i < that.markers.length; i++) {
          im = that.markers[i].token;
          if (im[0] == loc[0] && im[1] == loc[1] && img_url) {
            that.markers[i].setIcon({
              scaledSize: new google.maps.Size(side, side),
              url: img_url
            });
            google.maps.event.clearListeners(that.markers[i], "click");
            that.markers[i].addListener("click", that.showPanorama(im, true));
          }
        }

      } else {
        $("#pano img#checkView").attr("src", "static/icons/cancel.svg");
      }
    }

  },
  createMap: function() {
    // set completely arbitrary lat & lng, user will never see this
    var lat = 43.6580789;
    var lng = -7.8068851;

    map = new google.maps.Map(document.getElementById('col_2'), {
      center: {lat: lat, lng: lng},
      scrollwheel: false,
      zoom: 10
    });

    var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(43.63, -7.87),
      new google.maps.LatLng(43.76, -7.77)
    );
    map.fitBounds(bounds);
    m = map.getBounds();
  },
  createPanorama: function() {
    this.panorama = new google.maps.StreetViewPanorama(
      document.getElementById('pano'), {
        position: new google.maps.LatLng(43.63, -7.87),
        pov: {
          heading: 34,
          pitch: 10
        },
        addressControl: false
    });
  },
  showPanorama: function(data, noGame) {
    var that = this;

    return function() {
      if (noGame) {
        $("#pano img#checkView").attr("src", "static/icons/approval.svg");
      } else {
        $("#pano img#checkView").attr("src", "static/icons/question58.svg");
      }

      that.panorama.setPosition(
        new google.maps.LatLng(data[0], data[1])
      );
      $("#pano").show();
      that.panorama.setVisible(true);
      that.currentPanorama = data;
    };
  },
  loadImages: function() {
    var token, marker, img;
    var that = this;

    $.getJSON("static/data/shuffled.json", function(data) {
      for (var i=0; i<data["data"].length; i++) {
        token = data["data"][i];
        marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(token[0], token[1])
        });
        marker.token = token;
        marker.addListener("click", that.openGallery(that.panorama, token));
        that.markers.push(marker);

        img = new Image();
        img.src = that.image_base_url + token[4];
        img.data_image = token;
        that.images.push(img);
      }
    });
  },
  openGallery: function(panorama, token) {
    var that = this;

    return function() {
      that.currentLocation = token;

      var i = 0;
      $("#gallery div.cell").each(function() {
        if (i in that.images) {
          $(this)
            .css("background", 'url("' + that.images[i].src + '")')
            .click(app.showPanorama(that.images[i].data_image));
        } else {
          $(this).remove();
        }
        i++;
      }).css("background-size", "cover");
      $("#gallery").show();
    }
  }
};


function initialize() {
  app = new App();
  app.getMapSide();
  app.setElementsSize();
  app.createMap();
  app.createPanorama();
  app.loadImages();
}
