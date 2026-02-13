<script setup>
import { MapboxMap, MapboxMarker } from "@studiometa/vue-mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ref } from "vue";

const { getLocations } = useLocationsQuery();
const { locations, loading } = await getLocations();

const runtimeConfig = useRuntimeConfig();
const mapboxToken = runtimeConfig.public.MAPBOX_TOKEN;

const mapCenter = ref([-95.7129, 37.0902]);

function schoolLocationLatLong(schoolLocation) {

  // School locations often do not have a 'geoAddress' or 'features' with a Lat/Long center point.
  const geoAddress = schoolLocation?.geoAddress;
  const addressFeatures = geoAddress?.features;

  if (addressFeatures?.length > 0 && addressFeatures[0]?.center) {
    // Return the Lat/Long location if the school if it exists
    return schoolLocation.geoAddress.features[0].center
  }

  // When there is no Lat/Long, return a random Lat/Long location off the gulf coast of florida
  const randomLat = 28.0 + Math.random()
  const randomLong = -83.0 - Math.random()
  return [randomLong, randomLat]
}
</script>
<template>
  <div>
    <div v-if="loading">
      loading map ...
    </div>
    <div v-else>
      <MapboxMap style="height: 800px;" :access-token="mapboxToken" map-style="mapbox://styles/mapbox/streets-v11"
        :center="mapCenter" :zoom="4">
        <MapboxMarker v-for="location in locations" :key="location.id" popup :lng-lat="schoolLocationLatLong(location)">
          <template #popup>
            <div>
              <h3>
                <RouterLink :to="'/locations/' + location.id" class="text-blue-500 underline">
                  {{ location.name }}
                </RouterLink>
              </h3>
              <p>{{ location.address }}</p>
            </div>
          </template>
        </MapboxMarker>
      </MapboxMap>
    </div>
  </div>
</template>
