package com.example.batonnative

/** `instrumentation.tags` in baton.config.ts maps the `smoke` tag to this annotation. */
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class Smoke
