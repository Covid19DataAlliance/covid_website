
var dataSelect = document.getElementById("dropdownMenuButton");
var selectedVariable = null;
var mapVariable = "popultn";

mapboxgl.accessToken = 'pk.eyJ1IjoibW9ycmlzb25nZSIsImEiOiJja2NjZHE5cjkwM3FmMnFvZ3RnNW4wdDBiIn0.UEv4J8Uc6Mc40JlT9Bfsyw';


console.log(counties.features[0].properties.FIPS)

//End Blank Map

//Choropleth and Extrusion Example

ss.jenks = function(data, n_classes) {

        // sort data in numerical order
        data = data.slice().sort(function (a, b) { return a - b; });

        // get our basic matrices
        var matrices = ss.jenksMatrices(data, n_classes),
            // we only need lower class limits here
            lower_class_limits = matrices.lower_class_limits,
            k = data.length - 1,
            kclass = [],
            countNum = n_classes;

        // the calculation of classes will never include the upper and
        // lower bounds, so we need to explicitly set them
        kclass[n_classes] = data[data.length - 1];
        kclass[0] = data[0];

        // the lower_class_limits matrix is used as indexes into itself
        // here: the `k` variable is reused in each iteration.
        while (countNum > 1) {
            kclass[countNum - 1] = data[lower_class_limits[k][countNum] - 2];
            k = lower_class_limits[k][countNum] - 1;
            countNum--;
        }

        return kclass;
    };



    ss.jenksMatrices = function(data, n_classes) {

        // in the original implementation, these matrices are referred to
        // as `LC` and `OP`
        //
        // * lower_class_limits (LC): optimal lower class limits
        // * variance_combinations (OP): optimal variance combinations for all classes
        var lower_class_limits = [],
            variance_combinations = [],
            // loop counters
            i, j,
            // the variance, as computed at each step in the calculation
            variance = 0;

        // Initialize and fill each matrix with zeroes
        for (i = 0; i < data.length + 1; i++) {
            var tmp1 = [], tmp2 = [];
            for (j = 0; j < n_classes + 1; j++) {
                tmp1.push(0);
                tmp2.push(0);
            }
            lower_class_limits.push(tmp1);
            variance_combinations.push(tmp2);
        }

        for (i = 1; i < n_classes + 1; i++) {
            lower_class_limits[1][i] = 1;
            variance_combinations[1][i] = 0;
            // in the original implementation, 9999999 is used but
            // since Javascript has `Infinity`, we use that.
            for (j = 2; j < data.length + 1; j++) {
                variance_combinations[j][i] = Infinity;
            }
        }

        for (var l = 2; l < data.length + 1; l++) {

            // `SZ` originally. this is the sum of the values seen thus
            // far when calculating variance.
            var sum = 0,
                // `ZSQ` originally. the sum of squares of values seen
                // thus far
                sum_squares = 0,
                // `WT` originally. This is the number of
                w = 0,
                // `IV` originally
                i4 = 0;

            // in several instances, you could say `Math.pow(x, 2)`
            // instead of `x * x`, but this is slower in some browsers
            // introduces an unnecessary concept.
            for (var m = 1; m < l + 1; m++) {

                // `III` originally
                var lower_class_limit = l - m + 1,
                    val = data[lower_class_limit - 1];

                // here we're estimating variance for each potential classing
                // of the data, for each potential number of classes. `w`
                // is the number of data points considered so far.
                w++;

                // increase the current sum and sum-of-squares
                sum += val;
                sum_squares += val * val;

                // the variance at this point in the sequence is the difference
                // between the sum of squares and the total x 2, over the number
                // of samples.
                variance = sum_squares - (sum * sum) / w;

                i4 = lower_class_limit - 1;

                if (i4 !== 0) {
                    for (j = 2; j < n_classes + 1; j++) {
                        if (variance_combinations[l][j] >=
                            (variance + variance_combinations[i4][j - 1])) {
                            lower_class_limits[l][j] = lower_class_limit;
                            variance_combinations[l][j] = variance +
                                variance_combinations[i4][j - 1];
                        }
                    }
                }
            }

            lower_class_limits[l][1] = 1;
            variance_combinations[l][1] = variance;
        }

        return {
            lower_class_limits: lower_class_limits,
            variance_combinations: variance_combinations
        };
    };




var mapdiv = document.getElementById('map');
var button = document.createElement("div");


var view1 = {
  center: [-95.52, 39.94],
  zoom: 4,
  bearing: 0,
  pitch: 0,
  speed: 0.5,
  curve: 0.5
};






function updateMap(){
  var map = new mapboxgl.Map({
    container: 'map',
    hash: true,
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-95.52, 39.94],
    zoom: 4,
    debug: 1
  });
  map.addControl(new mapboxgl.NavigationControl());
  map.addControl(new mapboxgl.FullscreenControl());


  map.on('style.load', function() {
    map.flyTo(view1);
    map.addSource('us_counties', {
      'type': 'geojson',
      'data': counties
    });

    var dataArray = [];
    for (i=0; i < counties.features.length; i++){
      dataArray[i] = counties.features[i].properties[mapVariable];
      //console.log(dataArray[i]);
    }
    var breaks = ss.jenks(dataArray,4);
    console.log(breaks[0]);
    console.log(breaks[2]);
    var stop1 = breaks[1];
    var stop2 = breaks[2];
    var stop3 = breaks[3];
    var stop4 = breaks[4];

    map.addLayer({
      'id': 'countiesLayer',
      'type': 'fill',
      'source': 'us_counties',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': {
          'property': mapVariable,
          'stops': [
            [breaks[1], "#FEEDDE"],
            [breaks[2], "#FDBE85"],
            [breaks[3], "#FD8D3C"],
            [breaks[4], "#E6550D"]
          ]
        },
        'fill-outline-color': 'white',
        'fill-opacity': 0.9
      }
    });
    stop1 = Math.round(stop1 * 100) / 100
    stop2 = Math.round(stop2 * 100) / 100
    stop3 = Math.round(stop3 * 100) / 100
    stop4 = Math.round(stop4 * 100) / 100
    var strBrk1 = stop1.toString()
    var strBrk2 = stop2.toString()
    var strBrk3 = stop3.toString()
    var strBrk4 = stop4.toString()

    var layers = [strBrk1,strBrk2,strBrk3,strBrk4];
    var colors = ["#FEEDDE","#FDBE85","#FD8D3C","#E6550D"];


    for (i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var color = colors[i];
      var item = document.createElement('div');
      var key = document.createElement('span');
      key.className = 'legend-key';
      key.style.backgroundColor = color;

      var value = document.createElement('span');
      value.innerHTML = layer;
      item.appendChild(key);
      item.appendChild(value);
      legend.appendChild(item);
    }


  });



  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  function identifyFeatures(location, layer, fields) {
    var identifiedFeatures = map.queryRenderedFeatures(location.point, {layers: [layer]});
    popup.remove();
    if (identifiedFeatures != '') {
      var popupText = "";
      for (i = 0; i < fields.length; i++) {
        popupText += "<strong>" + fields[i] + ":</strong> " + identifiedFeatures[0].properties[fields[i]] + "<" + "br" + ">"
      };
      popup.setLngLat(location.lngLat)
        .setHTML(popupText)
        .addTo(map);
    }
  }

  map.on('click', function(e) {
    identifyFeatures(e, 'countiesLayer', ["NAME", "popultn"])
  });

  map.on('mousemove', function(e) {
    identifyFeatures(e, 'countiesLayer', ["NAME", "popultn"])
  });

}





function selectVariable(e) {
  dataSelect.innerText = e.innerText;
  selectedVariable = e.innerText;
  if (selectedVariable == "Population"){
    mapVariable = "popultn";
  } else if (selectedVariable == "Percent Male") {
    mapVariable = "prcnt_m";
  } else if (selectedVariable == "Percent Female") {
    mapVariable = "prcnt_f";
  } else if (selectedVariable == "Percent Black") {
    mapVariable = "prcnt_bc";
  }
  updateMap();
}

/*
var Module = {
  onRuntimeInitialized: function () {
    updateMap();
  }
};
*/
