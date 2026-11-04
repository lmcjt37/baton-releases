package com.example.batonnative

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.compose.ui.unit.dp

/** Change this on a branch to see each worktree test its own build. */
const val MARKER = "main"

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalComposeUiApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var tapped by remember { mutableStateOf(false) }
            // testTagsAsResourceId lets Maestro and UI Automator find these tags too.
            Column(
                Modifier.fillMaxSize().safeDrawingPadding().semantics { testTagsAsResourceId = true },
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text("Baton native sample")
                Text("Marker: $MARKER", Modifier.testTag("marker"))
                Button(onClick = { tapped = true }, modifier = Modifier.testTag("tap")) { Text("Tap me") }
                if (tapped) Text("Tapped", Modifier.testTag("tapped"))
                Button(onClick = { startActivity(Intent(this@MainActivity, LegacyActivity::class.java)) }, modifier = Modifier.testTag("legacy")) {
                    Text("Open the View screen")
                }
            }
        }
    }
}
