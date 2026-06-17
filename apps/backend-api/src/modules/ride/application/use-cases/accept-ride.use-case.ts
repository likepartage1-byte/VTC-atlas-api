import { Injectable, UnauthorizedException, ConflictException, Inject, Logger } from '@nestjs/common';
import type { IRideRepository } from '../../domain/repositories/ride.repository.interface';
import { AssignmentLockService } from '../../infrastructure/services/assignment-lock.service';
import { DispatchSessionManager } from '../../../dispatch/application/services/dispatch-session.manager';
import { SocketGateway } from '../../../realtime/presentation/gateways/socket.gateway';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RideStatus } from '../../domain/entities/ride-status.enum';

@Injectable()
export class AcceptRideUseCase {
  private readonly logger = new Logger(AcceptRideUseCase.name);

  constructor(
    @Inject('IRideRepository') private readonly rideRepository: IRideRepository,
    private readonly lockService: AssignmentLockService,
    private readonly sessionManager: DispatchSessionManager,
    private readonly socketGateway: SocketGateway,
    private readonly prisma: PrismaService,
  ) {}

  async execute(rideId: string, driverId: string) {
    this.logger.log(`[WinnerEngine] Driver ${driverId} is attempting to CLAIM ride ${rideId}`);

    // 1. ATOMIC LOCK CHECK (Race Prevention at Redis Layer)
    const lockSecured = await this.lockService.claimRide(rideId, driverId);
    if (!lockSecured) {
      throw new ConflictException('RIDE.ERRORS.ALREADY_ACCEPTED_BY_ANOTHER');
    }

    try {
      // 2. THE FINAL AUTHORITY: DB Transaction Boundary
      return await this.prisma.$transaction(async (tx) => {
        const ride = await this.rideRepository.findById(rideId, tx);
        
        // Final sanity check: Is the ride still dispatched?
        if (!ride || ride.status !== RideStatus.DISPATCHED) {
          throw new ConflictException('RIDE.ERRORS.INVALID_STATE_OR_ALREADY_TAKEN');
        }

        // 3. TRANSITION TO OWNERSHIP
        ride.driverId = driverId;
        ride.transitionTo(RideStatus.DRIVER_ACCEPTED);
        await this.rideRepository.save(ride, tx);

        // 4. THE KILL SWITCH: Terminate Dispatch Session
        await this.sessionManager.completeSession(rideId);

        // 5. CLEANUP: Tell other candidates to back off
        this.broadcastRejectionToOthers(rideId, driverId);

        this.logger.log(`[WinnerEngine] 👑 Winner determined: Driver ${driverId} owns Ride ${rideId}`);

        return {
          status: 'WINNER',
          rideId,
          message: 'RIDE.MESSAGES.YOU_WON_THE_RIDE'
        };
      });
    } catch (error) {
      await this.lockService.releaseLock(rideId);
      throw error;
    }
  }

  private async broadcastRejectionToOthers(rideId: string, winnerId: string) {
    // Broadly emit to the 'ride room' or individually (Optimized approach depends on Scale)
    // For now, we emit to the namespace that the ride is taken
    this.socketGateway.server.emit(`ride.taken`, { rideId, winnerId });
  }
}
