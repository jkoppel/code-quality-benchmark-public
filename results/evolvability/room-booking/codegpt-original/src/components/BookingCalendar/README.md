# BookingCalendar Component

A comprehensive, accessible, and extensible booking calendar component built with React and TypeScript, following SOLID principles and modern design patterns.

## Features

- 📅 **Interactive Calendar**: Select dates and time slots
- ♿ **Accessibility**: Full ARIA support and keyboard navigation
- 🎨 **Customizable**: Configurable hours, styling, and behavior
- 🔒 **Type Safety**: Full TypeScript support with comprehensive interfaces
- 🏗️ **Modular Architecture**: Composed of focused, reusable components
- 🧪 **Testable**: Clean separation of concerns and dependency injection
- 🌐 **Internationalization Ready**: Configurable date/time formatting

## Architecture

### SOLID Principles Applied

1. **Single Responsibility Principle (SRP)**

   - Each component has a single, well-defined purpose
   - Utility functions handle specific operations
   - Custom hooks encapsulate related state logic

2. **Open/Closed Principle (OCP)**

   - Components are open for extension through props and composition
   - Service layer allows different implementations
   - Configuration system enables behavior modification

3. **Liskov Substitution Principle (LSP)**

   - Components can be substituted with compatible implementations
   - Interfaces ensure consistent contracts
   - Mock services can replace real implementations

4. **Interface Segregation Principle (ISP)**

   - Focused interfaces for different concerns
   - Components only depend on what they need
   - Optional props for extended functionality

5. **Dependency Inversion Principle (DIP)**
   - Components depend on abstractions (hooks, utilities)
   - Service layer abstracts data operations
   - Configurable dependencies through props

### Design Patterns Used

- **Composition Pattern**: Main component composed of smaller components
- **Strategy Pattern**: Different booking strategies through configuration
- **Observer Pattern**: State changes trigger re-renders
- **Factory Pattern**: Service and configuration factories
- **Context Pattern**: Global state management
- **Reducer Pattern**: Predictable state updates
- **Error Boundary Pattern**: Graceful error handling

## Component Structure

```
BookingCalendar/
├── BookingCalendar.tsx     # Main orchestrating component
├── DateSelector.tsx        # Date selection component
├── HourSlot.tsx           # Individual time slot component
├── HoursGrid.tsx          # Grid of time slots
├── BookingForm.tsx        # Booking form modal
├── types.ts               # TypeScript interfaces
├── index.ts               # Public API exports
└── README.md              # This documentation
```

## Usage

### Basic Usage

```tsx
import { BookingCalendar } from "./components/BookingCalendar";
import { Room, Booking } from "./types";

const room: Room = {
  id: "conference-room-1",
  name: "Conference Room A",
};

const bookings: Booking[] = [
  {
    id: "1",
    roomId: "conference-room-1",
    name: "John Doe",
    date: "2024-01-15",
    hour: 10,
  },
];

const handleBook = (name: string, date: string, hour: number) => {
  // Handle booking logic
  console.log("Booking:", { name, date, hour });
};

<BookingCalendar room={room} bookings={bookings} onBook={handleBook} />;
```

### Advanced Usage with Configuration

```tsx
import { BookingCalendar } from "./components/BookingCalendar";
import { BookingConfigFactory } from "./config/bookingConfig";

const config = BookingConfigFactory.getExtendedHoursConfig();

<BookingCalendar
  room={room}
  bookings={bookings}
  onBook={handleBook}
  availableHours={config.availableHours}
  minDate="2024-01-01"
  maxDate="2024-12-31"
/>;
```

### Virtual Room Support

```tsx
const virtualRoom: Room = {
  id: "grand-ballroom",
  name: "Grand Ballroom",
  isVirtual: true,
  requiredRooms: ["ballroom-1", "ballroom-2", "ballroom-3"],
};

<BookingCalendar room={virtualRoom} bookings={bookings} onBook={handleBook} />;
```

## Props API

### BookingCalendarProps

| Prop             | Type                                                 | Required | Description                                               |
| ---------------- | ---------------------------------------------------- | -------- | --------------------------------------------------------- |
| `room`           | `Room`                                               | ✅       | Room object with id, name, and optional virtual room info |
| `bookings`       | `Booking[]`                                          | ✅       | Array of existing bookings                                |
| `onBook`         | `(name: string, date: string, hour: number) => void` | ✅       | Callback when a booking is made                           |
| `availableHours` | `number[]`                                           | ❌       | Custom available hours (default: 0-23)                    |
| `minDate`        | `string`                                             | ❌       | Minimum selectable date (YYYY-MM-DD)                      |
| `maxDate`        | `string`                                             | ❌       | Maximum selectable date (YYYY-MM-DD)                      |

## Custom Hooks

### useBookingState

Manages booking form state and interactions.

```tsx
const {
  selectedDate,
  showBookingForm,
  selectedHour,
  bookingName,
  setSelectedDate,
  setBookingName,
  openBookingForm,
  resetBookingForm,
} = useBookingState();
```

### useBookingOperations

Handles booking business logic and validation.

```tsx
const { isSlotAvailable, handleBooking } = useBookingOperations({
  bookings,
  onBook,
});
```

## Utility Functions

### Date Utils

- `formatHour(hour: number)`: Format hour to readable time
- `getCurrentDateString()`: Get current date in YYYY-MM-DD format
- `isValidDateString(dateString: string)`: Validate date format
- `formatDateForDisplay(dateString: string)`: Format date for display

### Booking Utils

- `isHourBooked(bookings, date, hour)`: Check if hour is booked
- `findBookingByDateAndHour(bookings, date, hour)`: Find specific booking
- `validateBookingData(name, date, hour)`: Validate booking data
- `getBookingsForDate(bookings, date)`: Filter bookings by date

## Accessibility Features

- **ARIA Labels**: Comprehensive labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling in modals
- **Live Regions**: Status updates announced to screen readers
- **High Contrast**: Supports high contrast mode
- **Screen Reader**: Optimized for screen reader users

## Testing

The component includes comprehensive test utilities:

```tsx
import {
  testScenarios,
  testAssertions,
  createMockRoom,
} from "./utils/testUtils";

// Use predefined test scenarios
const { room, bookings } = testScenarios.partiallyBooked;

// Create custom test data
const customRoom = createMockRoom({ name: "Custom Room" });

// Use assertion helpers
expect(testAssertions.hasBooking(bookings, "room-1", "2024-01-15", 10)).toBe(
  true
);
```

## Styling

The component uses CSS classes for styling. Key classes:

- `.booking-calendar`: Main container
- `.date-selector`: Date selection section
- `.hours-grid`: Time slots grid
- `.hour-slot`: Individual time slot
- `.hour-slot.available`: Available slot
- `.hour-slot.booked`: Booked slot
- `.booking-form-overlay`: Modal overlay
- `.booking-form`: Modal content

## Error Handling

- **Error Boundary**: Catches and handles component errors gracefully
- **Validation**: Input validation with user-friendly error messages
- **Loading States**: Visual feedback during async operations
- **Notifications**: Success/error notifications for user actions

## Performance Considerations

- **Memoization**: Components use React.memo where appropriate
- **Callback Optimization**: useCallback for event handlers
- **Lazy Loading**: Components can be lazy loaded
- **Virtual Scrolling**: For large hour ranges (future enhancement)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow the established patterns and principles
2. Maintain TypeScript strict mode compliance
3. Add comprehensive tests for new features
4. Update documentation for API changes
5. Ensure accessibility compliance

## License

MIT License - see LICENSE file for details
