<template>
  <div class="flex flex-col h-full">
    <DateSelector :days="days" :currentDayIndex="currentDayIndex" @select-day="selectDay" />
    <div class="flex-1 relative z-0">
      <div ref="mapContainer" class="absolute inset-0 w-full h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { useTripStore } from '../stores/trip.ts'
import { storeToRefs } from 'pinia'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DateSelector from '../components/DateSelector.vue'

const store = useTripStore()
const { days } = storeToRefs(store)

const currentDayIndex = ref(0)
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markers: L.Marker[] = []
let polyline: L.Polyline | null = null

const initMap = () => {
  if (!mapContainer.value) return
  
  // Default to Fukuoka
  map = L.map(mapContainer.value).setView([33.5902, 130.4207], 13)
  
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)
  
  updateMap()
}

const updateMap = () => {
  if (!map) return
  
  // Clear existing
  markers.forEach(m => map!.removeLayer(m))
  markers = []
  if (polyline) map.removeLayer(polyline)
  
  const currentDay = days.value[currentDayIndex.value]
  if (!currentDay || !currentDay.events) return
  
  const latlngs: L.LatLngExpression[] = []
  
  currentDay.events.forEach((event, idx) => {
    if (event.lat && event.lng) {
      const latlng: L.LatLngExpression = [event.lat, event.lng]
      latlngs.push(latlng)
      
      const iconHtml = `<div class="custom-pin text-jp-dark font-bold text-xs">${idx + 1}</div>`
      const icon = L.divIcon({
        className: 'custom-pin-container',
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })
      
      const marker = L.marker(latlng, { icon }).addTo(map!)
        .bindPopup(`<b>${event.time} ${event.title}</b><br>${event.location}`)
      
      markers.push(marker)
    }
  })
  
  if (latlngs.length > 0) {
    polyline = L.polyline(latlngs, { color: '#E6B422', weight: 3, dashArray: '5, 10', opacity: 0.7 }).addTo(map)
    map.fitBounds(L.latLngBounds(latlngs).pad(0.2))
  }
}

const selectDay = (index: number) => {
  currentDayIndex.value = index
  nextTick(() => {
    // Invalidate size in case tab switching caused layout issues
    if (map) map.invalidateSize()
    updateMap()
  })
}

onMounted(() => {
  store.loadData()
  nextTick(() => initMap())
})

watch(currentDayIndex, () => {
  updateMap()
})
</script>

<style>
/* Leaflet Custom Styles */
.custom-pin-container {
    background: transparent;
    border: none;
}
</style>
