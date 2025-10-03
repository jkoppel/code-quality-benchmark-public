import dedent from "dedent";
import type { Effect } from "effect";
import type { DriverAgentError } from "../../../../harness/benchmark-test-lib/agents/driver-agent.ts";
import type {
  TestCaseAgent,
  TestCaseAgentOptions,
} from "../../../../harness/benchmark-test-lib/agents/test-case-agent.ts";
import type { TestContext } from "../../../../harness/benchmark-test-lib/context.ts";
import type { TestResult } from "../../../../harness/benchmark-test-lib/report.ts";
import type { TestRunnerConfig } from "../../../../harness/benchmark-test-lib/runner.ts";
import type { TestCase } from "../../../../harness/benchmark-test-lib/suite.ts";
import type { LoggerConfig } from "../../../../harness/utils/logger/logger.ts";
import { makeBackgroundPrompt } from "./common-prompts.ts";

/***************************************
         Grand Ballroom Tests
****************************************/

export const grandBallroomBookingBlocksConstituentBallrooms = makeTest({
  name: "Grand Ballroom Booking Blocks Constituent Ballrooms",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that booking the Grand Ballroom makes Ballrooms 1, 2, and 3 unavailable for the same time period.

      Steps:
      1. Navigate to the room booking application
      2. Select a date and note that Ballrooms 1, 2, and 3 are all available for 2:00 PM - 3:00 PM
      3. Book the Grand Ballroom for 2:00 PM - 3:00 PM with user name "Eve"
      4. Verify the Grand Ballroom booking is created
      5. Check Ballroom 1 availability for the same time - should show as unavailable
      6. Check Ballroom 2 availability for the same time - should show as unavailable
      7. Check Ballroom 3 availability for the same time - should show as unavailable
      8. Verify that time slots before 2:00 PM and after 3:00 PM remain available for the individual ballrooms

      Mark the test as passing if:
      - Grand Ballroom booking succeeds
      - All three constituent ballrooms show as unavailable for the exact time period
      - Other time slots for individual ballrooms remain unaffected

      Mark the test as failing if:
      - Grand Ballroom booking fails
      - Any of the three ballrooms remain available during the booked time
      - Unrelated time slots are incorrectly marked as unavailable`);
  },
});

export const individualBallroomBookingBlocksGrandBallroom = makeTest({
  name: "Individual Ballroom Booking Blocks Grand Ballroom",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that booking any individual ballroom (1, 2, or 3) makes the Grand Ballroom unavailable.

      Steps:
      1. Navigate to the room booking application
      2. Verify that Grand Ballroom is available for 4:00 PM - 5:00 PM on a specific date
      3. Book only Ballroom 1 for 4:00 PM - 5:00 PM with user name "Frank"
      4. Verify the Ballroom 1 booking is created
      5. Check Grand Ballroom availability for 4:00 PM - 5:00 PM - should show as unavailable
      6. Verify Ballrooms 2 and 3 remain available for 4:00 PM - 5:00 PM

      Mark the test as passing if:
      - Ballroom 1 booking succeeds
      - Grand Ballroom shows as unavailable for the same time period
      - Ballrooms 2 and 3 remain available

      Mark the test as failing if:
      - Ballroom 1 booking fails
      - Grand Ballroom remains available after individual ballroom is booked
      - Ballrooms 2 or 3 are incorrectly blocked`);
  },
});

export const partialBallroomConflictBlocksGrandBallroom = makeTest({
  name: "Partial Ballroom Conflict Blocks Grand Ballroom",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that if only one or two of the constituent ballrooms are booked, the Grand Ballroom is unavailable for that time.

      Steps:
      1. Navigate to the room booking application
      2. Book Ballroom 1 for 10:00 AM - 11:00 AM with user name "Grace"
      3. Book Ballroom 3 for 10:00 AM - 11:00 AM with user name "Henry"
      4. Note that Ballroom 2 remains available for this time
      5. Check Grand Ballroom availability for 10:00 AM - 11:00 AM - should be unavailable
      6. Attempt to book Grand Ballroom for this time if the UI allows - should fail

      Mark the test as passing if:
      - Grand Ballroom shows as unavailable when only partial ballrooms are booked
      - System prevents Grand Ballroom booking when any constituent ballroom is unavailable
      - Ballroom 2 correctly shows as still available

      Mark the test as failing if:
      - Grand Ballroom shows as available despite partial conflicts
      - System allows Grand Ballroom booking when constituent ballrooms are already booked
      - Availability display is incorrect`);
  },
});

export const unbookingGrandBallroomFreesConstituentBallrooms = makeTest({
  name: "Unbooking Grand Ballroom Frees Constituent Ballrooms",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that unbooking a Grand Ballroom booking makes all three ballrooms available again.

      Steps:
      1. Navigate to the room booking application
      2. Book Grand Ballroom for 1:00 PM - 2:00 PM with user name "Ivy"
      3. Verify Ballrooms 1, 2, and 3 are all unavailable at this time
      4. Unbook the Grand Ballroom booking
      5. Check that Ballroom 1 is now available for 1:00 PM - 2:00 PM
      6. Check that Ballroom 2 is now available for 1:00 PM - 2:00 PM
      7. Check that Ballroom 3 is now available for 1:00 PM - 2:00 PM
      8. Verify Grand Ballroom itself is also available again

      Mark the test as passing if:
      - After unbooking, all three ballrooms become available
      - Grand Ballroom also shows as available
      - All rooms return to their pre-booking availability state

      Mark the test as failing if:
      - Any ballroom remains unavailable after Grand Ballroom unbooking
      - System state is inconsistent after unbooking`);
  },
});

export const unbookingIndividualBallroomDoesntAutoFreeGrandBallroom = makeTest({
  name: "Unbooking Individual Ballroom Doesn't Auto-Free Grand Ballroom",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that unbooking one ballroom only makes Grand Ballroom available if all other ballrooms are also free.

      Steps:
      1. Navigate to the room booking application
      2. Book Ballroom 1 for 3:00 PM - 4:00 PM with user name "Jack"
      3. Book Ballroom 2 for 3:00 PM - 4:00 PM with user name "Kate"
      4. Verify Grand Ballroom is unavailable for this time
      5. Unbook the Ballroom 1 booking
      6. Check that Grand Ballroom is STILL unavailable (because Ballroom 2 is still booked)
      7. Unbook the Ballroom 2 booking
      8. Now verify that Grand Ballroom becomes available

      Mark the test as passing if:
      - Grand Ballroom remains unavailable until ALL constituent ballrooms are free
      - Grand Ballroom becomes available only after all conflicts are resolved

      Mark the test as failing if:
      - Grand Ballroom becomes available while any constituent ballroom is still booked
      - Availability logic is incorrect`);
  },
});

/***************************************
         Resource Booking Tests
****************************************/

export const resourceAvailabilityLimit = makeTest({
  name: "Resource Availability Limit (2 Units Per Resource)",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that only 2 units of each resource type exist and booking respects this limit. When resources are unavailable, the entire booking should fail.

      Steps:
      1. Navigate to the room booking application
      2. Book Anaconda room for 2:00 PM - 3:00 PM with user name "Mia" and include "document cameras" resource
      3. Book Baboon room for 2:00 PM - 3:00 PM with user name "Noah" and include "document cameras" resource
      4. Verify both bookings succeed (2 units available, both now allocated)
      5. Attempt to book Ballroom 1 for 2:00 PM - 3:00 PM with user name "Olivia" and include "document cameras" resource
      6. Verify this third booking fails entirely (resource unavailable)
      7. Check that the system indicates document cameras are unavailable for this time slot
      8. Verify that no booking was created for Olivia (entire booking failed, not partial success)

      Mark the test as passing if:
      - First two bookings with document cameras succeed
      - Third booking fails entirely when resource is unavailable
      - System correctly enforces the 2-unit limit per resource type
      - No partial bookings are created

      Mark the test as failing if:
      - System allows more than 2 units of a resource to be booked simultaneously
      - System creates booking without requested resource (partial success)
      - Resource limits are not enforced
      - No indication of resource unavailability`);
  },
});

export const overlappingResourceBookings = makeTest({
  name: "Overlapping Resource Bookings",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that resource availability is calculated correctly across overlapping time periods.

      Steps:
      1. Navigate to the room booking application
      2. Book Anaconda for 10:00 AM - 11:00 AM with user name "Paul" and include "laptop carts"
      3. Book Baboon for 10:30 AM - 11:30 AM with user name "Quinn" and include "laptop carts"
      4. Verify both bookings succeed (overlap at 10:30-11:00, but 2 units available)
      5. Attempt to book Ballroom 1 for 10:30 AM - 11:00 AM with user name "Rita" and include "laptop carts"
      6. Verify this booking fails entirely (all units allocated during 10:30-11:00)
      7. Check that laptop carts show as unavailable for 10:30-11:00 but available for 10:00-10:30 and 11:00-11:30

      Mark the test as passing if:
      - System correctly calculates overlapping resource usage
      - Resource availability accurately reflects the most constrained overlapping period
      - Third booking fails entirely when resource unavailable during overlap

      Mark the test as failing if:
      - System allows overbooking of resources during overlap periods
      - Resource availability calculation is incorrect
      - Booking succeeds without requested resource`);
  },
});

export const multipleResourceTypesInSingleBooking = makeTest({
  name: "Multiple Resource Types in Single Booking",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that a single room booking can include multiple different resource types.

      Steps:
      1. Navigate to the room booking application
      2. Book Anaconda for 9:00 AM - 10:00 AM with user name "Sam"
      3. Include both "speakers" and "laptop carts" in this single booking
      4. Verify the booking is created successfully
      5. Check that the booking displays both resources
      6. Verify that 1 unit of speakers is now allocated for 9:00-10:00
      7. Verify that 1 unit of laptop carts is now allocated for 9:00-10:00

      Mark the test as passing if:
      - Booking with multiple resource types succeeds
      - All resources are correctly associated with the booking
      - Availability for both resource types is correctly updated

      Mark the test as failing if:
      - Cannot add multiple resource types to one booking
      - Some resources are not saved or displayed
      - Resource availability is not correctly updated for all types`);
  },
});

export const resourceReleaseOnBookingCancellation = makeTest({
  name: "Resource Release on Booking Cancellation",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that resources become available again when a booking is cancelled.

      Steps:
      1. Navigate to the room booking application
      2. Book Anaconda for 4:00 PM - 5:00 PM with user name "Tina" and include "speakers"
      3. Book Baboon for 4:00 PM - 5:00 PM with user name "Uma" and include "speakers"
      4. Verify both speaker units are now allocated for 4:00-5:00 PM
      5. Check that speakers show as unavailable for this time slot (or only 0 units available)
      6. Unbook Tina's booking
      7. Verify that 1 speaker unit is now available for 4:00-5:00 PM
      8. Verify that a new booking for 4:00-5:00 PM can now include speakers

      Mark the test as passing if:
      - Resources are released immediately upon unbooking
      - Resource availability count is correctly updated
      - New bookings can use the released resources

      Mark the test as failing if:
      - Resources remain allocated after booking cancellation
      - Resource count is not updated correctly
      - Cannot use released resources for new bookings`);
  },
});

/***************************************
         Algebraic Property Tests
****************************************/

export const bookingUnbookingInverseProperty = makeTest({
  name: "Booking-Unbooking Inverse Property",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that booking then unbooking a room returns the system to its original state (they are inverse operations).

      Steps:
      1. Navigate to the room booking application
      2. Select Ballroom 2 and date (tomorrow)
      3. Take a snapshot of the availability state for 12:00 PM - 2:00 PM
      4. Book Ballroom 2 for 12:00 PM - 2:00 PM with user name "Victor"
      5. Verify booking appears and time is unavailable
      6. Immediately unbook this booking
      7. Verify the availability for 12:00 PM - 2:00 PM returns to the original state from step 3
      8. Confirm no booking exists for this time/room
      9. Verify no resources are allocated (if any were included in the booking)

      Mark the test as passing if:
      - System returns to exact same state as before the booking
      - No lingering bookings or resource allocations
      - Availability matches original snapshot

      Mark the test as failing if:
      - System state differs from original after booking/unbooking cycle
      - Booking or resource allocations remain
      - Availability is incorrectly displayed`);
  },
});

export const resourceBookingUnbookingInverse = makeTest({
  name: "Resource Booking-Unbooking Inverse",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that resources are properly restored after booking/unbooking cycles.

      Steps:
      1. Navigate to the room booking application
      2. Note initial resource availability for "document cameras" at 1:00 PM - 2:00 PM (should be 2 units)
      3. Book Anaconda for 1:00-2:00 PM with user name "Xavier" and include "document cameras"
      4. Verify 1 document camera unit is now available (2 - 1 = 1)
      5. Book Baboon for 1:00-2:00 PM with user name "Yara" and include "document cameras"
      6. Verify 0 document camera units are now available (1 - 1 = 0)
      7. Unbook Xavier's booking
      8. Verify 1 document camera unit is available again
      9. Unbook Yara's booking
      10. Verify 2 document camera units are available (back to initial state)

      Mark the test as passing if:
      - Resource availability returns to initial state after complete booking/unbooking cycle
      - Resource counts are accurate at each step
      - System maintains correct resource allocation state

      Mark the test as failing if:
      - Resource count doesn't return to initial value
      - Resource availability is incorrectly calculated at any step
      - Resources are lost or duplicated through booking cycles`);
  },
});

/***************************************
         Edge Case Tests
****************************************/

export const resourceIndependenceAcrossDates = makeTest({
  name: "Resource Independence Across Dates",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that resource availability is correctly tracked per date (resources on one date don't affect another date).

      Steps:
      1. Navigate to the room booking application
      2. Book Anaconda for today, 2:00 PM - 3:00 PM with user name "Helen" and include "speakers"
      3. Book Baboon for today, 2:00 PM - 3:00 PM with user name "Ian" and include "speakers"
      4. Verify that it is not possible to reserve speakers for new bookings of other, non-Anaconda rooms at the same timeslot (today 2:00-3:00 PM)
      5. Switch to tomorrow's date
      6. Check speaker availability for 2:00-3:00 PM tomorrow
      7. Verify that 2 speaker units are available tomorrow (today's bookings don't affect tomorrow)
      8. Successfully book a room for tomorrow 2:00-3:00 PM with speakers

      Mark the test as passing if:
      - Resource availability is independently tracked per date
      - Today's resource allocations don't affect tomorrow
      - Resources can be fully booked on multiple dates independently

      Mark the test as failing if:
      - Resource availability incorrectly spans across dates
      - Cannot book resources on different dates
      - Resource tracking is not date-specific`);
  },
});

/***************************************
         makeTest helper
****************************************/

interface RoomBookingTestOptions {
  name: string;
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig>;
}

function makeTest({ name, run }: RoomBookingTestOptions): TestCase {
  return {
    descriptiveName: name,
    run(
      makeAgent: (options: TestCaseAgentOptions) => TestCaseAgent,
      _context: TestContext,
      config: TestRunnerConfig,
    ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
      const agent = makeAgent({ additionalCapabilities: [] });
      return run(agent, config);
    },
  };
}
