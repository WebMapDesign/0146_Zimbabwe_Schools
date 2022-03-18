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
    zoomSnap: 1,
    minZoom: 7,
    maxZoom: 10,
    maxBounds: mapBounds,
  }).setView([-19.1, 29.2], 7);

  L.easyButton(
    '<span class="star" style="padding:0px;">&starf;</span>',

    function (btn, map) {
      map.setView([-19.1, 29.2], 7);
    },
    "Default View"
  ).addTo(map);

  let layerProvinces;
  let layerProvinceCentroids;
  let layerCountry;
  let layerCities;

  function styleCountry(feature) {
    return {
      color: "#000000",
      fillColor: "#ffffff",
      fillOpacity: 0,
      opacity: 1,
      weight: 2,
    };
  }

  let circleMarkerCities = {
    color: "#ffffff",
    fillColor: "#000000",
    fillOpacity: 1,
    opacity: 1,
    radius: 6,
    weight: 3,
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
    iconUrl: "images/school_icon.png",
    iconSize: [30, 28],
    popupAnchor: [0, -15],
  });

  const colorsProvinces = {
    Bulawayo: "#AADAFF",
    Harare: "#C3ECB2",
    Manicaland: "#C3ECB2",
    "Mashonaland Central": "#FFF2AF",
    "Mashonaland East": "#F6B7CA",
    "Mashonaland West": "#AADAFF",
    Masvingo: "#AADAFF",
    "Matabeleland North": "#F6B7CA",
    "Matabeleland South": "#C3ECB2",
    Midlands: "#FFF2AF",
  };

  function styleProvince(feature) {
    return {
      color: "#000000",
      fillColor: colorsProvinces[feature.properties.ADM1_EN],
      fillOpacity: 0.5,
      opacity: 1,
      weight: 1,
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

  function onEachFeatureProvinces(feature, layer) {
    let popupContent =
      '<p class="popup-title">' + feature.properties.ADM1_EN + "</p>";

    layer.bindPopup(popupContent, {});
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlightProvinces,
    });
  }

  function onEachFeatureProvinceCentroids(feature, layer) {
    let tooltipContent = feature.properties.ADM1_EN;
    layer.bindTooltip(tooltipContent, {
      permanent: true,
      direction: "center",
      className: "tooltip-province-name",
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

    if (schoolRegion) {
      popupContent +=
        '<p class="popup-text">Province: ' + schoolRegion + "</p>";
    }

    if (numberStudents) {
      popupContent +=
        '<p class="popup-text">Students: ' + numberStudents + "</p>";
    }

    layer.bindPopup(popupContent, {});
  }

  function onEachFeatureCities(feature, layer) {
    let tooltipContent = feature.properties.name;
    layer.bindTooltip(tooltipContent, {
      permanent: true,
      direction: "left",
      className: "tooltip-city-name",
    });
  }

  layerProvinces = L.geoJSON(geojsonProvinces, {
    style: styleProvince,
    // onEachFeature: onEachFeatureProvinces,
  }).addTo(map);

  layerProvinceCentroids = L.geoJson(geojsonProvinceCentroids, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, circleMarkerProvinceCentroids);
    },
    onEachFeature: onEachFeatureProvinceCentroids,
  }).addTo(map);

  layerCountry = L.geoJSON(geojsonCountry, {
    style: styleCountry,
  }).addTo(map);

  layerCities = L.geoJson(geojsonCities, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, circleMarkerCities);
    },
    onEachFeature: onEachFeatureCities,
  }).addTo(map);

  layerSchools = L.geoJson(geojsonSchools, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, { icon: iconSchool });
    },
    onEachFeature: onEachFeatureSchools,
  }).addTo(map);

  let baseLayers = {};

  let overlays = {
    Schools: layerSchools,
    Cities: layerCities,
  };

  L.control
    .layers(baseLayers, overlays, { collapsed: false, position: "topright" })
    .addTo(map);
}
