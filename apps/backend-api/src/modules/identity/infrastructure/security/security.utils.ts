import * as crypto from 'crypto';

export class SecurityUtils {
  /**
   * Generates a crypographically secure random token.
   */
  static generateRandomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Hashes a token for secure storage in Redis/DB.
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Compares a plain token with its hash.
   */
  static verifyToken(token: string, hash: string): boolean {
    const hashed = this.hashToken(token);
    return crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(hash));
  }
}
