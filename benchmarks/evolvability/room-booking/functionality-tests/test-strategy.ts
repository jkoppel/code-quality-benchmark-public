import { Effect } from "effect";
import { TestContext } from "../../../../harness/benchmark-test-lib/context.ts";
import type { SuiteGenerationStrategy } from "../../../../harness/benchmark-test-lib/suite.ts";
import { Suite } from "../../../../harness/benchmark-test-lib/suite.ts";
import {
  basicResourceBookingWithRoom,
  basicRoomBookingForRegularRoom,
  basicRoomUnbooking,
  bookingConflictPrevention,
  roomListCompletenessAndGrandBallroomPresence,
  sameRoomMultipleSequentialBookings,
} from "./basic-tests.ts";
import {
  bookingUnbookingInverseProperty,
  grandBallroomBookingBlocksConstituentBallrooms,
  individualBallroomBookingBlocksGrandBallroom,
  multipleResourceTypesInSingleBooking,
  overlappingResourceBookings,
  partialBallroomConflictBlocksGrandBallroom,
  resourceAvailabilityLimit,
  resourceBookingUnbookingInverse,
  resourceIndependenceAcrossDates,
  resourceReleaseOnBookingCancellation,
  unbookingGrandBallroomFreesConstituentBallrooms,
  unbookingIndividualBallroomDoesntAutoFreeGrandBallroom,
} from "./non-basic-tests.ts";

export const strategy: SuiteGenerationStrategy = {
  discover() {
    // No discovery needed for these static tests
    return Effect.succeed(new TestContext(new Map()));
  },

  generateSuite() {
    const staticTests = [
      // Basic Room Booking Tests
      basicRoomBookingForRegularRoom,
      basicRoomUnbooking,

      // Grand Ballroom Tests
      grandBallroomBookingBlocksConstituentBallrooms,
      individualBallroomBookingBlocksGrandBallroom,
      partialBallroomConflictBlocksGrandBallroom,
      unbookingGrandBallroomFreesConstituentBallrooms,
      unbookingIndividualBallroomDoesntAutoFreeGrandBallroom,

      // Resource Booking Tests
      basicResourceBookingWithRoom,
      resourceAvailabilityLimit,
      overlappingResourceBookings,
      multipleResourceTypesInSingleBooking,
      resourceReleaseOnBookingCancellation,

      // Algebraic Properties
      bookingUnbookingInverseProperty,
      resourceBookingUnbookingInverse,

      // Edge Case Tests
      sameRoomMultipleSequentialBookings,
      bookingConflictPrevention,
      roomListCompletenessAndGrandBallroomPresence,
      resourceIndependenceAcrossDates,
    ];

    return Effect.succeed(
      new Suite("Room Booking Functionality Tests", staticTests),
    );
  },
};

export default strategy;
