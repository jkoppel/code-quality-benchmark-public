/**
 * Observer pattern for booking events
 */

export type EventType = 
  | 'booking.created'
  | 'booking.cancelled'
  | 'booking.updated'
  | 'room.selected'
  | 'date.changed';

export interface EventData {
  type: EventType;
  payload: any;
  timestamp: Date;
}

export interface Observer {
  update(event: EventData): void;
}

export class EventManager {
  private observers: Map<EventType, Set<Observer>> = new Map();
  
  subscribe(eventType: EventType, observer: Observer): void {
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, new Set());
    }
    this.observers.get(eventType)!.add(observer);
  }
  
  unsubscribe(eventType: EventType, observer: Observer): void {
    this.observers.get(eventType)?.delete(observer);
  }
  
  notify(event: EventData): void {
    const observers = this.observers.get(event.type);
    if (observers) {
      observers.forEach(observer => observer.update(event));
    }
  }
}

// Singleton instance
export const eventManager = new EventManager();

/**
 * Example observer implementations
 */
export class BookingLogger implements Observer {
  update(event: EventData): void {
    console.log(`[${event.timestamp.toISOString()}] ${event.type}:`, event.payload);
  }
}

export class BookingAnalytics implements Observer {
  private bookingCount = 0;
  private cancellationCount = 0;
  
  update(event: EventData): void {
    switch (event.type) {
      case 'booking.created':
        this.bookingCount++;
        break;
      case 'booking.cancelled':
        this.cancellationCount++;
        break;
    }
  }
  
  getStats() {
    return {
      totalBookings: this.bookingCount,
      totalCancellations: this.cancellationCount,
      cancellationRate: this.bookingCount > 0 
        ? (this.cancellationCount / this.bookingCount) * 100 
        : 0
    };
  }
}