package com.shashank.aikeyboard

import android.content.Context
import android.inputmethodservice.InputMethodService
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.Toast
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class AIKeyboardService : InputMethodService() {

    private lateinit var keyboardView: View
    private val client = OkHttpClient()
    
    // Replace this with your actual Groq API Key or read it from SecureStore/SharedPreferences
    private val API_KEY = "gsk_replace_me_with_actual_key" 

    override fun onCreateInputView(): View {
        keyboardView = layoutInflater.inflate(R.layout.keyboard_view, null)

        val btnAiMagic = keyboardView.findViewById<Button>(R.id.btn_ai_magic)
        val btnGrammar = keyboardView.findViewById<Button>(R.id.btn_grammar)
        val btnTone = keyboardView.findViewById<Button>(R.id.btn_tone)

        btnAiMagic.setOnClickListener {
            // Get the last few words typed by the user to generate a smart reply
            val textBeforeCursor = currentInputConnection?.getTextBeforeCursor(100, 0)?.toString() ?: ""
            if (textBeforeCursor.isNotEmpty()) {
                Toast.makeText(this, "Generating ✨...", Toast.LENGTH_SHORT).show()
                callGroqApi(
                    "Suggest a concise, smart reply to this message: $textBeforeCursor",
                    onSuccess = { reply ->
                        currentInputConnection?.commitText(reply, 1)
                    },
                    onError = { error ->
                        showToast("AI Error: $error")
                    }
                )
            } else {
                Toast.makeText(this, "Type something first!", Toast.LENGTH_SHORT).show()
            }
        }

        btnGrammar.setOnClickListener {
            val textBeforeCursor = currentInputConnection?.getTextBeforeCursor(200, 0)?.toString() ?: ""
            if (textBeforeCursor.isNotEmpty()) {
                Toast.makeText(this, "Fixing grammar...", Toast.LENGTH_SHORT).show()
                callGroqApi(
                    "You are an expert copyeditor. Fix all grammar and spelling mistakes in the following text. Respond ONLY with the corrected text, nothing else: $textBeforeCursor",
                    onSuccess = { corrected ->
                        // Delete original text and insert corrected
                        currentInputConnection?.deleteSurroundingText(textBeforeCursor.length, 0)
                        currentInputConnection?.commitText(corrected, 1)
                    },
                    onError = { error ->
                        showToast("Error: $error")
                    }
                )
            }
        }

        btnTone.setOnClickListener {
            val textBeforeCursor = currentInputConnection?.getTextBeforeCursor(200, 0)?.toString() ?: ""
            if (textBeforeCursor.isNotEmpty()) {
                Toast.makeText(this, "Making professional 👔...", Toast.LENGTH_SHORT).show()
                callGroqApi(
                    "Rewrite the following text to sound highly professional and business-appropriate. Respond ONLY with the rewritten text: $textBeforeCursor",
                    onSuccess = { rewritten ->
                        currentInputConnection?.deleteSurroundingText(textBeforeCursor.length, 0)
                        currentInputConnection?.commitText(rewritten, 1)
                    },
                    onError = { error ->
                        showToast("Error: $error")
                    }
                )
            }
        }

        return keyboardView
    }

    private fun callGroqApi(prompt: String, onSuccess: (String) -> Unit, onError: (String) -> Unit) {
        val sharedPref = getSharedPreferences("AIKeyboardPrefs", Context.MODE_PRIVATE)
        val apiKey = sharedPref.getString("GROQ_API_KEY", null)

        if (apiKey.isNullOrEmpty() || apiKey.contains("replace_me")) {
            onError("Please set your Groq API Key in the AI Keyboard App settings!")
            return
        }

        val json = JSONObject()
        json.put("model", "llama3-8b-8192")
        val messages = org.json.JSONArray()
        val userMessage = JSONObject()
        userMessage.put("role", "user")
        userMessage.put("content", prompt)
        messages.put(userMessage)
        json.put("messages", messages)
        json.put("temperature", 0.7)
        json.put("max_tokens", 256)

        val body = json.toString().toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())

        val request = Request.Builder()
            .url("https://api.groq.com/openai/v1/chat/completions")
            .post(body)
            .addHeader("Authorization", "Bearer \$apiKey")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                onError(e.message ?: "Network error")
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val responseData = response.body?.string()
                    if (responseData != null) {
                        try {
                            val jsonObj = JSONObject(responseData)
                            val reply = jsonObj.getJSONArray("choices")
                                .getJSONObject(0)
                                .getJSONObject("message")
                                .getString("content")
                                .trim()
                            
                            // Post back to main thread
                            Handler(Looper.getMainLooper()).post {
                                onSuccess(reply)
                            }
                        } catch (e: Exception) {
                            Handler(Looper.getMainLooper()).post {
                                onError("Failed to parse response")
                            }
                        }
                    }
                } else {
                    Handler(Looper.getMainLooper()).post {
                        onError("API returned ${response.code}")
                    }
                }
            }
        })
    }

    private fun showToast(msg: String) {
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
    }
}
