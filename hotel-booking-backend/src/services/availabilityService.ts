import Booking, { IBooking } from '../models/booking';

interface AvailabilityResult {
  available: boolean;
  conflicts: IBooking[];
}

export const checkAvailability = async (
  hotelId: string,
  checkIn: Date,
  checkOut: Date,
  roomIds: string[],
  cottageIds: string[]
): Promise<AvailabilityResult> => {
  // Query for overlapping confirmed/pending bookings
  const overlappingBookings = await Booking.find({
    hotelId,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      }
    ]
  });

  const conflicts: IBooking[] = [];

  // Check for room conflicts
  if (roomIds && roomIds.length > 0) {
    for (const booking of overlappingBookings) {
      if (booking.selectedRooms) {
        const bookingRoomIds = booking.selectedRooms.map(room => room.id);
        const hasConflict = roomIds.some(roomId => bookingRoomIds.includes(roomId));
        if (hasConflict && !conflicts.includes(booking)) {
          conflicts.push(booking);
        }
      }
    }
  }

  // Check for cottage conflicts
  if (cottageIds && cottageIds.length > 0) {
    for (const booking of overlappingBookings) {
      if (booking.selectedCottages) {
        const bookingCottageIds = booking.selectedCottages.map(cottage => cottage.id);
        const hasConflict = cottageIds.some(cottageId => bookingCottageIds.includes(cottageId));
        if (hasConflict && !conflicts.includes(booking)) {
          conflicts.push(booking);
        }
      }
    }
  }

  return {
    available: conflicts.length === 0,
    conflicts
  };
};