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
         Basic Room Booking Tests
****************************************/

export const basicRoomBookingForRegularRoom = makeTest({
  name: "Basic Room Booking for Regular Room",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that a user can successfully book a regular room when it's available.

      Steps:
      1. Navigate to the room booking application
      2. Select a regular room (e.g., Anaconda)
      3. Select today's date
      4. Choose an available time slot (e.g., 10:00 AM to 11:00 AM)
      5. Enter a user name (e.g., "Alice")
      6. Submit the booking
      7. Verify that the booking appears in the system showing: room name (Anaconda), user name (Alice), date (today), time (10:00-11:00)
      8. Check that the previously available time slot now shows as unavailable/booked

      Mark the test as passing if:
      - Booking is created successfully
      - The booking contains both the user's name as well as the time it's booked for
      - It is not possible to make other bookings for that booked timeslot

      Mark the test as failing if:
      - Booking fails when room is available
      - The booking info does not contain both the user's name and time it should be booked for
      - Even after booking that timeslot, it is still possible to make other bookings for that timeslot.`);
  },
});

export const basicRoomUnbooking = makeTest({
  name: "Basic Room Unbooking",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that booking and unbooking are inverse operations: unbooking a booking returns the system to its original state.

      Steps:
      1. Navigate to the room booking application
      2. Note the initial availability state for Baboon room at 2:00 PM - 3:00 PM on a specific date
      3. Book Baboon room for that time slot with user name "Bob"
      4. Verify the booking was created and the time slot shows as unavailable
      5. Unbook/cancel this booking
      6. Check that the time slot for Baboon room returns to available state
      7. Verify no booking exists for this time/room combination

      Mark the test as passing if:
      - After unbooking, the time slot returns to the same availability state as before booking

      Mark the test as failing if:
      - Time slot remains unavailable after unbooking
      - Any errors occur during the unbooking process`);
  },
});

export const halfHourGranularityBooking = makeTest({
  name: "Half-Hour Granularity Booking",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that bookings can be made with half-hour precision (not just full hours).

      Steps:
      1. Navigate to the room booking application
      2. Select Anaconda room
      3. Create a booking from 9:30 AM to 10:30 AM with user name "Charlie"
      4. Verify the booking is created with exact start time 9:30 AM and end time 10:30 AM
      5. Check that 9:30-10:00 and 10:00-10:30 both show as unavailable
      6. Verify that 9:00-9:30 and 10:30-11:00 remain available (if they were available before)

      Mark the test as passing if:
      - System accepts half-hour start and end times (9:30, 10:30)
      - Booking displays with correct half-hour precision
      - Availability is correctly updated for half-hour increments

      Mark the test as failing if:
      - System rejects half-hour times or rounds them to full hours
      - Booking shows incorrect times
      - Availability is not correctly calculated at half-hour granularity`);
  },
});

export const basicResourceBookingWithRoom = makeTest({
  name: "Basic Resource Booking with Room",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that resources (speakers, document cameras, laptop carts) can be added to room bookings.

      Steps:
      1. Navigate to the room booking application
      2. Book Anaconda room for 11:00 AM - 12:00 PM with user name "Leo"
      3. Include "speakers" resource in the booking
      4. Verify the booking is created with the speakers resource attached
      5. Check that the booking display shows both the room and the speakers resource

      Mark the test as passing if:
      - Room booking with resource succeeds
      - Resource is correctly associated with the booking
      - Booking displays both room and resource information

      Mark the test as failing if:
      - Cannot add resource to booking
      - Resource is not saved with booking
      - Resource information is missing from booking display`);
  },
});

export const sameRoomMultipleSequentialBookings = makeTest({
  name: "Same Room Multiple Sequential Bookings",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that the same room can be booked by different users for sequential (non-overlapping) time slots.

      Steps:
      1. Navigate to the room booking application
      2. Book Anaconda for 9:00 AM - 10:00 AM with user name "Alice"
      3. Book Anaconda for 10:00 AM - 11:00 AM with user name "Bob"
      4. Book Anaconda for 11:00 AM - 12:00 PM with user name "Charlie"
      5. Verify all three bookings exist
      6. Check that 9:00-10:00 shows as booked by Alice
      7. Check that 10:00-11:00 shows as booked by Bob
      8. Check that 11:00-12:00 shows as booked by Charlie
      9. Verify that 8:30-9:00 AM and 12:00-12:30 PM remain available

      Mark the test as passing if:
      - All sequential bookings are created successfully
      - Each booking shows correct user and time
      - Availability correctly shows booked periods and available gaps

      Mark the test as failing if:
      - System prevents valid sequential bookings
      - Bookings overlap incorrectly
      - Wrong user appears on any booking`);
  },
});

export const bookingConflictPrevention = makeTest({
  name: "Booking Conflict Prevention",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that the system prevents overlapping bookings for the same room.

      Steps:
      1. Navigate to the room booking application
      2. Book Baboon for 3:00 PM - 4:00 PM with user name "Dana"
      3. Verify the booking is created
      4. Attempt to book Baboon for 3:30 PM - 4:30 PM with user name "Evan" (overlaps with Dana's booking)
      5. Verify the system rejects this booking or prevents its creation
      6. Attempt to book Baboon for 2:30 PM - 3:30 PM with user name "Fiona" (also overlaps)
      7. Verify this booking is also rejected
      8. Verify that booking Baboon for 2:00 PM - 3:00 PM (ends exactly when Dana's starts) succeeds
      9. Verify that booking Baboon for 4:00 PM - 5:00 PM (starts exactly when Dana's ends) succeeds

      Mark the test as passing if:
      - System prevents overlapping bookings
      - Adjacent (non-overlapping) bookings are allowed
      - Clear error message or prevention mechanism for conflicts

      Mark the test as failing if:
      - System allows overlapping bookings
      - Adjacent bookings are incorrectly blocked
      - No indication of booking conflicts`);
  },
});

export const roomListCompletenessAndGrandBallroomPresence = makeTest({
  name: "Room List Completeness and Grand Ballroom Presence",
  run(
    agent: TestCaseAgent,
    config: TestRunnerConfig,
  ): Effect.Effect<TestResult, DriverAgentError, LoggerConfig> {
    return agent.check(dedent`
      ${makeBackgroundPrompt(config.getSutConfig())}

      Objective: Verify that all 6 rooms (5 regular + Grand Ballroom) are available for browsing and booking.

      Steps:
      1. Navigate to the room booking application
      2. View the list of available rooms
      3. Verify the following rooms appear in the list:
         - Anaconda
         - Baboon
         - Ballroom 1
         - Ballroom 2
         - Ballroom 3
         - Grand Ballroom
      4. Verify that each room can be selected for booking
      5. Select Grand Ballroom specifically to verify it appears as a bookable option
      6. Verify the booking interface works for Grand Ballroom the same as for regular rooms
      7. Create a test booking for Grand Ballroom to confirm it's functional
      8. Verify the booking appears correctly with "Grand Ballroom" as the room name

      Mark the test as passing if:
      - All 6 rooms are listed
      - Each room name is spelled correctly
      - All rooms can be selected and booked
      - Grand Ballroom is listed as a bookable room
      - Booking interface works correctly for Grand Ballroom
      - Bookings can be created and displayed for Grand Ballroom

      Mark the test as failing if:
      - Any room is missing from the list
      - Any room cannot be selected or booked
      - Room names are incorrect
      - Grand Ballroom is missing from room list
      - Cannot select or book Grand Ballroom`);
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
