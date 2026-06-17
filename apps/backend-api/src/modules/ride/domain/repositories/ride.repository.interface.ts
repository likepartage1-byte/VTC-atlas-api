import { Ride } from '../entities/ride.entity';

export interface IRideRepository {
  /**
   * Supports both direct injection (mock/no-tx) and prisma transactions.
   */
  save(ride: Ride, tx?: any): Promise<void>;
  findById(id: string, tx?: any): Promise<Ride | null>;
  findActiveByPassengerId(passengerId: string, tx?: any): Promise<Ride | null>;
  findActiveByDriverId(driverId: string, tx?: any): Promise<Ride | null>;
  updateStatus(id: string, status: string, tx?: any): Promise<void>;
}
