package com.atlasdrivershell

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SoundModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var mediaPlayer: MediaPlayer? = null

    override fun getName(): String {
        return "SoundModule"
    }

    @ReactMethod
    fun playTestSound(promise: Promise) {
        try {
            stopCurrentMediaPlayer()

            val resId = reactContext.resources.getIdentifier("ride_request_sound", "raw", reactContext.packageName)
            if (resId != 0) {
                mediaPlayer = MediaPlayer.create(reactContext, resId)
            } else {
                val defaultUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                mediaPlayer = MediaPlayer().apply {
                    setDataSource(reactContext, defaultUri)
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                            .build()
                    )
                    prepare()
                }
            }

            mediaPlayer?.let { mp ->
                mp.setOnCompletionListener {
                    stopCurrentMediaPlayer()
                }
                mp.start()
                promise.resolve("SUCCESS")
            } ?: run {
                promise.reject("SOUND_ERROR", "Failed to initialize MediaPlayer")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("SOUND_ERROR", e.localizedMessage ?: "Unknown sound error")
        }
    }

    @ReactMethod
    fun playTestVibration(promise: Promise) {
        try {
            val pattern = longArrayOf(0, 300, 150, 300, 150, 600)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = reactContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                val vibrator = vibratorManager.defaultVibrator
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = reactContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(pattern, -1)
                }
            }
            promise.resolve("SUCCESS")
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("VIBRATION_ERROR", e.localizedMessage ?: "Unknown vibration error")
        }
    }

    @ReactMethod
    fun playRideRequestAlert(promise: Promise) {
        try {
            playTestSound(promise)
            playTestVibration(promise)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("ALERT_ERROR", e.localizedMessage ?: "Unknown alert error")
        }
    }

    @ReactMethod
    fun setKeepScreenOn(enable: Boolean, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current Activity is null")
            return
        }
        activity.runOnUiThread {
            try {
                if (enable) {
                    activity.window.addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                } else {
                    activity.window.clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("FLAG_ERROR", e.localizedMessage ?: "Failed to set FLAG_KEEP_SCREEN_ON")
            }
        }
    }

    @ReactMethod
    fun setRequestedOrientation(mode: String, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current Activity is null")
            return
        }
        activity.runOnUiThread {
            try {
                if (mode.equals("portrait", ignoreCase = true)) {
                    activity.requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                } else if (mode.equals("auto", ignoreCase = true) || mode.equals("sensor", ignoreCase = true)) {
                    activity.requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR
                } else {
                    activity.requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("ORIENTATION_ERROR", e.localizedMessage ?: "Failed to set requested orientation")
            }
        }
    }

    @ReactMethod
    fun isGpsLocationEnabled(promise: Promise) {
        try {
            val locationManager = reactContext.getSystemService(Context.LOCATION_SERVICE) as android.location.LocationManager
            val isGpsEnabled = locationManager.isProviderEnabled(android.location.LocationManager.GPS_PROVIDER)
            val isNetworkEnabled = locationManager.isProviderEnabled(android.location.LocationManager.NETWORK_PROVIDER)
            promise.resolve(isGpsEnabled || isNetworkEnabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openLocationSettings(promise: Promise) {
        try {
            val intent = android.content.Intent(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS)
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            try {
                val intent = android.content.Intent(android.provider.Settings.ACTION_SETTINGS)
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
                promise.resolve(true)
            } catch (ex: Exception) {
                promise.reject("LOCATION_SETTINGS_ERROR", ex.localizedMessage ?: "Failed to open location settings")
            }
        }
    }

    @ReactMethod
    fun openNotificationSettings(promise: Promise) {
        try {
            val intent = android.content.Intent().apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    action = android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS
                    putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, reactContext.packageName)
                } else {
                    action = android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS
                    data = android.net.Uri.fromParts("package", reactContext.packageName, null)
                }
                addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            try {
                val intent = android.content.Intent(android.provider.Settings.ACTION_SETTINGS)
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
                promise.resolve(true)
            } catch (ex: Exception) {
                promise.reject("NOTIF_SETTINGS_ERROR", ex.localizedMessage ?: "Failed to open notification settings")
            }
        }
    }

    @ReactMethod
    fun isNotificationPermissionGranted(promise: Promise) {
        try {
            val areNotifsEnabled = androidx.core.app.NotificationManagerCompat.from(reactContext).areNotificationsEnabled()
            if (!areNotifsEnabled) {
                promise.resolve(false)
                return
            }

            if (Build.VERSION.SDK_INT >= 33) {
                val postNotifPerm = androidx.core.content.ContextCompat.checkSelfPermission(
                    reactContext,
                    android.Manifest.permission.POST_NOTIFICATIONS
                ) == android.content.pm.PackageManager.PERMISSION_GRANTED
                promise.resolve(postNotifPerm)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun createNotificationChannel(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channelId = "yalla_ride_alerts_channel"
                val name = "Yalla Ride Requests"
                val descriptionText = "High priority notifications for incoming ride requests"
                val importance = android.app.NotificationManager.IMPORTANCE_HIGH
                val channel = android.app.NotificationChannel(channelId, name, importance).apply {
                    description = descriptionText
                    enableVibration(true)
                }
                val notificationManager: android.app.NotificationManager =
                    reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
                notificationManager.createNotificationChannel(channel)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CHANNEL_ERROR", e.localizedMessage ?: "Failed to create channel")
        }
    }

    private fun stopCurrentMediaPlayer() {
        try {
            mediaPlayer?.let { mp ->
                if (mp.isPlaying) {
                    mp.stop()
                }
                mp.release()
            }
        } catch (_: Exception) {}
        mediaPlayer = null
    }
}
