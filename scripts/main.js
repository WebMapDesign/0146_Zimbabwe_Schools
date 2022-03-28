const urlGoogleSheetSchools =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSRmsqg-xXdROgCiLkkldZt-H3cUqCEfC5F6ediiHqW-f5jzirGmzBTzRc1ZHO94SoWCUELOL-t9Vz/pub?gid=0&single=true&output=csv";

let geojsonSchools = {
  type: "FeatureCollection",
  name: "schools",
  crs: {
    type: "name",
    properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
  },
  features: [],
};

function getLeadsData() {
  Papa.parse(urlGoogleSheetSchools, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      sheetDataSchools = results.data;

      sheetDataSchools.forEach((i) => {
        let newSchool = {
          type: "Feature",
          properties: {
            schoold_id: i["School ID"],
            school_name: i["School Name"],
            region: i["Region"],
            dean_name: i["Dean Name"],
            date_launched: i["Date Launched"],
            launched_by: i["Launched By"],
            number_students: i["Number Students"],
          },
          geometry: {
            type: "Point",
            coordinates: [
              parseFloat(i["Longitude"]),
              parseFloat(i["Latitude"]),
            ],
          },
        };

        geojsonSchools["features"].push(newSchool);
      });

      drawMap();
    },
  });
}

getLeadsData();

function drawMap() {
  let mapBounds = [
    [-14.393, 23.947],
    [-23.692, 35.503],
  ];

  let map = L.map("map", {
    fullScreenControl: false,
    zoomSnap: 0.1,
    minZoom: 7,
    maxZoom: 9,
    maxBounds: mapBounds,
  }).setView([-19.1, 29.3], 7.2);

  L.easyButton(
    '<span class="star" style="padding:0px;">&starf;</span>',

    function (btn, map) {
      map.setView([-19.1, 29.3], 7.2);
    },
    "Default View"
  ).addTo(map);

  let styleRivers = {
    color: "#7ac6db",
    opacity: 1,
    weight: 1,
  };

  let styleLakes = {
    color: "#326d81",
    fillColor: "#81d5f1",
    fillOpacity: 1,
    opacity: 1,
    weight: 1,
  };

  let styleRoads = {
    color: "#e48765",
    opacity: 1,
    weight: 1,
  };

  let styleRailroadsTransversal = {
    color: "#7c7c7c",
    opacity: 1,
    weight: 2,
    dashArray: "1 5",
  };

  let styleRailroads = {
    color: "#7c7c7c",
    opacity: 1,
    weight: 1,
  };

  let styleCountry = {
    color: "#000000",
    fillColor: "#ffffff",
    fillOpacity: 0,
    opacity: 1,
    weight: 2,
  };

  let circlemarkerCitiesMain = {
    color: "#ffffff",
    fillColor: "#000000",
    fillOpacity: 1,
    opacity: 1,
    radius: 6,
    weight: 3,
  };

  let circlemarkerCitiesSecondary = {
    color: "#000000",
    fillColor: "#ffffff",
    fillOpacity: 1,
    opacity: 1,
    radius: 4,
    weight: 1,
  };

  let circleMarkerProvinceCentroids = {
    color: "#ffffff",
    fillColor: "#ff0000",
    fillOpacity: 0,
    opacity: 0,
    radius: 0,
    weight: 2,
  };

  let iconSchool = L.icon({
    iconUrl: "images/push_pin_red_v1.png",
    iconSize: [45, 45],
    popupAnchor: [3.5, -14],
  });

  function styleProvince(feature) {
    return {
      color: "#b99625",
      fillColor: "#fdffe9",
      fillOpacity: 0.5,
      opacity: 1,
      weight: 1.5,
    };
  }

  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      color: "#000000",
      fillColor: "#ffffff",
      fillOpacity: 0.5,
      opacity: 1,
      weight: 1,
    });
  }

  function resetHighlightProvinces(e) {
    layerProvinces.resetStyle(e.target);
  }

  function onEachFeatureProvinceCentroids(feature, layer) {
    let tooltipContent = feature.properties.ADM1_EN;
    layer.bindTooltip(tooltipContent, {
      permanent: true,
      direction: "center",
      className: "tooltip-province-name tooltip-no-label",
    });
  }

  function onEachFeatureSchools(feature, layer) {
    let schoolName = feature.properties.school_name + " school";
    let schoolRegion = feature.properties.region;
    let numberStudents = feature.properties.number_students;
    let deanName = feature.properties.dean_name;
    let dateLaunched = feature.properties.date_launched;
    let launchedBy = feature.properties.launched_by;

    let popupContent = '<p class="popup-title">' + schoolName + "</p>";

    if (deanName) {
      popupContent += '<p class="popup-text">Dean Name: ' + deanName + "</p>";
    }

    if (numberStudents) {
      popupContent +=
        '<p class="popup-text">Students: ' + numberStudents + "</p>";
    }

    layer.bindPopup(popupContent, {});
  }

  function onEachFeatureCitiesMain(feature, layer) {
    let tooltipContent = feature.properties.name;
    layer.bindTooltip(tooltipContent, {
      permanent: true,
      direction: feature.properties.position,
      className: "tooltip-city-name-main",
    });
  }

  function onEachFeatureCitiesSecondary(feature, layer) {
    let tooltipContent = feature.properties.name;
    layer.bindTooltip(tooltipContent, {
      permanent: true,
      direction: feature.properties.position,
      className: "tooltip-city-name-secondary",
    });
  }

  function onEachFeatureCountryNames(feature, layer) {
    let tooltipContent =
      '<p class="tooltip-country-name tooltip-no-label">' + feature.properties.name + "</p>";

    layer.bindTooltip(tooltipContent, {
      permanent: true,
      direction: 'center',
      className: "tooltip-country-name tooltip-no-label",
    });
  }

  layerProvinces = L.geoJSON(geojsonProvinces, {
    style: styleProvince,
  }).addTo(map);

  layerProvinceCentroids = L.geoJson(geojsonProvinceCentroids, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, circleMarkerProvinceCentroids);
    },
    onEachFeature: onEachFeatureProvinceCentroids,
  }).addTo(map);

  let layerRivers = L.geoJSON(geojsonRivers, {
    style: styleRivers,
  }).addTo(map);

  let layerLakes = L.geoJSON(geojsonLakes, {
    style: styleLakes,
  }).addTo(map);

  let layerRoads = L.geoJSON(geojsonRoads, {
    style: styleRoads,
  }).addTo(map);

  let layerRailRoads = L.geoJSON(geojsonRailroads, {
    style: styleRailroads,
  }).addTo(map);

  let layerRailRoadsTransversal = L.geoJSON(geojsonRailroads, {
    style: styleRailroadsTransversal,
  }).addTo(map);

  let layerCountries = L.geoJSON(geojsonCountries, {
    style: styleCountry,
  }).addTo(map);


  let layerCitiesSecondary = L.geoJson(geojsonCitiesSecondary, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, circlemarkerCitiesSecondary);
    },
    onEachFeature: onEachFeatureCitiesSecondary,
  }).addTo(map);

  let layerCitiesMain = L.geoJson(geojsonCities, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, circlemarkerCitiesMain);
    },
    onEachFeature: onEachFeatureCitiesMain,
  }).addTo(map);

  let layerCountryNames = L.geoJson(geojsonCountryNames, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        color: "#000000",
        fillColor: "#000000",
        fillOpacity: 0,
        opacity: 0,
        radius: 1,
        weight: 1,
      });
    },
    onEachFeature: onEachFeatureCountryNames,
  }).addTo(map);

  layerSchools = L.geoJson(geojsonSchools, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, { icon: iconSchool });
    },
    onEachFeature: onEachFeatureSchools,
  }).addTo(map);
}
