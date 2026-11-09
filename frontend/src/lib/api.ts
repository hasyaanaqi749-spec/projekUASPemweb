import { demoTrains, demoBookings } from "@/lib/demo-data";
import type { Train, Booking } from "@/types/railink";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getTrains(): Promise<Train[]> {
  await delay(300);
  return demoTrains;
}

export async function getTrainById(
  id: string
): Promise<Train | undefined> {
  await delay(300);
  return demoTrains.find((train) => train.id === id);
}

export async function searchTrains(
  origin: string,
  destination: string
): Promise<Train[]> {
  await delay(300);

  return demoTrains.filter(
    (train) =>
      train.origin.toLowerCase() === origin.toLowerCase() &&
      train.destination.toLowerCase() ===
        destination.toLowerCase()
  );
}

export async function getBookings(): Promise<Booking[]> {
  await delay(300);
  return demoBookings;
}

export async function getBookingById(
  id: string
): Promise<Booking | undefined> {
  await delay(300);
  return demoBookings.find((booking) => booking.id === id);
}

export async function getBookingByCode(
  code: string
): Promise<Booking | undefined> {
  await delay(300);
  return demoBookings.find((booking) => booking.code === code);
}