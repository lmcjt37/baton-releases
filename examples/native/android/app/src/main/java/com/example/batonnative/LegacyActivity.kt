package com.example.batonnative

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/** A View-based screen in the same app, tested with Espresso. */
class LegacyActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_legacy)
        findViewById<Button>(R.id.button).setOnClickListener { findViewById<TextView>(R.id.label).text = "Clicked" }
    }
}
