import { Injectable } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { SafeSearchResult } from './types/safe-search-result.type';

@Injectable()
export class GoogleVisionService {
  private client: ImageAnnotatorClient;
  

  constructor() {
    this.client = new ImageAnnotatorClient({
      keyFilename: 'google-key-cloud-vision.json', // o una ruta desde variable de entorno
    });
  }

  async analizarImagen(imageUrl: string): Promise<SafeSearchResult> {
    const [result] = await this.client.safeSearchDetection(imageUrl);
    const annotation = result.safeSearchAnnotation;

      if (!annotation) {
    return { advertencia: false };
  }

  // ⚠️ Normalizamos todo forzando a string, o lo dejamos como undefined
  const parseLikelihood = (val: any): string | undefined => {
    return typeof val === 'string' ? val : val?.toString();
  };

  const adult = parseLikelihood(annotation.adult);
  const violence = parseLikelihood(annotation.violence);
  const medical = parseLikelihood(annotation.medical);
  const spoof = parseLikelihood(annotation.spoof);
  const racy = parseLikelihood(annotation.racy);

  const advertencia =
    ['POSSIBLE', 'LIKELY', 'VERY_LIKELY'].includes(adult || '') ||
    ['POSSIBLE', 'LIKELY', 'VERY_LIKELY'].includes(violence || '') ||
    ['LIKELY', 'VERY_LIKELY'].includes(medical || '') ||
    ['POSSIBLE', 'LIKELY'].includes(racy || '');

  return {
    adult,
    violence,
    medical,
    spoof,
    racy,
    advertencia,
  };
  }
}
