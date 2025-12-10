<template>
  <div class="fixed inset-0 bg-black z-50 flex flex-col">
    <!-- Camera View -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Video Element -->
      <video
        ref="videoRef"
        autoplay
        playsinline
        muted
        class="absolute inset-0 w-full h-full object-cover"
        :class="{ 'scale-x-[-1]': isFrontCamera }"
      ></video>

      <!-- Canvas for Pose Detection (Portrait Mode) -->
      <canvas
        ref="canvasRef"
        class="absolute inset-0 w-full h-full pointer-events-none"
        :class="{ 'scale-x-[-1]': isFrontCamera }"
      ></canvas>

      <!-- Grid Overlay (Rule of Thirds) - Always visible in Landscape mode -->
      <div v-if="showGrid || currentMode === 'landscape'" class="absolute inset-0 pointer-events-none">
        <div class="absolute left-1/3 top-0 bottom-0 w-px bg-white/40"></div>
        <div class="absolute left-2/3 top-0 bottom-0 w-px bg-white/40"></div>
        <div class="absolute top-1/3 left-0 right-0 h-px bg-white/40"></div>
        <div class="absolute top-2/3 left-0 right-0 h-px bg-white/40"></div>
        <!-- Intersection Points -->
        <div 
          v-for="point in intersectionPoints" 
          :key="point.id"
          class="absolute w-4 h-4 -ml-2 -mt-2 border-2 rounded-full transition-colors"
          :class="focusPointId === point.id ? 'border-green-400 bg-green-400/30' : 'border-white/60'"
          :style="{ left: point.left, top: point.top }"
        ></div>
      </div>

      <!-- Landscape Mode: Smart Horizon Level -->
      <div v-if="currentMode === 'landscape'" class="absolute inset-0 pointer-events-none flex items-center justify-center">
        <!-- Horizon Line -->
        <div 
          class="w-64 h-1 rounded-full transition-all duration-100"
          :class="isLevelPerfect ? 'bg-green-400 h-1.5' : 'bg-white/60'"
          :style="{ transform: `rotate(${-deviceGamma}deg)` }"
        ></div>
        <!-- Level Indicator -->
        <div 
          class="absolute top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold transition-colors"
          :class="isLevelPerfect ? 'bg-green-500 text-white' : 'bg-black/50 text-white/80'"
        >
          <font-awesome-icon :icon="isLevelPerfect ? 'fa-solid fa-check' : 'fa-solid fa-arrows-left-right'" class="mr-2" />
          {{ isLevelPerfect ? '水平完美！' : `${Math.abs(deviceGamma).toFixed(1)}°` }}
        </div>
      </div>

      <!-- Landscape Mode: Focus Point Guide -->
      <div 
        v-if="currentMode === 'landscape' && focusPoint" 
        class="absolute pointer-events-none"
        :style="{ left: focusPoint.x + 'px', top: focusPoint.y + 'px' }"
      >
        <!-- Crosshair -->
        <div class="w-12 h-12 -ml-6 -mt-6 border-2 border-yellow-400 rounded-full flex items-center justify-center">
          <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
        </div>
        <!-- Direction Arrow -->
        <div 
          v-if="focusDirection"
          class="absolute top-1/2 -translate-y-1/2 text-yellow-400 text-xl animate-pulse"
          :class="focusDirection === 'left' ? '-left-8' : focusDirection === 'right' ? '-right-8' : focusDirection === 'up' ? '-top-8 left-1/2 -translate-x-1/2' : '-bottom-8 left-1/2 -translate-x-1/2'"
        >
          <font-awesome-icon :icon="focusDirectionIcon" />
        </div>
      </div>

      <!-- Vlog Mode: Ghost Box Training -->
      <div v-if="currentMode === 'vlog' && isVlogTraining" class="absolute inset-0 pointer-events-none">
        <!-- Center Frame (Current) -->
        <div 
          class="absolute w-32 h-24 border-4 rounded-lg transition-colors"
          :class="vlogSpeedWarning ? 'border-red-500' : vlogStabilityWarning ? 'border-yellow-500' : 'border-white'"
          :style="{ 
            left: 'calc(50% - 64px)', 
            top: 'calc(50% - 48px)',
            transform: `translateX(${-vlogProgress * 1.5}px)`
          }"
        ></div>
        <!-- Ghost Box (Target) -->
        <div 
          class="absolute w-32 h-24 border-2 border-dashed border-white/50 rounded-lg"
          :style="{ 
            left: `calc(50% - 64px + ${ghostBoxOffset}px)`, 
            top: 'calc(50% - 48px)' 
          }"
        ></div>
        <!-- Progress Bar -->
        <div class="absolute bottom-32 left-8 right-8">
          <div class="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              class="h-full rounded-full transition-all bg-gradient-to-r from-green-400 to-blue-500"
              :style="{ width: `${vlogProgress}%` }"
            ></div>
          </div>
          <p class="text-center text-white text-sm mt-2">{{ currentVlogInstruction }}</p>
        </div>
        <!-- Warnings -->
        <div 
          v-if="vlogSpeedWarning || vlogStabilityWarning"
          class="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full font-bold text-sm animate-pulse"
          :class="vlogSpeedWarning ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'"
        >
          {{ vlogSpeedWarning ? '太快了！慢一點' : '保持穩定！' }}
        </div>
      </div>

      <!-- Portrait Mode: Pose Detection Status -->
      <div 
        v-if="currentMode === 'portrait' && poseEnabled && poseStatus" 
        class="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2"
      >
        <span class="w-2 h-2 rounded-full animate-pulse" :class="poseDetected ? 'bg-green-400' : 'bg-yellow-400'"></span>
        {{ poseStatus }}
      </div>

      <!-- Countdown Overlay -->
      <div 
        v-if="countdown > 0" 
        class="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none"
      >
        <div class="text-white text-9xl font-bold animate-pulse">{{ countdown }}</div>
      </div>

      <!-- Captured Image Preview -->
      <div 
        v-if="capturedImage" 
        class="absolute inset-4 bg-black rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
      >
        <img :src="capturedImage" class="w-full h-full object-contain" />
        <div class="absolute bottom-4 left-4 right-4 flex gap-2">
          <button 
            @click="downloadImage"
            class="flex-1 bg-white text-jp-dark py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <font-awesome-icon icon="fa-solid fa-download" />
            儲存
          </button>
          <button 
            @click="capturedImage = null"
            class="flex-1 bg-white/20 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
            取消
          </button>
        </div>
      </div>

      <!-- Touch Handler for Landscape Focus Point -->
      <div 
        v-if="currentMode === 'landscape'"
        class="absolute inset-0 z-10"
        @click="setFocusPoint"
      ></div>
    </div>

    <!-- Mode Switcher -->
    <div class="bg-black/80 py-3 px-4">
      <div class="flex justify-center gap-2">
        <button
          v-for="mode in modes"
          :key="mode.id"
          @click="switchMode(mode.id)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
          :class="currentMode === mode.id 
            ? 'bg-white text-black' 
            : 'bg-white/10 text-white/70 hover:bg-white/20'"
        >
          <font-awesome-icon :icon="mode.icon" class="mr-1.5" />
          {{ mode.label }}
        </button>
      </div>
    </div>

    <!-- Control Bar -->
    <div class="bg-black pb-safe pt-4 px-6">
      <div class="flex items-center justify-between max-w-md mx-auto">
        <!-- Back Button -->
        <button @click="goBack" class="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center">
          <font-awesome-icon icon="fa-solid fa-arrow-left" />
        </button>

        <!-- Mode-specific Left Button -->
        <button 
          v-if="currentMode === 'portrait'"
          @click="showGrid = !showGrid" 
          class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          :class="showGrid ? 'bg-white text-black' : 'bg-white/10 text-white'"
        >
          <font-awesome-icon icon="fa-solid fa-border-all" />
        </button>
        <button 
          v-else-if="currentMode === 'vlog' && !isVlogTraining"
          @click="showVlogMenu = true" 
          class="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
        >
          <font-awesome-icon icon="fa-solid fa-list" />
        </button>
        <div v-else class="w-10 h-10"></div>

        <!-- Capture / Action Button -->
        <button 
          v-if="currentMode !== 'vlog' || !isVlogTraining"
          @click="currentMode === 'vlog' ? startVlogTraining(selectedVlogMove) : capturePhoto()"
          :disabled="!cameraReady || (currentMode === 'vlog' && !selectedVlogMove)"
          class="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          :class="currentMode === 'vlog' ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-white'"
        >
          <div v-if="currentMode === 'vlog'" class="text-white font-bold text-sm">
            <font-awesome-icon icon="fa-solid fa-play" class="text-2xl" />
          </div>
          <div v-else class="w-16 h-16 rounded-full border-4 border-black"></div>
        </button>
        <button 
          v-else
          @click="stopVlogTraining"
          class="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
        >
          <font-awesome-icon icon="fa-solid fa-stop" class="text-white text-2xl" />
        </button>

        <!-- Mode-specific Right Button -->
        <button 
          v-if="currentMode === 'portrait'"
          @click="togglePoseDetection" 
          class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          :class="poseEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-white'"
        >
          <font-awesome-icon icon="fa-solid fa-person-running" />
        </button>
        <button 
          v-else-if="currentMode === 'landscape'"
          @click="requestOrientationPermission" 
          class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          :class="orientationEnabled ? 'bg-green-500 text-white' : 'bg-white/10 text-white'"
        >
          <font-awesome-icon icon="fa-solid fa-compass" />
        </button>
        <div v-else class="w-10 h-10"></div>

        <!-- Switch Camera -->
        <button @click="switchCamera" class="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center">
          <font-awesome-icon icon="fa-solid fa-camera-rotate" />
        </button>
      </div>

      <!-- Mode Hints -->
      <p v-if="currentMode === 'portrait' && poseEnabled" class="text-center text-white/60 text-xs mt-3">
        <font-awesome-icon icon="fa-solid fa-hand" class="mr-1" />
        舉起雙手超過頭部即可自動拍照
      </p>
      <p v-else-if="currentMode === 'landscape'" class="text-center text-white/60 text-xs mt-3">
        <font-awesome-icon icon="fa-solid fa-crosshairs" class="mr-1" />
        點擊畫面設定焦點，水平儀會引導構圖
      </p>
      <p v-else-if="currentMode === 'vlog' && !isVlogTraining" class="text-center text-white/60 text-xs mt-3">
        <font-awesome-icon icon="fa-solid fa-film" class="mr-1" />
        選擇運鏡類型後按下播放開始練習
      </p>
    </div>

    <!-- Vlog Move Selection Menu -->
    <Transition name="slide-up">
      <div 
        v-if="showVlogMenu" 
        class="fixed inset-0 z-[60] flex items-end justify-center"
        @click.self="showVlogMenu = false"
      >
        <div class="absolute inset-0 bg-black/50" @click="showVlogMenu = false"></div>
        <div class="relative bg-gray-900 rounded-t-3xl w-full max-w-md p-6 pb-safe">
          <h3 class="text-white font-bold text-lg mb-4">選擇運鏡練習</h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="move in vlogMoves"
              :key="move.id"
              @click="selectVlogMove(move)"
              class="p-4 rounded-xl text-left transition-all"
              :class="selectedVlogMove?.id === move.id 
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20'"
            >
              <font-awesome-icon :icon="move.icon" class="text-2xl mb-2" />
              <p class="font-bold">{{ move.label }}</p>
              <p class="text-xs opacity-70">{{ move.desc }}</p>
            </button>
          </div>
          <button 
            @click="showVlogMenu = false"
            class="w-full mt-4 py-3 rounded-xl bg-white/10 text-white font-medium"
          >
            取消
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'

const router = useRouter()
const route = useRoute()

// ========== Types ==========
type CameraMode = 'portrait' | 'landscape' | 'vlog'

interface VlogMove {
  id: string
  label: string
  desc: string
  icon: string
  targetAngle: number
  duration: number
  direction: 'alpha' | 'beta' | 'gamma'
}

// ========== Mode Definitions ==========
const modes = [
  { id: 'portrait' as CameraMode, label: '人像', icon: 'fa-solid fa-user' },
  { id: 'landscape' as CameraMode, label: '風景', icon: 'fa-solid fa-mountain-sun' },
  { id: 'vlog' as CameraMode, label: '運鏡', icon: 'fa-solid fa-video' }
]

const vlogMoves: VlogMove[] = [
  { id: 'pan-right', label: '向右平移', desc: 'Pan Right', icon: 'fa-solid fa-arrow-right', targetAngle: 45, duration: 5, direction: 'alpha' },
  { id: 'pan-left', label: '向左平移', desc: 'Pan Left', icon: 'fa-solid fa-arrow-left', targetAngle: -45, duration: 5, direction: 'alpha' },
  { id: 'tilt-up', label: '向上仰拍', desc: 'Tilt Up', icon: 'fa-solid fa-arrow-up', targetAngle: -30, duration: 3, direction: 'beta' },
  { id: 'tilt-down', label: '向下俯拍', desc: 'Tilt Down', icon: 'fa-solid fa-arrow-down', targetAngle: 30, duration: 3, direction: 'beta' }
]

const intersectionPoints = [
  { id: 'tl', left: '33.33%', top: '33.33%' },
  { id: 'tr', left: '66.66%', top: '33.33%' },
  { id: 'bl', left: '33.33%', top: '66.66%' },
  { id: 'br', left: '66.66%', top: '66.66%' }
]

// ========== Refs ==========
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// ========== State ==========
const currentMode = ref<CameraMode>('portrait')
const cameraReady = ref(false)
const isFrontCamera = ref(true)
const showGrid = ref(true)
const countdown = ref(0)
const capturedImage = ref<string | null>(null)

// Portrait Mode State
const poseEnabled = ref(false)
const poseStatus = ref('')
const poseDetected = ref(false)

// Landscape Mode State
const orientationEnabled = ref(false)
const deviceAlpha = ref(0)
const deviceBeta = ref(0)
const deviceGamma = ref(0)
const focusPoint = ref<{ x: number; y: number } | null>(null)
const focusPointId = ref<string | null>(null)
const focusDirection = ref<'left' | 'right' | 'up' | 'down' | null>(null)

// Vlog Mode State
const showVlogMenu = ref(false)
const selectedVlogMove = ref<VlogMove | null>(null)
const isVlogTraining = ref(false)
const vlogStartAngle = ref(0)
const vlogProgress = ref(0)
const vlogSpeedWarning = ref(false)
const vlogStabilityWarning = ref(false)
const ghostBoxOffset = ref(0)
let lastAngle = 0
let angleHistory: number[] = []

// MediaPipe
let poseLandmarker: PoseLandmarker | null = null
let animationFrameId: number | null = null
let lastVideoTime = -1
let stream: MediaStream | null = null
let vlogAnimationId: number | null = null

// ========== Computed ==========
const isLevelPerfect = computed(() => Math.abs(deviceGamma.value) < 1)

const currentVlogInstruction = computed(() => {
  if (!selectedVlogMove.value) return ''
  return `${selectedVlogMove.value.label} - 進度 ${Math.round(vlogProgress.value)}%`
})

const focusDirectionIcon = computed(() => {
  switch (focusDirection.value) {
    case 'left': return 'fa-solid fa-arrow-left'
    case 'right': return 'fa-solid fa-arrow-right'
    case 'up': return 'fa-solid fa-arrow-up'
    case 'down': return 'fa-solid fa-arrow-down'
    default: return ''
  }
})

// ========== Mode Switching ==========
const switchMode = (mode: CameraMode) => {
  // Cleanup previous mode
  if (currentMode.value === 'portrait') {
    stopPoseDetection()
    poseEnabled.value = false
  }
  if (currentMode.value === 'vlog') {
    stopVlogTraining()
  }
  
  currentMode.value = mode
  
  // Initialize new mode
  if (mode === 'landscape') {
    requestOrientationPermission()
  }
}

// ========== Camera Functions ==========
const goBack = () => {
  router.back()
}

const startCamera = async () => {
  try {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: isFrontCamera.value ? 'user' : 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints)
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      
      videoRef.value.onloadedmetadata = () => {
        if (canvasRef.value && videoRef.value) {
          canvasRef.value.width = videoRef.value.videoWidth
          canvasRef.value.height = videoRef.value.videoHeight
        }
        cameraReady.value = true
      }
    }
  } catch (err) {
    console.error('Camera error:', err)
    poseStatus.value = '無法存取相機'
  }
}

const switchCamera = () => {
  isFrontCamera.value = !isFrontCamera.value
  startCamera()
}

const capturePhoto = () => {
  if (!videoRef.value || !cameraReady.value) return

  const video = videoRef.value
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = video.videoWidth
  tempCanvas.height = video.videoHeight

  const ctx = tempCanvas.getContext('2d')
  if (!ctx) return

  if (isFrontCamera.value) {
    ctx.translate(tempCanvas.width, 0)
    ctx.scale(-1, 1)
  }

  ctx.drawImage(video, 0, 0)
  capturedImage.value = tempCanvas.toDataURL('image/png')
  
  // Haptic feedback
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
}

const downloadImage = () => {
  if (!capturedImage.value) return

  const link = document.createElement('a')
  link.href = capturedImage.value
  link.download = `travel_photo_${Date.now()}.png`
  link.click()
  
  capturedImage.value = null
}

const triggerCountdown = () => {
  countdown.value = 3
  
  const countdownInterval = setInterval(() => {
    countdown.value--
    
    if (countdown.value === 0) {
      clearInterval(countdownInterval)
      capturePhoto()
    }
  }, 1000)
}

// ========== Portrait Mode: Pose Detection ==========
const initPoseLandmarker = async () => {
  try {
    poseStatus.value = '載入 AI 模型中...'
    
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
    
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numPoses: 1
    })

    poseStatus.value = '偵測中'
    startPoseDetection()
  } catch (err) {
    console.error('Pose Landmarker init error:', err)
    poseStatus.value = '模型載入失敗'
    poseEnabled.value = false
  }
}

const startPoseDetection = () => {
  if (!poseLandmarker || !videoRef.value || !canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const drawingUtils = new DrawingUtils(ctx)

  const detectLoop = () => {
    if (!videoRef.value || !poseLandmarker || currentMode.value !== 'portrait') return

    const video = videoRef.value
    const startTimeMs = performance.now()

    if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
      lastVideoTime = video.currentTime

      const results = poseLandmarker.detectForVideo(video, startTimeMs)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (results.landmarks && results.landmarks.length > 0) {
        poseDetected.value = true
        const landmarks = results.landmarks[0]

        drawingUtils.drawLandmarks(landmarks, {
          radius: 3,
          color: '#00FF00',
          fillColor: '#00FF00'
        })
        drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        })

        const nose = landmarks[0]
        const leftWrist = landmarks[15]
        const rightWrist = landmarks[16]

        if (leftWrist && rightWrist && nose) {
          const handsUp = leftWrist.y < nose.y && rightWrist.y < nose.y
          
          if (handsUp && countdown.value === 0 && !capturedImage.value) {
            poseStatus.value = '雙手舉高！準備拍照...'
            triggerCountdown()
          }
        }
      } else {
        poseDetected.value = false
      }
    }

    animationFrameId = requestAnimationFrame(detectLoop)
  }

  detectLoop()
}

const stopPoseDetection = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
  }
  
  poseDetected.value = false
  poseStatus.value = ''
}

const togglePoseDetection = () => {
  poseEnabled.value = !poseEnabled.value
  
  if (poseEnabled.value) {
    initPoseLandmarker()
  } else {
    stopPoseDetection()
  }
}

// ========== Landscape Mode: Orientation ==========
const handleOrientation = (e: DeviceOrientationEvent) => {
  deviceAlpha.value = e.alpha ?? 0
  deviceBeta.value = e.beta ?? 0
  deviceGamma.value = e.gamma ?? 0
  
  // Haptic feedback when level is perfect
  if (isLevelPerfect.value && Math.abs(deviceGamma.value) < 0.5) {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  }
  
  // Update focus direction
  if (focusPoint.value) {
    updateFocusDirection()
  }
}

const requestOrientationPermission = async () => {
  try {
    // iOS 13+ requires permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const permission = await (DeviceOrientationEvent as any).requestPermission()
      if (permission === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation)
        orientationEnabled.value = true
      }
    } else {
      // Non-iOS or older iOS
      window.addEventListener('deviceorientation', handleOrientation)
      orientationEnabled.value = true
    }
  } catch (err) {
    console.error('Orientation permission error:', err)
  }
}

const setFocusPoint = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  
  focusPoint.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  
  // Find nearest intersection point
  const nearest = findNearestIntersection(focusPoint.value.x, focusPoint.value.y, rect.width, rect.height)
  focusPointId.value = nearest?.id ?? null
  
  updateFocusDirection()
}

const findNearestIntersection = (x: number, y: number, width: number, height: number) => {
  const points = [
    { id: 'tl', x: width * 0.333, y: height * 0.333 },
    { id: 'tr', x: width * 0.666, y: height * 0.333 },
    { id: 'bl', x: width * 0.333, y: height * 0.666 },
    { id: 'br', x: width * 0.666, y: height * 0.666 }
  ]
  
  let nearest = points[0]
  let minDist = Infinity
  
  points.forEach(p => {
    const dist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2)
    if (dist < minDist) {
      minDist = dist
      nearest = p
    }
  })
  
  return minDist < 100 ? nearest : null
}

const updateFocusDirection = () => {
  if (!focusPoint.value || !focusPointId.value) {
    focusDirection.value = null
    return
  }
  
  const video = videoRef.value
  if (!video) return
  
  const rect = video.getBoundingClientRect()
  const targetX = focusPointId.value.includes('r') ? rect.width * 0.666 : rect.width * 0.333
  const targetY = focusPointId.value.includes('b') ? rect.height * 0.666 : rect.height * 0.333
  
  const dx = targetX - focusPoint.value.x
  const dy = targetY - focusPoint.value.y
  
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
    focusDirection.value = null
    focusPointId.value = null
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50])
    }
  } else if (Math.abs(dx) > Math.abs(dy)) {
    focusDirection.value = dx > 0 ? 'right' : 'left'
  } else {
    focusDirection.value = dy > 0 ? 'down' : 'up'
  }
}

// ========== Vlog Mode: Training ==========
const selectVlogMove = (move: VlogMove) => {
  selectedVlogMove.value = move
  showVlogMenu.value = false
}

const startVlogTraining = (move: VlogMove | null) => {
  if (!move) return
  
  isVlogTraining.value = true
  vlogProgress.value = 0
  vlogSpeedWarning.value = false
  vlogStabilityWarning.value = false
  angleHistory = []
  
  // Get starting angle based on direction
  if (move.direction === 'alpha') {
    vlogStartAngle.value = deviceAlpha.value
  } else if (move.direction === 'beta') {
    vlogStartAngle.value = deviceBeta.value
  } else {
    vlogStartAngle.value = deviceGamma.value
  }
  lastAngle = vlogStartAngle.value
  
  // Request orientation permission if not already enabled
  if (!orientationEnabled.value) {
    requestOrientationPermission()
  }
  
  // Start animation loop
  const expectedSpeed = Math.abs(move.targetAngle) / move.duration / 60 // degrees per frame at 60fps
  let ghostProgress = 0
  
  const animate = () => {
    if (!isVlogTraining.value) return
    
    // Get current angle
    let currentAngle = 0
    if (move.direction === 'alpha') {
      currentAngle = deviceAlpha.value
    } else if (move.direction === 'beta') {
      currentAngle = deviceBeta.value
    } else {
      currentAngle = deviceGamma.value
    }
    
    // Calculate progress
    let diff = currentAngle - vlogStartAngle.value
    if (move.direction === 'alpha' && Math.abs(diff) > 180) {
      diff = diff > 0 ? diff - 360 : diff + 360
    }
    
    const targetAngle = move.targetAngle
    vlogProgress.value = Math.min(100, Math.max(0, (diff / targetAngle) * 100))
    
    // Check speed
    const angleDelta = Math.abs(currentAngle - lastAngle)
    angleHistory.push(angleDelta)
    if (angleHistory.length > 10) angleHistory.shift()
    
    const avgSpeed = angleHistory.reduce((a, b) => a + b, 0) / angleHistory.length
    vlogSpeedWarning.value = avgSpeed > expectedSpeed * 2.5
    
    // Check stability (variance in speed)
    if (angleHistory.length >= 5) {
      const variance = angleHistory.reduce((sum, v) => sum + (v - avgSpeed) ** 2, 0) / angleHistory.length
      vlogStabilityWarning.value = variance > 2 && !vlogSpeedWarning.value
    }
    
    lastAngle = currentAngle
    
    // Animate ghost box
    ghostProgress += 100 / (move.duration * 60)
    ghostBoxOffset.value = (ghostProgress / 100) * 150 * (targetAngle > 0 ? 1 : -1)
    
    // Check completion
    if (vlogProgress.value >= 100) {
      finishVlogTraining()
      return
    }
    
    vlogAnimationId = requestAnimationFrame(animate)
  }
  
  animate()
}

const stopVlogTraining = () => {
  isVlogTraining.value = false
  if (vlogAnimationId) {
    cancelAnimationFrame(vlogAnimationId)
    vlogAnimationId = null
  }
  vlogProgress.value = 0
  ghostBoxOffset.value = 0
}

const finishVlogTraining = () => {
  isVlogTraining.value = false
  if (vlogAnimationId) {
    cancelAnimationFrame(vlogAnimationId)
    vlogAnimationId = null
  }
  
  // Haptic feedback for completion
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100])
  }
  
  ghostBoxOffset.value = 0
}

// ========== Lifecycle ==========
onMounted(() => {
  startCamera()
  
  // Check for mode from query params (from Vlog Script integration)
  if (route.query.mode === 'vlog' && route.query.move) {
    currentMode.value = 'vlog'
    const move = vlogMoves.find(m => m.id === route.query.move)
    if (move) {
      selectedVlogMove.value = move
    }
  }
})

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  stopPoseDetection()
  stopVlogTraining()
  if (poseLandmarker) {
    poseLandmarker.close()
  }
  window.removeEventListener('deviceorientation', handleOrientation)
})

watch(isFrontCamera, () => {
  if (poseEnabled.value && currentMode.value === 'portrait') {
    stopPoseDetection()
    setTimeout(() => startPoseDetection(), 500)
  }
})
</script>

<style scoped>
.pb-safe {
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
