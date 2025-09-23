
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Leaf, Sprout, TestTube2, SprayCan, BrainCircuit, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// --- Mock Data (In a real app, this would come from Firestore) ---
const cropData: Record<string, any> = {
    // Existing Crops
    rice: { type: 'crop', fertilizer: { npk: '15-15-15', urea: 45, dap: 20, potash: 15 }, pesticides: { 'brown-planthopper': { name: 'Buprofezin', dosageMlPerLitre: 1.5 }, 'leaf-blast': { name: 'Tricyclazole', dosageMlPerLitre: 0.6 }, 'stem-borer': { name: 'Cartap Hydrochloride', dosageMlPerLitre: 1 }, }, seedRateKgPerAcre: 20, },
    wheat: { type: 'crop', fertilizer: { npk: '20-20-20', urea: 50, dap: 25, potash: 20 }, pesticides: { rust: { name: 'Propiconazole', dosageMlPerLitre: 1 }, aphids: { name: 'Imidacloprid', dosageMlPerLitre: 0.5 }, termites: { name: 'Chlorpyrifos', dosageMlPerLitre: 2 }, }, seedRateKgPerAcre: 40, },
    maize: { type: 'crop', fertilizer: { npk: '25-10-15', urea: 55, dap: 30, potash: 20 }, pesticides: { 'fall-armyworm': { name: 'Emamectin Benzoate', dosageMlPerLitre: 0.4 }, 'stalk-borer': { name: 'Thiamethoxam', dosageMlPerLitre: 0.5 }, }, seedRateKgPerAcre: 8, },
    barley: { type: 'crop', fertilizer: { npk: '60-30-20', urea: 45, dap: 25, potash: 15 }, pesticides: { 'loose-smut': { name: 'Carboxin', dosageMlPerLitre: 2 }, 'aphids': { name: 'Imidacloprid', dosageMlPerLitre: 0.6 }, }, seedRateKgPerAcre: 40, },
    'jowar (sorghum)': { type: 'crop', fertilizer: { npk: '80-40-40', urea: 60, dap: 35, potash: 30 }, pesticides: { 'stem-borer': { name: 'Carbofuran', dosageMlPerLitre: 1.2 }, 'grain-smut': { name: 'Thiram', dosageMlPerLitre: 2.5 }, }, seedRateKgPerAcre: 4, },
    'bajra (pearl millet)': { type: 'crop', fertilizer: { npk: '40-20-0', urea: 35, dap: 18, potash: 0 }, pesticides: { 'shoot-fly': { name: 'Thiamethoxam', dosageMlPerLitre: 0.4 }, 'downy-mildew': { name: 'Metalaxyl', dosageMlPerLitre: 2 }, }, seedRateKgPerAcre: 1.5, },
    oats: { type: 'crop', fertilizer: { npk: '60-30-30', urea: 50, dap: 25, potash: 25 }, pesticides: { 'leaf-blight': { name: 'Mancozeb', dosageMlPerLitre: 2 }, 'aphids': { name: 'Imidacloprid', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 30, },
    'ragi (finger millet)': { type: 'crop', fertilizer: { npk: '40-20-20', urea: 30, dap: 20, potash: 20 }, pesticides: { 'blast': { name: 'Carbendazim', dosageMlPerLitre: 1 }, 'shoot-fly': { name: 'Dimethoate', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 4, },
    'arhar (tur / pigeon pea)': { type: 'crop', fertilizer: { npk: '20-40-20', urea: 15, dap: 35, potash: 20 }, pesticides: { 'pod-borer': { name: 'Emamectin Benzoate', dosageMlPerLitre: 0.4 }, 'wilt': { name: 'Trichoderma viride', dosageMlPerLitre: 5 } }, seedRateKgPerAcre: 5, },
    'moong (green gram)': { type: 'crop', fertilizer: { npk: '20-40-0', urea: 15, dap: 35, potash: 0 }, pesticides: { 'yellow-mosaic-virus': { name: 'Thiamethoxam', dosageMlPerLitre: 0.3 }, 'pod-borer': { name: 'Indoxacarb', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 8, },
    'urad (black gram)': { type: 'crop', fertilizer: { npk: '20-40-0', urea: 15, dap: 35, potash: 0 }, pesticides: { 'yellow-mosaic-virus': { name: 'Imidacloprid', dosageMlPerLitre: 0.5 }, 'powdery-mildew': { name: 'Wettable Sulphur', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 8, },
    'masoor (lentil)': { type: 'crop', fertilizer: { npk: '20-60-20', urea: 15, dap: 45, potash: 20 }, pesticides: { 'rust': { name: 'Mancozeb', dosageMlPerLitre: 2 }, 'aphids': { name: 'Dimethoate', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 25, },
    'chana (bengal gram)': { type: 'crop', fertilizer: { npk: '20-60-20', urea: 20, dap: 40, potash: 20 }, pesticides: { 'pod-borer': { name: 'Spinosad', dosageMlPerLitre: 0.3 }, 'wilt': { name: 'Benomyl', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 30, },
    'rajma (kidney beans)': { type: 'crop', fertilizer: { npk: '30-60-30', urea: 25, dap: 50, potash: 25 }, pesticides: { 'bean-rust': { name: 'Hexaconazole', dosageMlPerLitre: 1 }, 'aphids': { name: 'Imidacloprid', dosageMlPerLitre: 0.7 } }, seedRateKgPerAcre: 40, },
    'moth bean': { type: 'crop', fertilizer: { npk: '10-20-0', urea: 10, dap: 15, potash: 0 }, pesticides: { 'whitefly': { name: 'Acetamiprid', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 6, },
    'horse gram': { type: 'crop', fertilizer: { npk: '10-25-10', urea: 10, dap: 20, potash: 10 }, pesticides: { 'powdery-mildew': { name: 'Carbendazim', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 12, },
    cowpea: { type: 'crop', fertilizer: { npk: '20-60-20', urea: 18, dap: 50, potash: 18 }, pesticides: { 'aphids': { name: 'Dimethoate', dosageMlPerLitre: 1.5 }, 'pod-borer': { name: 'Chlorpyrifos', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 10, },
    cotton: { type: 'crop', fertilizer: { npk: '30-15-15', urea: 65, dap: 40, potash: 25 }, pesticides: { bollworm: { name: 'Spinosad', dosageMlPerLitre: 0.3 }, 'white-fly': { name: 'Diafenthiuron', dosageMlPerLitre: 1.2 }, }, seedRateKgPerAcre: 3, },
    sugarcane: { type: 'crop', fertilizer: { npk: '18-18-18', urea: 100, dap: 50, potash: 40 }, pesticides: { 'early-shoot-borer': { name: 'Fipronil', dosageMlPerLitre: 2 }, 'mealy-bug': { name: 'Profenofos', dosageMlPerLitre: 1.5 }, }, seedRateKgPerAcre: 2000, },
    jute: { type: 'crop', fertilizer: { npk: '40-20-20', urea: 35, dap: 18, potash: 18 }, pesticides: { 'stem-weevil': { name: 'Endosulfan', dosageMlPerLitre: 2 }, 'yellow-mite': { name: 'Propargite', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 3, },
    tobacco: { type: 'crop', fertilizer: { npk: '100-50-50', urea: 80, dap: 40, potash: 40 }, pesticides: { 'budworm': { name: 'Spinosad', dosageMlPerLitre: 0.4 }, 'mosaic-virus': { name: 'Vector control (aphids)', dosageMlPerLitre: 0 } }, seedRateKgPerAcre: 0.1, },
    'groundnut (peanut)': { type: 'crop', fertilizer: { npk: '20-40-40', urea: 15, dap: 35, potash: 30 }, pesticides: { 'leaf-miner': { name: 'Dimethoate', dosageMlPerLitre: 1.5 }, 'white-grub': { name: 'Chlorpyrifos', dosageMlPerLitre: 2.5 }, }, seedRateKgPerAcre: 40, },
    sunflower: { type: 'crop', fertilizer: { npk: '60-90-60', urea: 40, dap: 70, potash: 50 }, pesticides: { 'head-borer': { name: 'Indoxacarb', dosageMlPerLitre: 0.5 }, 'alternaria-blight': { name: 'Mancozeb', dosageMlPerLitre: 2.5 }, }, seedRateKgPerAcre: 2.5, },
    soybean: { type: 'crop', fertilizer: { npk: '20-60-20', urea: 20, dap: 40, potash: 20 }, pesticides: { 'girdle-beetle': { name: 'Thiamethoxam', dosageMlPerLitre: 0.5 }, 'white-fly': { name: 'Imidacloprid', dosageMlPerLitre: 0.7 }, }, seedRateKgPerAcre: 30, },
    mustard: { type: 'crop', fertilizer: { npk: '60-30-30', urea: 50, dap: 25, potash: 25 }, pesticides: { 'mustard-aphid': { name: 'Oxydemeton-methyl', dosageMlPerLitre: 1 }, sawfly: { name: 'Quinalphos', dosageMlPerLitre: 1.5 }, }, seedRateKgPerAcre: 2, },
    'sesame (til)': { type: 'crop', fertilizer: { npk: '30-15-0', urea: 25, dap: 12, potash: 0 }, pesticides: { 'leaf-roller': { name: 'Quinalphos', dosageMlPerLitre: 1.5 } }, seedRateKgPerAcre: 2, },
    'linseed (flax)': { type: 'crop', fertilizer: { npk: '40-20-0', urea: 35, dap: 18, potash: 0 }, pesticides: { 'rust': { name: 'Mancozeb', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 10, },
    castor: { type: 'crop', fertilizer: { npk: '40-40-20', urea: 30, dap: 35, potash: 18 }, pesticides: { 'capsule-borer': { name: 'Quinalphos', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 4, },
    potato: { type: 'crop', fertilizer: { npk: '120-60-60', urea: 100, dap: 50, potash: 50 }, pesticides: { 'late-blight': { name: 'Mancozeb', dosageMlPerLitre: 2.5 }, 'potato-tuber-moth': { name: 'Cypermethrin', dosageMlPerLitre: 1 }, }, seedRateKgPerAcre: 800, },
    onion: { type: 'crop', fertilizer: { npk: '100-50-50', urea: 80, dap: 40, potash: 40 }, pesticides: { thrips: { name: 'Fipronil', dosageMlPerLitre: 1 }, 'purple-blotch': { name: 'Mancozeb', dosageMlPerLitre: 2 }, }, seedRateKgPerAcre: 4, },
    tomato: { type: 'crop', fertilizer: { npk: '100-60-60', urea: 80, dap: 50, potash: 50 }, pesticides: { 'fruit-borer': { name: 'Emamectin Benzoate', dosageMlPerLitre: 0.5 }, 'early-blight': { name: 'Copper Oxychloride', dosageMlPerLitre: 2.5 }, }, seedRateKgPerAcre: 0.2, },
    'brinjal (eggplant)': { type: 'crop', fertilizer: { npk: '100-50-50', urea: 80, dap: 40, potash: 40 }, pesticides: { 'shoot-and-fruit-borer': { name: 'Cypermethrin', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 0.2, },
    cauliflower: { type: 'crop', fertilizer: { npk: '120-60-60', urea: 100, dap: 50, potash: 50 }, pesticides: { 'diamondback-moth': { name: 'Spinosad', dosageMlPerLitre: 0.3 } }, seedRateKgPerAcre: 0.25, },
    cabbage: { type: 'crop', fertilizer: { npk: '150-80-80', urea: 120, dap: 60, potash: 60 }, pesticides: { 'cabbage-borer': { name: 'Emamectin Benzoate', dosageMlPerLitre: 0.4 } }, seedRateKgPerAcre: 0.2, },
    carrot: { type: 'crop', fertilizer: { npk: '60-40-40', urea: 50, dap: 35, potash: 35 }, pesticides: { 'carrot-rust-fly': { name: 'Chlorpyrifos', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 3, },
    radish: { type: 'crop', fertilizer: { npk: '50-50-50', urea: 40, dap: 40, potash: 40 }, pesticides: { 'aphids': { name: 'Imidacloprid', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 4, },
    'okra (ladyfinger)': { type: 'crop', fertilizer: { npk: '80-40-40', urea: 60, dap: 35, potash: 35 }, pesticides: { 'yellow-vein-mosaic': { name: 'Vector control (whitefly)', dosageMlPerLitre: 0 } }, seedRateKgPerAcre: 4, },
    'bottle gourd': { type: 'crop', fertilizer: { npk: '70-50-50', urea: 60, dap: 40, potash: 40 }, pesticides: { 'fruit-fly': { name: 'Malathion', dosageMlPerLitre: 1.5 } }, seedRateKgPerAcre: 1.5, },
    'bitter gourd': { type: 'crop', fertilizer: { npk: '70-50-50', urea: 60, dap: 40, potash: 40 }, pesticides: { 'downy-mildew': { name: 'Mancozeb', dosageMlPerLitre: 2.5 } }, seedRateKgPerAcre: 2, },
    pumpkin: { type: 'crop', fertilizer: { npk: '80-60-60', urea: 70, dap: 50, potash: 50 }, pesticides: { 'pumpkin-beetle': { name: 'Carbaryl', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 1.5, },
    spinach: { type: 'crop', fertilizer: { npk: '80-40-40', urea: 60, dap: 35, potash: 35 }, pesticides: { 'leaf-miner': { name: 'Dimethoate', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 10, },
    peas: { type: 'crop', fertilizer: { npk: '20-60-40', urea: 15, dap: 50, potash: 35 }, pesticides: { 'powdery-mildew': { name: 'Wettable Sulphur', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 40, },
    beans: { type: 'crop', fertilizer: { npk: '30-60-30', urea: 25, dap: 50, potash: 25 }, pesticides: { 'anthracnose': { name: 'Carbendazim', dosageMlPerLitre: 1.5 } }, seedRateKgPerAcre: 25, },
    chillies: { type: 'crop', fertilizer: { npk: '120-60-60', urea: 100, dap: 50, potash: 50 }, pesticides: { 'thrips': { name: 'Fipronil', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 0.4, },
    capsicum: { type: 'crop', fertilizer: { npk: '150-80-80', urea: 120, dap: 60, potash: 60 }, pesticides: { 'anthracnose': { name: 'Copper Oxychloride', dosageMlPerLitre: 2.5 } }, seedRateKgPerAcre: 0.2, },
    garlic: { type: 'crop', fertilizer: { npk: '100-50-50', urea: 80, dap: 40, potash: 40 }, pesticides: { 'thrips': { name: 'Profenofos', dosageMlPerLitre: 1.5 } }, seedRateKgPerAcre: 200, },
    ginger: { type: 'crop', fertilizer: { npk: '75-50-50', urea: 60, dap: 40, potash: 40 }, pesticides: { 'rhizome-rot': { name: 'Metalaxyl + Mancozeb', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 700, },
    turmeric: { type: 'crop', fertilizer: { npk: '60-30-90', urea: 50, dap: 25, potash: 80 }, pesticides: { 'leaf-spot': { name: 'Mancozeb', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 800, },
    coriander: { type: 'crop', fertilizer: { npk: '40-20-20', urea: 35, dap: 18, potash: 18 }, pesticides: { 'powdery-mildew': { name: 'Carbendazim', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 8, },
    cumin: { type: 'crop', fertilizer: { npk: '30-20-0', urea: 25, dap: 18, potash: 0 }, pesticides: { 'blight': { name: 'Mancozeb', dosageMlPerLitre: 2.5 } }, seedRateKgPerAcre: 5, },
    fennel: { type: 'crop', fertilizer: { npk: '40-40-0', urea: 35, dap: 35, potash: 0 }, pesticides: { 'aphids': { name: 'Imidacloprid', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 4, },
    fenugreek: { type: 'crop', fertilizer: { npk: '20-40-20', urea: 15, dap: 35, potash: 18 }, pesticides: { 'powdery-mildew': { name: 'Dinocap', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 10, },
    'black pepper': { type: 'crop', fertilizer: { npk: '10-10-10', urea: 10, dap: 10, potash: 10 }, pesticides: { 'quick-wilt': { name: 'Metalaxyl', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0, },
    cardamom: { type: 'crop', fertilizer: { npk: '75-75-150', urea: 60, dap: 60, potash: 120 }, pesticides: { 'thrips': { name: 'Fipronil', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 0, },
    cloves: { type: 'crop', fertilizer: { npk: '20-20-25', urea: 18, dap: 18, potash: 20 }, pesticides: { 'leaf-spot': { name: 'Carbendazim', dosageMlPerLitre: 1.5 } }, seedRateKgPerAcre: 0, },
    cinnamon: { type: 'crop', fertilizer: { npk: '20-20-25', urea: 18, dap: 18, potash: 20 }, pesticides: { 'leaf-blight': { name: 'Mancozeb', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0, },
    'mustard seeds': { type: 'crop', fertilizer: { npk: '60-30-30', urea: 50, dap: 25, potash: 25 }, pesticides: { 'aphid': { name: 'Imidacloprid', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 2, },
    'ajwain (carom seeds)': { type: 'crop', fertilizer: { npk: '20-20-0', urea: 18, dap: 18, potash: 0 }, pesticides: { 'powdery-mildew': { name: 'Wettable Sulphur', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 4, },
    dill: { type: 'crop', fertilizer: { npk: '30-15-15', urea: 25, dap: 12, potash: 12 }, pesticides: { 'aphids': { name: 'Dimethoate', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 4, },
    tea: { type: 'crop', fertilizer: { npk: '20-10-20', urea: 15, dap: 8, potash: 18 }, pesticides: { 'tea-mosquito-bug': { name: 'Lambda-Cyhalothrin', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 0, },
    coffee: { type: 'crop', fertilizer: { npk: '15-10-15', urea: 12, dap: 8, potash: 12 }, pesticides: { 'white-stem-borer': { name: 'Chlorpyrifos', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0, },
    rubber: { type: 'crop', fertilizer: { npk: '12-12-12', urea: 10, dap: 10, potash: 10 }, pesticides: { 'abnormal-leaf-fall': { name: 'Copper Oxychloride', dosageMlPerLitre: 2.5 } }, seedRateKgPerAcre: 0, },
    cocoa: { type: 'crop', fertilizer: { npk: '15-15-15', urea: 30, dap: 25, potash: 30 }, pesticides: { 'tea-mosquito-bug': { name: 'Imidacloprid', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 0, },
    
    // Existing Fruits
    mango: { type: 'fruit', fertilizer: { npk: '10-10-10', urea: 30, dap: 15, potash: 30 }, pesticides: { 'powdery-mildew': { name: 'Hexaconazole', dosageMlPerLitre: 1 }, 'fruit-fly': { name: 'Spinosad', dosageMlPerLitre: 0.3 }, 'mealy-bug': { name: 'Buprofezin', dosageMlPerLitre: 1.5 }, }, seedRateKgPerAcre: 0, },
    apple: { type: 'fruit', fertilizer: { npk: '12-15-12', urea: 35, dap: 20, potash: 25 }, pesticides: { scab: { name: 'Myclobutanil', dosageMlPerLitre: 0.5 }, 'codling-moth': { name: 'Deltamethrin', dosageMlPerLitre: 0.7 }, }, seedRateKgPerAcre: 0, },
    banana: { type: 'fruit', fertilizer: { npk: '19-19-19', urea: 80, dap: 40, potash: 100 }, pesticides: { 'pseudostem-weevil': { name: 'Chlorpyrifos', dosageMlPerLitre: 2.5 }, 'panama-wilt': { name: 'Carbendazim', dosageMlPerLitre: 1 }, }, seedRateKgPerAcre: 0, },
    grapes: { type: 'fruit', fertilizer: { npk: '15-15-20', urea: 20, dap: 30, potash: 40 }, pesticides: { 'downy-mildew': { name: 'Mancozeb + Metalaxyl', dosageMlPerLitre: 2 }, 'flea-beetle': { name: 'Imidacloprid', dosageMlPerLitre: 0.4 }, }, seedRateKgPerAcre: 0, },
    pomegranate: { type: 'fruit', fertilizer: { npk: '10-10-10', urea: 25, dap: 15, potash: 20 }, pesticides: { 'bacterial-blight': { name: 'Streptocycline', dosageMlPerLitre: 0.5 }, 'fruit-borer': { name: 'Lambda-Cyhalothrin', dosageMlPerLitre: 0.7 }, }, seedRateKgPerAcre: 0, },
    guava: { type: 'fruit', fertilizer: { npk: '15-10-15', urea: 20, dap: 10, potash: 15 }, pesticides: { 'fruit-fly': { name: 'Methyl Eugenol Trap', dosageMlPerLitre: 0 }, 'wilt-disease': { name: 'Trichoderma viride', dosageMlPerLitre: 5 }, }, seedRateKgPerAcre: 0, },
    papaya: { type: 'fruit', fertilizer: { npk: '20-20-25', urea: 30, dap: 25, potash: 30 }, pesticides: { 'ringspot-virus': { name: 'Vector control (aphids)', dosageMlPerLitre: 0 }, 'mealy-bug': { name: 'Lecanicillium lecanii', dosageMlPerLitre: 2 }, }, seedRateKgPerAcre: 0.1, },
    lemon: { type: 'fruit', fertilizer: { npk: '20-10-10', urea: 40, dap: 20, potash: 25 }, pesticides: { 'citrus-canker': { name: 'Streptomycin Sulfate', dosageMlPerLitre: 0.5 }, 'leaf-miner': { name: 'Imidacloprid', dosageMlPerLitre: 0.7 } }, seedRateKgPerAcre: 0, },
    fig: { type: 'fruit', fertilizer: { npk: '15-15-15', urea: 25, dap: 15, potash: 20 }, pesticides: { 'rust': { name: 'Mancozeb', dosageMlPerLitre: 2 }, 'stem-borer': { name: 'Chlorpyrifos', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0, },
    pineapple: { type: 'fruit', fertilizer: { npk: '10-5-20', urea: 50, dap: 25, potash: 60 }, pesticides: { 'mealybug-wilt': { name: 'Diazinon', dosageMlPerLitre: 1.5 }, 'heart-rot': { name: 'Metalaxyl', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0, },
    litchi: { type: 'fruit', fertilizer: { npk: '10-20-20', urea: 30, dap: 25, potash: 35 }, pesticides: { 'fruit-borer': { name: 'Cypermethrin', dosageMlPerLitre: 1 }, 'leaf-curl': { name: 'Dimethoate', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 0, },
    jackfruit: { type: 'fruit', fertilizer: { npk: '10-10-15', urea: 40, dap: 20, potash: 30 }, pesticides: { 'shoot-borer': { name: 'Profenofos', dosageMlPerLitre: 1.5 }, 'fruit-rot': { name: 'Mancozeb', dosageMlPerLitre: 2.5 } }, seedRateKgPerAcre: 0, },
    amla: { type: 'fruit', fertilizer: { npk: '10-10-10', urea: 20, dap: 10, potash: 15 }, pesticides: { 'rust': { name: 'Wettable Sulphur', dosageMlPerLitre: 2 }, 'bark-eating-caterpillar': { name: 'Dichlorvos', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 0, },
    orange: { type: 'fruit', fertilizer: { npk: '15-10-15', urea: 20, dap: 10, potash: 15 }, pesticides: { 'citrus-psylla': { name: 'Dimethoate', dosageMlPerLitre: 1.5 } } , seedRateKgPerAcre: 0,},

    // New Fruits
    pear: { type: 'fruit', fertilizer: { npk: '10-12-10', urea: 30, dap: 18, potash: 20 }, pesticides: { 'pear-psylla': { name: 'Abamectin', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 0 },
    peach: { type: 'fruit', fertilizer: { npk: '10-15-15', urea: 32, dap: 20, potash: 22 }, pesticides: { 'leaf-curl': { name: 'Ziram', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0 },
    plum: { type: 'fruit', fertilizer: { npk: '10-10-10', urea: 28, dap: 15, potash: 18 }, pesticides: { 'plum-aphid': { name: 'Imidacloprid', dosageMlPerLitre: 0.6 } }, seedRateKgPerAcre: 0 },
    apricot: { type: 'fruit', fertilizer: { npk: '10-12-10', urea: 25, dap: 15, potash: 15 }, pesticides: { 'shot-hole-borer': { name: 'Chlorpyrifos', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0 },
    'sweet lime (mosambi)': { type: 'fruit', fertilizer: { npk: '15-10-15', urea: 22, dap: 12, potash: 18 }, pesticides: { 'citrus-canker': { name: 'Streptomycin Sulfate', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 0 },
    mandarin: { type: 'fruit', fertilizer: { npk: '15-10-15', urea: 21, dap: 11, potash: 16 }, pesticides: { 'citrus-psylla': { name: 'Dimethoate', dosageMlPerLitre: 1.5 } }, seedRateKgPerAcre: 0 },
    'sapota (chikoo)': { type: 'fruit', fertilizer: { npk: '10-10-15', urea: 20, dap: 10, potash: 20 }, pesticides: { 'fruit-fly': { name: 'Methyl Eugenol Trap', dosageMlPerLitre: 0 } }, seedRateKgPerAcre: 0 },
    'jamun (black plum)': { type: 'fruit', fertilizer: { npk: '10-8-10', urea: 15, dap: 8, potash: 12 }, pesticides: { 'leaf-webber': { name: 'Carbaryl', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0 },
    'custard apple (sitaphal)': { type: 'fruit', fertilizer: { npk: '10-10-10', urea: 18, dap: 10, potash: 15 }, pesticides: { 'mealy-bug': { name: 'Buprofezin', dosageMlPerLitre: 1.5 } }, seedRateKgPerAcre: 0 },
    'ber (indian jujube)': { type: 'fruit', fertilizer: { npk: '10-5-5', urea: 12, dap: 5, potash: 8 }, pesticides: { 'fruit-fly': { name: 'Spinosad', dosageMlPerLitre: 0.3 } }, seedRateKgPerAcre: 0 },
    mulberry: { type: 'fruit', fertilizer: { npk: '12-6-6', urea: 15, dap: 8, potash: 10 }, pesticides: { 'powdery-mildew': { name: 'Wettable Sulphur', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0 },
    strawberry: { type: 'fruit', fertilizer: { npk: '12-12-12', urea: 25, dap: 15, potash: 20 }, pesticides: { 'botrytis': { name: 'Captan', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0 },
    kiwi: { type: 'fruit', fertilizer: { npk: '10-15-15', urea: 20, dap: 18, potash: 22 }, pesticides: { 'root-rot': { name: 'Metalaxyl', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0 },
    avocado: { type: 'fruit', fertilizer: { npk: '10-8-12', urea: 18, dap: 10, potash: 15 }, pesticides: { 'persea-mite': { name: 'Abamectin', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 0 },
    'dragon fruit': { type: 'fruit', fertilizer: { npk: '10-10-10', urea: 15, dap: 10, potash: 12 }, pesticides: { 'anthracnose': { name: 'Mancozeb', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0 },
    'passion fruit': { type: 'fruit', fertilizer: { npk: '10-5-20', urea: 18, dap: 8, potash: 25 }, pesticides: { 'fruit-fly': { name: 'Malathion', dosageMlPerLitre: 1.5 } }, seedRateKgPerAcre: 0 },
    watermelon: { type: 'fruit', fertilizer: { npk: '8-10-10', urea: 20, dap: 15, potash: 18 }, pesticides: { 'downy-mildew': { name: 'Mancozeb', dosageMlPerLitre: 2.5 } }, seedRateKgPerAcre: 1, },
    'muskmelon (cantaloupe)': { type: 'fruit', fertilizer: { npk: '8-10-10', urea: 22, dap: 18, potash: 20 }, pesticides: { 'powdery-mildew': { name: 'Wettable Sulphur', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 1, },
    'starfruit (carambola)': { type: 'fruit', fertilizer: { npk: '10-5-10', urea: 15, dap: 8, potash: 12 }, pesticides: { 'fruit-fly': { name: 'Spinosad', dosageMlPerLitre: 0.3 } }, seedRateKgPerAcre: 0 },
    'bael (wood apple)': { type: 'fruit', fertilizer: { npk: '5-5-5', urea: 10, dap: 5, potash: 8 }, pesticides: { 'fruit-rot': { name: 'Carbendazim', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 0 },
    phalsa: { type: 'fruit', fertilizer: { npk: '5-5-5', urea: 8, dap: 5, potash: 6 }, pesticides: { 'leaf-spot': { name: 'Mancozeb', dosageMlPerLitre: 2 } }, seedRateKgPerAcre: 0 },
    karonda: { type: 'fruit', fertilizer: { npk: '5-5-5', urea: 10, dap: 5, potash: 8 }, pesticides: { 'anthracnose': { name: 'Carbendazim', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 0 },
    raspberry: { type: 'fruit', fertilizer: { npk: '10-10-10', urea: 15, dap: 10, potash: 12 }, pesticides: { 'cane-borer': { name: 'Fenpropathrin', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 0 },
    blueberry: { type: 'fruit', fertilizer: { npk: '10-10-10', urea: 12, dap: 8, potash: 10 }, pesticides: { 'mummy-berry': { name: 'Fenbuconazole', dosageMlPerLitre: 1 } }, seedRateKgPerAcre: 0 },
    blackberry: { type: 'fruit', fertilizer: { npk: '10-10-10', urea: 14, dap: 9, potash: 11 }, pesticides: { 'orange-rust': { name: 'Myclobutanil', dosageMlPerLitre: 0.5 } }, seedRateKgPerAcre: 0 },
    coconut: { type: 'fruit', fertilizer: { npk: '5-5-15', urea: 20, dap: 15, potash: 40 }, pesticides: { 'rhizome-weevil': { name: 'Chlorpyrifos', dosageMlPerLitre: 2.5 } }, seedRateKgPerAcre: 0, },
    'areca nut': { type: 'fruit', fertilizer: { npk: '10-10-14', urea: 25, dap: 20, potash: 30 }, pesticides: { 'foot-rot': { name: 'Bordeaux mixture', dosageMlPerLitre: 10 } }, seedRateKgPerAcre: 0, },
};

type CropName = keyof typeof cropData;
type ItemType = 'Crop' | 'Fruit';


const unitConversionFactors = {
    acre: 1,
    hectare: 2.47105,
    sqmeter: 0.000247105,
    sqfeet: 0.0000229568,
};
type Unit = keyof typeof unitConversionFactors;

// --- Zod Schemas for Form Validation ---
const baseSchema = z.object({
    landSize: z.coerce.number().positive({ message: "Land size must be positive." }),
    unit: z.enum(['acre', 'hectare', 'sqmeter', 'sqfeet']),
});

const fertilizerSchema = baseSchema.extend({
    item: z.string().min(1, "Please select an item."),
});

const pesticideSchema = baseSchema.extend({
    item: z.string().min(1, "Please select an item."),
    pest: z.string().min(1, "Please select a pest/disease."),
});

const seedSchema = baseSchema.extend({
    item: z.string().min(1, "Please select a crop."),
});


// --- Calculator Components ---

function FertilizerCalculator({ itemType }: { itemType: ItemType }) {
    const { t } = useTranslation();
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof fertilizerSchema>>({
        resolver: zodResolver(fertilizerSchema),
        defaultValues: { item: '', landSize: 1, unit: 'acre' },
    });

    function onSubmit(values: z.infer<typeof fertilizerSchema>) {
        setIsLoading(true);
        setResult(null);

        setTimeout(() => {
            const landInAcres = values.landSize * unitConversionFactors[values.unit as Unit];
            const item = values.item.toLowerCase() as CropName;
            const fert = cropData[item]?.fertilizer;

            if (!fert) {
                setResult(t('calculatorsPage.error.noData'));
                setIsLoading(false);
                return;
            }

            const urea = (fert.urea * landInAcres).toFixed(2);
            const dap = (fert.dap * landInAcres).toFixed(2);
            const potash = (fert.potash * landInAcres).toFixed(2);

            setResult(
              `${t('calculatorsPage.fertilizer.result.urea')}: ${urea} kg\n` +
              `${t('calculatorsPage.fertilizer.result.dap')}: ${dap} kg\n` +
              `${t('calculatorsPage.fertilizer.result.potash')}: ${potash} kg\n` +
              `${t('calculatorsPage.fertilizer.result.npk')}: ${fert.npk}`
            );
            setIsLoading(false);
        }, 1500);
    }
    
    const relevantItems = Object.keys(cropData).filter(key => {
        return cropData[key as CropName].type === itemType.toLowerCase();
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t(`calculatorsPage.inputs.${itemType.toLowerCase()}Type`)}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t(`calculatorsPage.inputs.${itemType.toLowerCase()}Placeholder`)} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {relevantItems.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace(/-/g, ' ').replace(/\(.*\)/g, '')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="landSize"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('calculatorsPage.inputs.landSize')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 2.5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>{t('calculatorsPage.inputs.unit')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="acre">{t('calculatorsPage.units.acre')}</SelectItem>
                                        <SelectItem value="hectare">{t('calculatorsPage.units.hectare')}</SelectItem>
                                        <SelectItem value="sqmeter">{t('calculatorsPage.units.sqmeter')}</SelectItem>
                                        <SelectItem value="sqfeet">{t('calculatorsPage.units.sqfeet')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t('calculatorsPage.buttons.calculate')}
                </Button>
                {result && <ResultCard icon={<TestTube2 />} title={t('calculatorsPage.fertilizer.result.title')} content={result} />}
            </form>
        </Form>
    )
}


function PesticideCalculator({ itemType }: { itemType: ItemType }) {
    const { t } = useTranslation();
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof pesticideSchema>>({
        resolver: zodResolver(pesticideSchema),
        defaultValues: { item: '', pest: '', landSize: 1, unit: 'acre' },
    });
    
    const selectedItem = form.watch('item').toLowerCase() as CropName;
    const itemPesticides = selectedItem ? cropData[selectedItem]?.pesticides : null;

    function onSubmit(values: z.infer<typeof pesticideSchema>) {
        setIsLoading(true);
        setResult(null);

        setTimeout(() => {
            const landInAcres = values.landSize * unitConversionFactors[values.unit as Unit];
            const pest = cropData[values.item.toLowerCase() as CropName]?.pesticides[values.pest as keyof typeof cropData[CropName]['pesticides']];

            if (!pest) {
                setResult(t('calculatorsPage.error.noData'));
                setIsLoading(false);
                return;
            }

            // Standard assumption: 150-200 litres of water per acre for spray
            const waterPerAcre = 150;
            const totalWater = (waterPerAcre * landInAcres).toFixed(2);
            const totalPesticide = (parseFloat(totalWater) * pest.dosageMlPerLitre).toFixed(2);

            setResult(
                `${t('calculatorsPage.pesticide.result.mix')} ${totalPesticide} ml ${pest.name} ${t('calculatorsPage.pesticide.result.in')} ${totalWater} ${t('calculatorsPage.pesticide.result.litresWater')}.`
            );
            setIsLoading(false);
        }, 1500);
    }
    
    const relevantItems = Object.keys(cropData).filter(key => {
        return cropData[key as CropName].type === itemType.toLowerCase();
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>{t(`calculatorsPage.inputs.${itemType.toLowerCase()}Type`)}</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                form.resetField('pest');
                            }} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t(`calculatorsPage.inputs.${itemType.toLowerCase()}Placeholder`)} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {relevantItems.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace(/-/g, ' ').replace(/\(.*\)/g, '')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="pest"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('calculatorsPage.inputs.pestOrDisease')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedItem}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('calculatorsPage.inputs.pestPlaceholder')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {itemPesticides && Object.keys(itemPesticides).map(p => (
                                        <SelectItem key={p} value={p} className="capitalize">{p.replace(/-/g, ' ')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="landSize"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('calculatorsPage.inputs.landSize')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 2.5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>{t('calculatorsPage.inputs.unit')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="acre">{t('calculatorsPage.units.acre')}</SelectItem>
                                        <SelectItem value="hectare">{t('calculatorsPage.units.hectare')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t('calculatorsPage.buttons.calculate')}
                </Button>
                {result && <ResultCard icon={<SprayCan />} title={t('calculatorsPage.pesticide.result.title')} content={result} />}
            </form>
        </Form>
    )
}

function SeedCalculator({ itemType }: { itemType: ItemType }) {
    const { t } = useTranslation();
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof seedSchema>>({
        resolver: zodResolver(seedSchema),
        defaultValues: { item: '', landSize: 1, unit: 'acre' },
    });

    function onSubmit(values: z.infer<typeof seedSchema>) {
        setIsLoading(true);
        setResult(null);

        setTimeout(() => {
            const landInAcres = values.landSize * unitConversionFactors[values.unit as Unit];
            const seedRate = cropData[values.item.toLowerCase() as CropName]?.seedRateKgPerAcre;

            if (seedRate === undefined || seedRate === 0) {
                setResult(t('calculatorsPage.error.noSeedData'));
                setIsLoading(false);
                return;
            }

            const totalSeed = (seedRate * landInAcres).toFixed(2);
            setResult(
                `${t('calculatorsPage.seed.result.youWillNeed')} ~${totalSeed} kg ${t('calculatorsPage.seed.result.ofSeed')}.`
            );
            setIsLoading(false);
        }, 1500);
    }
    
    const cropItems = Object.keys(cropData).filter(key => {
        return cropData[key as CropName].type === 'crop' && (cropData[key as CropName].seedRateKgPerAcre || 0) > 0;
    });


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>{t(`calculatorsPage.inputs.cropType`)}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t(`calculatorsPage.inputs.cropPlaceholder`)} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {cropItems.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace(/-/g, ' ').replace(/\(.*\)/g, '')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="landSize"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('calculatorsPage.inputs.landSize')}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 2.5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>{t('calculatorsPage.inputs.unit')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="acre">{t('calculatorsPage.units.acre')}</SelectItem>
                                        <SelectItem value="hectare">{t('calculatorsPage.units.hectare')}</SelectItem>
                                        <SelectItem value="sqmeter">{t('calculatorsPage.units.sqmeter')}</SelectItem>
                                        <SelectItem value="sqfeet">{t('calculatorsPage.units.sqfeet')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t('calculatorsPage.buttons.calculate')}
                </Button>
                {result && <ResultCard icon={<Sprout />} title={t('calculatorsPage.seed.result.title')} content={result} />}
            </form>
        </Form>
    )
}

function ResultCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
    return (
        <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-lg font-medium whitespace-pre-wrap">
                    {content}
                </div>
            </CardContent>
        </Card>
    )
}

export function Calculators({ itemType }: { itemType: ItemType }) {
    const { t } = useTranslation();
    return (
        <Tabs defaultValue="fertilizer" className="w-full max-w-2xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="fertilizer"><TestTube2 className="mr-2 h-4 w-4" />{t('calculatorsPage.tabs.fertilizer')}</TabsTrigger>
                <TabsTrigger value="pesticide"><SprayCan className="mr-2 h-4 w-4" />{t('calculatorsPage.tabs.pesticide')}</TabsTrigger>
                <TabsTrigger value="seed" disabled={itemType === 'Fruit'}><Sprout className="mr-2 h-4 w-4" />{t('calculatorsPage.tabs.seed')}</TabsTrigger>
            </TabsList>
            <TabsContent value="fertilizer">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('calculatorsPage.fertilizer.title')}</CardTitle>
                        <CardDescription>{t('calculatorsPage.fertilizer.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FertilizerCalculator itemType={itemType} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="pesticide">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('calculatorsPage.pesticide.title')}</CardTitle>
                        <CardDescription>{t('calculatorsPage.pesticide.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PesticideCalculator itemType={itemType} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="seed">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('calculatorsPage.seed.title')}</CardTitle>
                        <CardDescription>{t('calculatorsPage.seed.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SeedCalculator itemType={itemType} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
