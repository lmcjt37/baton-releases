package com.example.batonnative

import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Rule
import org.junit.Test

/** Compose UI tests. */
class MarkerTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    @Smoke @Test fun showsMarker() {
        val expected = InstrumentationRegistry.getArguments().getString("EXPECTED_MARKER") ?: "main"
        rule.onNodeWithTag("marker").assertTextEquals("Marker: $expected")
    }

    @Smoke @Test fun tapShowsResult() {
        rule.onNodeWithTag("tap").performClick()
        rule.onNodeWithTag("tapped").assertTextEquals("Tapped")
    }
}
