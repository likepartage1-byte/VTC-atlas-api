// DocumentClassifier.ts — Moroccan Driver Document Classification Engine

export type MoroccanDriverDocumentType =
  | 'MOROCCAN_CIN_FRONT'
  | 'MOROCCAN_CIN_BACK'
  | 'MOROCCAN_PASSPORT'
  | 'MOROCCAN_DRIVER_LICENSE_FRONT'
  | 'MOROCCAN_DRIVER_LICENSE_BACK'
  | 'MOROCCAN_CARTE_GRISE_FRONT'
  | 'MOROCCAN_CARTE_GRISE_BACK';

export interface DocumentClassificationResult {
  isSupported: boolean;
  documentType: MoroccanDriverDocumentType | null;
  confidence: number;
  rejectionReason?: string;
  expectedAspectRatio: number; // e.g. ID-1 ratio = 1.586
}

export class DocumentClassifier {
  // Target Aspect Ratios for Official Moroccan Driver Documents
  private static readonly ASPECT_RATIO_CIN = 1.586; // ID-1 format (85.6mm × 53.98mm)
  private static readonly ASPECT_RATIO_PASSPORT = 1.38; // Passport data page (~125mm × 88mm)
  private static readonly ASPECT_RATIO_LICENSE = 1.586; // Moroccan Driver License ID-1 format
  private static readonly ASPECT_RATIO_CARTE_GRISE = 1.42; // Vehicle Registration Card

  public static classify(
    targetCategory: 'cin' | 'passport' | 'license' | 'carte_grise',
    side: 'front' | 'back' | 'passport',
    detectedWidth: number,
    detectedHeight: number
  ): DocumentClassificationResult {
    if (!detectedWidth || !detectedHeight) {
      return {
        isSupported: false,
        documentType: null,
        confidence: 0,
        rejectionReason: 'Invalid document dimensions',
        expectedAspectRatio: 1.586,
      };
    }

    const currentRatio = Math.max(detectedWidth, detectedHeight) / Math.min(detectedWidth, detectedHeight);

    let expectedRatio = this.ASPECT_RATIO_CIN;
    let docType: MoroccanDriverDocumentType = 'MOROCCAN_CIN_FRONT';

    switch (targetCategory) {
      case 'cin':
        expectedRatio = this.ASPECT_RATIO_CIN;
        docType = side === 'back' ? 'MOROCCAN_CIN_BACK' : 'MOROCCAN_CIN_FRONT';
        break;
      case 'passport':
        expectedRatio = this.ASPECT_RATIO_PASSPORT;
        docType = 'MOROCCAN_PASSPORT';
        break;
      case 'license':
        expectedRatio = this.ASPECT_RATIO_LICENSE;
        docType = side === 'back' ? 'MOROCCAN_DRIVER_LICENSE_BACK' : 'MOROCCAN_DRIVER_LICENSE_FRONT';
        break;
      case 'carte_grise':
        expectedRatio = this.ASPECT_RATIO_CARTE_GRISE;
        docType = side === 'back' ? 'MOROCCAN_CARTE_GRISE_BACK' : 'MOROCCAN_CARTE_GRISE_FRONT';
        break;
    }

    // Ratio tolerance check (+/- 0.18)
    const ratioDelta = Math.abs(currentRatio - expectedRatio);
    const isSupported = ratioDelta <= 0.22;

    if (!isSupported) {
      return {
        isSupported: false,
        documentType: null,
        confidence: 0.1,
        rejectionReason: `Unsupported document format. Detected ratio ${currentRatio.toFixed(2)} does not match official Moroccan document specifications (${expectedRatio}).`,
        expectedAspectRatio: expectedRatio,
      };
    }

    const confidence = Math.max(0.5, 1.0 - ratioDelta * 2);

    return {
      isSupported: true,
      documentType: docType,
      confidence,
      expectedAspectRatio: expectedRatio,
    };
  }
}
