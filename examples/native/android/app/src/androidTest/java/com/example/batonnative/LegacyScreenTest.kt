package com.example.batonnative

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.rules.ActivityScenarioRule
import org.junit.Rule
import org.junit.Test

/** Espresso tests for the View screen. */
class LegacyScreenTest {
    @get:Rule val rule = ActivityScenarioRule(LegacyActivity::class.java)

    @Smoke @Test fun clickUpdatesLabel() {
        onView(withId(R.id.button)).perform(click())
        onView(withId(R.id.label)).check(matches(withText("Clicked")))
    }
}
