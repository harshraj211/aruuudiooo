
'use client';

import { DiseaseDetectorCard } from "@/components/dashboard/DiseaseDetectorCard";
import { useTranslation } from "@/hooks/useTranslation";

export default function DiseaseDetectionPage() {
  const { t } = useTranslation();

  return (
    <main>
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">{t('diseaseDetectionPage.titleFruit')}</h1>
        <p className="text-muted-foreground">
          {t('diseaseDetectionPage.descriptionFruit')}
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <DiseaseDetectorCard itemType="Fruit" />
      </div>
    </main>
  );
}
