import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import mapStyles from "./map-styles";

// const sourceData = "./gundata.json";

let sourceData;
fetch("./gundata.json")
  .then((response) => response.json())
  .then((data) => {
    sourceData = data;

    // Call initMap after fetching and parsing data
    window.initMap();
  })
  .catch((error) => console.error("Error fetching data:", error));

let filteredDataSchool = [];
let filteredDataSuicide = [];
document.addEventListener("DOMContentLoaded", () => {
  const schoolShootingCheckbox = document.getElementById("school-shooting");
  const suicideCheckbox = document.getElementById("suicide");

  const handleCheckboxChange = () => {
    const isSchoolShootingChecked = schoolShootingCheckbox.checked;

    const isSuicideChecked = suicideCheckbox.checked;

    filteredDataSchool = isSchoolShootingChecked
      ? sourceData.filter(
          (d) =>
            d.categories &&
            typeof d.categories === "string" &&
            (d.categories.toLowerCase().includes("school") ||
              d.categories.toLowerCase().includes("student"))
        )
      : [];

    filteredDataSuicide = isSuicideChecked
      ? sourceData.filter(
          (d) =>
            d.categories &&
            typeof d.categories === "string" &&
            d.categories.toLowerCase().includes("suicide")
        )
      : [];

    overlay.setProps({
      layers: [scatterplot(), heatmap(), hexagon()],
    });
  };

  schoolShootingCheckbox.addEventListener("change", handleCheckboxChange);
  suicideCheckbox.addEventListener("change", handleCheckboxChange);
});

const scatterplot = () =>
  new ScatterplotLayer({
    id: "scatter",
    data:
      filteredDataSchool.length > 0 || filteredDataSuicide.length > 0
        ? [...filteredDataSchool, ...filteredDataSuicide]
        : sourceData,

    opacity: 0.8,
    filled: true,
    radiusMinPixels: 2,
    radiusMaxPixels: 5,
    getPosition: (d) => [d.longitude, d.latitude],
    getFillColor: (d) =>
      d.n_killed > 0 ? [200, 0, 40, 150] : [255, 140, 0, 100],

    pickable: true,
    onHover: ({ object, x, y }) => {
      const el = document.getElementById("tooltip");
      if (object) {
        const { n_killed, n_injured, date, notes } = object;

        el.innerHTML = `<h1>Date: ${date}</h1>
          <p>${n_killed === 0 ? "" : `${n_killed} dead`} ${
          n_injured === 0 ? "" : `${n_injured} injured`
        }</p>

          <p>${notes === 0 ? "No additional note given." : notes}</p>
          `;
        el.style.display = "block";
        el.style.opacity = 0.9;
        el.style.left = x + "px";
        el.style.top = y + "px";
      } else {
        el.style.opacity = 0.0;
      }
    },

    onClick: ({ object, x, y }) => {
      window.open(
        `https://www.gunviolencearchive.org/incident/${object.incident_id}`
      );
    },
  });

const heatmap = () =>
  new HeatmapLayer({
    id: "heat",
    data:
      filteredDataSchool.length > 0 || filteredDataSuicide.length > 0
        ? [...filteredDataSchool, ...filteredDataSuicide]
        : sourceData,

    getPosition: (d) => [d.longitude, d.latitude],
    getWeight: (d) => d.n_killed + d.n_injured * 0.5,
    radiusPixels: 60,
  });

const hexagon = () =>
  new HexagonLayer({
    id: "hex",

    data:
      filteredDataSchool.length > 0 || filteredDataSuicide.length > 0
        ? [...filteredDataSchool, ...filteredDataSuicide]
        : sourceData,

    getPosition: (d) => [d.longitude, d.latitude],
    getElevationWeight: (d) => d.n_killed * 2 + d.n_injured,
    elevationScale: 100,
    extruded: true,
    radius: 1000,
    opacity: 0.6,
    coverage: 0.88,
    lowerPercentile: 50,
  });

let overlay; // Declare overlay here
let geocoder;
let map;

window.initMap = () => {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 38.0, lng: -95.0 },
    zoom: 5,
    styles: mapStyles,
  });

  geocoder = new google.maps.Geocoder();

  overlay = new GoogleMapsOverlay({
    layers: [scatterplot(), heatmap(), hexagon()],
  });

  overlay.setMap(map);
};

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn");

  function searchLocation() {
    const searchInput = document.getElementById("search-input").value;

    // Use the geocoder to get the location details
    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const location = results[0].geometry.location;

        map.panTo(location);
        map.setZoom(10, { animation: google.maps.Animation.DROP });
      } else {
        console.error(
          "Geocode was not successful for the following reason: " + status
        );
      }
    });
  }
  searchBtn.addEventListener("click", searchLocation);
});

//tour
document.addEventListener("DOMContentLoaded", () => {
  const startTourBtn = document.getElementById("start-tour-btn");

  // Handle "Tour Start" button click
  startTourBtn.addEventListener("click", () => {
    // Show the modal
    document.getElementById("modal-1").style.display = "block";
    document.getElementById("modal-content").style.display = "none";

    // Zoom to
    const flCoords = { lat: 27.9944026, lng: -81.7602549 };

    map.panTo(flCoords);
    map.setZoom(8, { animation: google.maps.Animation.BOUNCE });
  });

  // Handle modal close button click
  const closeModalBtn = document.getElementById("close-modal-btn");
  closeModalBtn.addEventListener("click", () => {
    // Hide the modal
    document.getElementById("modal-content").style.display = "none";
  });

  function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
  }

  function transitionToNextModal(currentModalId, nextModalId, nextCoords) {
    closeModal(currentModalId);
    document.getElementById(nextModalId).style.display = "block";

    // Zoom to the specified coordinates
    map.panTo(nextCoords);
    map.setZoom(10, { animation: google.maps.Animation.BOUNCE });
  }
  function exitExplore() {
    closeModal("modal-4");
    location.reload();
  }

  // Add event listeners for closing modals
  const closeModal1 = document.getElementById("modal-close-1");
  closeModal1.addEventListener("click", () => closeModal("modal-1"));

  const closeModal2 = document.getElementById("modal-close-2");
  closeModal2.addEventListener("click", () => closeModal("modal-2"));

  const closeModal3 = document.getElementById("modal-close-3");
  closeModal3.addEventListener("click", () => closeModal("modal-3"));
  const closeModal4 = document.getElementById("modal-close-4");
  closeModal4.addEventListener("click", () => closeModal("modal-4"));

  const closeModalFinal = document.getElementById("next-4");
  closeModalFinal.addEventListener("click", () => exitExplore());

  // Add event listeners for transitioning to the next modals
  const nextModal1 = document.getElementById("next-1");
  nextModal1.addEventListener("click", () =>
    transitionToNextModal("modal-1", "modal-2", {
      lat: 36.7783,
      lng: -119.4179,
    })
  );

  const nextModal2 = document.getElementById("next-2");
  nextModal2.addEventListener("click", () =>
    transitionToNextModal("modal-2", "modal-3", { lat: 41.8781, lng: -87.6298 })
  );

  const nextModal3 = document.getElementById("next-3");
  nextModal3.addEventListener("click", () => {
    transitionToNextModal("modal-3", "modal-4", {
      lat: 37.7749,
      lng: -122.4194,
    });
    explore();
  });
});

// Define the coordinates for the west and east coast
const westCoastCoords = { lat: 37.7749, lng: -122.4194 }; // San Francisco, CA
const eastCoastCoords = { lat: 40.7128, lng: -74.006 }; // New York, NY

// Function to explore from west to east
function explore() {
  // Initial position at the west coast
  let currentCoords = { ...westCoastCoords };

  // Set an interval to move to the next location every 5 seconds
  const exploreInterval = setInterval(() => {
    // Pan to the current coordinates
    map.panTo(currentCoords);
    map.setZoom(5.5, { animation: google.maps.Animation.BOUNCE });

    // Check if the current coordinates are close to the east coast
    if (
      currentCoords.lat <= eastCoastCoords.lat &&
      currentCoords.lng >= eastCoastCoords.lng
    ) {
      clearInterval(exploreInterval); // Stop exploring when reaching the east coast
    } else {
      // Incrementally move eastward
      currentCoords.lng += 0.3; // You can adjust the increment value for a slower or faster exploration
    }
  }, 100); // Move to the next location every 5 seconds
}
