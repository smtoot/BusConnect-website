'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLanguage = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1 bg-muted p-1 rounded-md">
                <Button
                    variant={locale === 'ar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => switchLanguage('ar')}
                    className={`h-7 px-3 text-xs ${locale === 'ar' ? 'font-bold' : ''}`}
                >
                    العربية
                </Button>
                <Button
                    variant={locale === 'en' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => switchLanguage('en')}
                    className={`h-7 px-3 text-xs ${locale === 'en' ? 'font-bold' : ''}`}
                >
                    English
                </Button>
            </div>
        </div>
    );
}
