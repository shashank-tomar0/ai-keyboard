package com.shashank.aikeyboard

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SharedPrefsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SharedPrefsModule"
    }

    @ReactMethod
    fun saveApiKey(key: String) {
        val sharedPref = reactApplicationContext.getSharedPreferences("AIKeyboardPrefs", Context.MODE_PRIVATE)
        with(sharedPref.edit()) {
            putString("GROQ_API_KEY", key)
            apply()
        }
    }
}
