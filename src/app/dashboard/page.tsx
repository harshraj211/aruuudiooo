
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Banana, Wheat } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function DashboardSelectionPage() {
    const { t } = useTranslation();

    return (
        <main>
            <div className="mb-8 space-y-2 text-center">
                <h1 className="text-3xl font-bold">{t('dashboard.welcome', { name: 'Farmer' })}</h1>
                <p className="text-muted-foreground">Please select which area you would like to manage.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                <Link href="/dashboard/crops">
                    <Card className="hover:shadow-lg hover:border-primary/50 transition-all group">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-4 rounded-full">
                                    <Wheat className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Manage Crops</CardTitle>
                                    <CardDescription>Track expenses, get advisories, and manage your field crops.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <div className="flex justify-end items-center text-sm text-primary font-semibold">
                                Go to Crops Dashboard <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                           </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard/fruits">
                    <Card className="hover:shadow-lg hover:border-primary/50 transition-all group">
                        <CardHeader>
                             <div className="flex items-center gap-4">
                                <div className="bg-accent/10 p-4 rounded-full">
                                    <Banana className="h-8 w-8 text-accent" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Manage Fruits</CardTitle>
                                    <CardDescription>Track expenses, get advisories, and manage your fruit orchards.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="flex justify-end items-center text-sm text-primary font-semibold">
                                Go to Fruits Dashboard <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                           </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </main>
    );
}
