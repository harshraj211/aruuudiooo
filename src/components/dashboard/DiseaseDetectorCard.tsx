
'use client';

import { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeCropImageForDisease } from '@/ai/flows/analyze-crop-image-for-disease';
import { Loader2, Upload, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Progress } from '../ui/progress';
import { useTranslation } from '@/hooks/useTranslation';

type AnalysisResult = {
  diseaseDetected: boolean;
  diseaseName: string;
  confidenceLevel: number;
  suggestedSolutions: string;
};

export function DiseaseDetectorCard() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useTranslation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) {
          setError("File size should be less than 4MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!imageDataUri) return;
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const analysisResult = await analyzeCropImageForDisease({
          photoDataUri: imageDataUri,
          language: language,
        });
        setResult(analysisResult);
      } catch (e) {
        console.error(e);
        setError('Failed to analyze image. Please try again.');
      }
    });
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageDataUri(null);
    setResult(null);
    setError(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('diseaseDetectorCard.title')}</CardTitle>
        <CardDescription>
          {t('diseaseDetectorCard.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!imagePreview ? (
          <div
            className="flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{t('diseaseDetectorCard.uploadCTA')}</p>
              <p className="text-xs text-muted-foreground">{t('diseaseDetectorCard.uploadHint')}</p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
            />
          </div>
        ) : (
          <div className="relative w-full max-w-sm mx-auto">
            <Image
              src={imagePreview}
              alt="Crop preview"
              width={400}
              height={300}
              className="rounded-lg object-cover aspect-video"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {error && (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {imagePreview && (
          <div className="flex justify-center">
            <Button onClick={handleAnalyze} disabled={isPending || !imagePreview}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('diseaseDetectorCard.analyzing')}
                </>
              ) : (
                t('diseaseDetectorCard.analyze')
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-lg text-center">{t('diseaseDetectorCard.analysisComplete')}</h3>
            <Alert variant={result.diseaseDetected ? 'destructive' : 'default'}>
                {result.diseaseDetected ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 text-primary" />}
                <AlertTitle>{result.diseaseDetected ? t('diseaseDetectorCard.diseaseDetected') : t('diseaseDetectorCard.noDiseaseDetected')}</AlertTitle>
                <AlertDescription>
                    {result.diseaseDetected ? t('diseaseDetectorCard.issueIdentified') : t('diseaseDetectorCard.cropHealthy')}
                </AlertDescription>
            </Alert>

            {result.diseaseDetected && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>{t('diseaseDetectorCard.detectedDisease')}</CardDescription>
                                <CardTitle className="text-xl">{result.diseaseName}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>{t('diseaseDetectorCard.confidenceLevel')}</CardDescription>
                                <CardTitle className="text-xl">{Math.round(result.confidenceLevel * 100)}%</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Progress value={result.confidenceLevel * 100} />
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('diseaseDetectorCard.suggestedSolutions')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{result.suggestedSolutions}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
