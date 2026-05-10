# ADR-0010: TDD with vertical slices (Matt Pocock's approach)

**Status:** Accepted

## Context

The project uses test-driven development. The common mistake in TDD is horizontal slicing — writing all tests first, then all implementation. This produces tests that verify imagined behavior rather than real behavior.

## Decision

Use vertical slices via tracer bullets. Each cycle: write one test that fails (RED), write the minimal code to pass it (GREEN), then consider refactoring. Never write multiple tests before any implementation.

Tests verify behavior through public interfaces only. A test that breaks when an internal function is renamed (but behavior is unchanged) is a bad test.

Deep modules are preferred: small, stable public interfaces with substantial implementation hidden behind them. The Matchmaker, GeoDetector, ReportStore, and WebRTCConnection modules are all designed this way.

## Consequences

- Each test reflects actual, observed behavior — not imagined behavior.
- Test suites survive internal refactors.
- Development feels slower at first (one test at a time) but produces higher-quality tests.
- The PRD → Issues → TDD workflow (Matt Pocock's skill chain) is used throughout this project.
