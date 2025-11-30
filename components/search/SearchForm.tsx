'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { searchFormSchema, type SearchFormData } from '@/lib/validators/schemas';
import { cn } from '@/lib/utils';

// Common Saudi cities
const SAUDI_CITIES = [
    { value: 'Riyadh', label: 'الرياض', labelEn: 'Riyadh' },
    { value: 'Jeddah', label: 'جدة', labelEn: 'Jeddah' },
    { value: 'Mecca', label: 'مكة', labelEn: 'Mecca' },
    { value: 'Medina', label: 'المدينة', labelEn: 'Medina' },
    { value: 'Dammam', label: 'الدمام', labelEn: 'Dammam' },
    { value: 'Khobar', label: 'الخبر', labelEn: 'Khobar' },
    { value: 'Taif', label: 'الطائف', labelEn: 'Taif' },
    { value: 'Tabuk', label: 'تبوك', labelEn: 'Tabuk' },
    { value: 'Abha', label: 'أبها', labelEn: 'Abha' },
    { value: 'Khamis Mushait', label: 'خميس مشيط', labelEn: 'Khamis Mushait' },
];

export function SearchForm() {
    const t = useTranslations('search');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const locale = useLocale();
    const [dateOpen, setDateOpen] = useState(false);

    const form = useForm<SearchFormData>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            from: '',
            to: '',
            passengers: 1,
        },
    });

    const onSubmit = (data: SearchFormData) => {
        const queryParams = new URLSearchParams({
            from: data.from,
            to: data.to,
            date: data.date,
            passengers: data.passengers.toString(),
        });

        router.push(`/search?${queryParams.toString()}`);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-4" suppressHydrationWarning>
                    {/* From */}
                    <div className="md:col-span-3 space-y-2">
                        <Label htmlFor="from">{t('from')}</Label>
                        <Select
                            value={form.watch('from')}
                            onValueChange={(value) => form.setValue('from', value)}
                        >
                            <SelectTrigger
                                className={cn(form.formState.errors.from && "border-destructive")}
                                suppressHydrationWarning
                            >
                                <SelectValue placeholder={t('from')} />
                            </SelectTrigger>
                            <SelectContent>
                                {SAUDI_CITIES.map((city) => (
                                    <SelectItem key={city.value} value={city.value}>
                                        {locale === 'ar' ? city.label : city.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.from && (
                            <p className="text-xs text-destructive">{tCommon('required')}</p>
                        )}
                    </div>

                    {/* To */}
                    <div className="md:col-span-3 space-y-2">
                        <Label htmlFor="to">{t('to')}</Label>
                        <Select
                            value={form.watch('to')}
                            onValueChange={(value) => form.setValue('to', value)}
                        >
                            <SelectTrigger
                                className={cn(form.formState.errors.to && "border-destructive")}
                                suppressHydrationWarning
                            >
                                <SelectValue placeholder={t('to')} />
                            </SelectTrigger>
                            <SelectContent>
                                {SAUDI_CITIES.map((city) => (
                                    <SelectItem key={city.value} value={city.value}>
                                        {locale === 'ar' ? city.label : city.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.to && (
                            <p className="text-xs text-destructive">{tCommon('required')}</p>
                        )}
                    </div>

                    {/* Date */}
                    <div className="md:col-span-3 space-y-2">
                        <Label>{t('date')}</Label>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !form.watch('date') && "text-muted-foreground",
                                        form.formState.errors.date && "border-destructive"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.watch('date') ? (
                                        format(new Date(form.watch('date')), 'PPP', {
                                            locale: locale === 'ar' ? arSA : enUS
                                        })
                                    ) : (
                                        <span>{t('date')}</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.watch('date') ? new Date(form.watch('date')) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            form.setValue('date', format(date, 'yyyy-MM-dd'));
                                            setDateOpen(false);
                                        }
                                    }}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                    locale={locale === 'ar' ? arSA : enUS}
                                />
                            </PopoverContent>
                        </Popover>
                        {form.formState.errors.date && (
                            <p className="text-xs text-destructive">{tCommon('required')}</p>
                        )}
                    </div>

                    {/* Passengers & Submit */}
                    <div className="md:col-span-3 flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="passengers">{t('passengers')}</Label>
                            <Input
                                id="passengers"
                                type="number"
                                min={1}
                                max={50}
                                {...form.register('passengers', { valueAsNumber: true })}
                                className={cn(form.formState.errors.passengers && "border-destructive")}
                            />
                        </div>
                        <Button type="submit" className="flex-1" size="default">
                            <Search className="mr-2 h-4 w-4" />
                            {tCommon('search')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
