import { useTranslations } from 'next-intl';
import { type Passenger } from '@/lib/validators/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PassengerFormProps {
    index: number;
    seatNumber: string;
    defaultValues?: Partial<Passenger>;
    onUpdate: (index: number, data: Passenger) => void;
    errors?: any;
}

export function PassengerForm({ index, seatNumber, defaultValues, onUpdate, errors }: PassengerFormProps) {
    const t = useTranslations('booking.passengerForm');
    const tCommon = useTranslations('common');

    const handleChange = (field: keyof Passenger, value: string) => {
        onUpdate(index, { ...defaultValues as Passenger, [field]: value });
    };

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium flex justify-between">
                    <span>{t('passenger')} {index + 1}</span>
                    <span className="text-muted-foreground text-sm font-normal">
                        {t('seat')} {seatNumber}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                    <Label htmlFor={`firstName-${index}`}>{t('firstName')}</Label>
                    <Input
                        id={`firstName-${index}`}
                        value={defaultValues?.firstName || ''}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className={cn(errors?.firstName && "border-destructive")}
                    />
                    {errors?.firstName && (
                        <p className="text-xs text-destructive">{tCommon('required')}</p>
                    )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                    <Label htmlFor={`lastName-${index}`}>{t('lastName')}</Label>
                    <Input
                        id={`lastName-${index}`}
                        value={defaultValues?.lastName || ''}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className={cn(errors?.lastName && "border-destructive")}
                    />
                    {errors?.lastName && (
                        <p className="text-xs text-destructive">{tCommon('required')}</p>
                    )}
                </div>

                {/* ID Type */}
                <div className="space-y-2">
                    <Label>{t('idType')}</Label>
                    <Select
                        value={defaultValues?.idType}
                        onValueChange={(value) => handleChange('idType', value)}
                    >
                        <SelectTrigger className={cn(errors?.idType && "border-destructive")}>
                            <SelectValue placeholder={t('selectIdType')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NATIONAL_ID">{t('idTypes.nationalId')}</SelectItem>
                            <SelectItem value="PASSPORT">{t('idTypes.passport')}</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors?.idType && (
                        <p className="text-xs text-destructive">{tCommon('required')}</p>
                    )}
                </div>

                {/* ID Number */}
                <div className="space-y-2">
                    <Label htmlFor={`idNumber-${index}`}>{t('idNumber')}</Label>
                    <Input
                        id={`idNumber-${index}`}
                        value={defaultValues?.idNumber || ''}
                        onChange={(e) => handleChange('idNumber', e.target.value)}
                        className={cn(errors?.idNumber && "border-destructive")}
                    />
                    {errors?.idNumber && (
                        <p className="text-xs text-destructive">{tCommon('required')}</p>
                    )}
                </div>

                {/* Nationality */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`nationality-${index}`}>{t('nationality')}</Label>
                    <Select
                        value={defaultValues?.nationality}
                        onValueChange={(value) => handleChange('nationality', value)}
                    >
                        <SelectTrigger className={cn(errors?.nationality && "border-destructive")}>
                            <SelectValue placeholder={t('selectNationality')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SA">Saudi Arabia</SelectItem>
                            <SelectItem value="AE">United Arab Emirates</SelectItem>
                            <SelectItem value="KW">Kuwait</SelectItem>
                            <SelectItem value="BH">Bahrain</SelectItem>
                            <SelectItem value="QA">Qatar</SelectItem>
                            <SelectItem value="OM">Oman</SelectItem>
                            <SelectItem value="EG">Egypt</SelectItem>
                            <SelectItem value="JO">Jordan</SelectItem>
                            {/* Add more as needed */}
                        </SelectContent>
                    </Select>
                    {errors?.nationality && (
                        <p className="text-xs text-destructive">{tCommon('required')}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
