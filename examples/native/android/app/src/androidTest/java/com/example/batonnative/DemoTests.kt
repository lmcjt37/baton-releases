package com.example.batonnative

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import org.junit.Assert.fail
import org.junit.Assume.assumeTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test

/** A failure and a flaky test for the `demo` programme; skipped unless it sets DEMO=1. */
class DemoTests {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()
    private val args = InstrumentationRegistry.getArguments()

    @Before fun demoOnly() = assumeTrue("runs in the demo programme", args.getString("DEMO") == "1")

    @Test fun signIn() {
        rule.onNodeWithTag("sign-in").assertExists("The sample has no sign-in screen")
    }

    /** Fails on a Concert's first try and passes on its retry: FLAKY_FILE names a per-Concert file, kept in the app's storage. */
    @Test fun flaky() {
        val name = File(args.getString("FLAKY_FILE") ?: error("FLAKY_FILE isn't set")).name
        val file = File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir, name)
        if (file.delete()) return
        file.createNewFile()
        fail("Fails the first time, passes on the retry")
    }
}
