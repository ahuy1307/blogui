// timeUtils.ts
export const calculateTimeLeft = (value: number, format: string) => {
    let difference = value - Date.now()
    const onChangeValue = difference

    const timeUnits = [
        { unit: 'YYYY', value: 0, ms: 1000 * 60 * 60 * 24 * 365 },
        { unit: 'DD', value: 0, ms: 1000 * 60 * 60 * 24 },
        { unit: 'HH', value: 0, ms: 1000 * 60 * 60 },
        { unit: 'mm', value: 0, ms: 1000 * 60 },
        { unit: 'ss', value: 0, ms: 1000 },
    ]

    if (difference > 0) {
        for (const timeUnit of timeUnits) {
            if (format.includes(timeUnit.unit)) {
                timeUnit.value = Math.floor(difference / timeUnit.ms)
                difference -= timeUnit.value * timeUnit.ms
            }
        }
    } else {
        difference = 0
    }

    const timeLeft = {
        years: timeUnits.find((u) => u.unit === 'YYYY')?.value || 0,
        days: timeUnits.find((u) => u.unit === 'DD')?.value || 0,
        hours: timeUnits.find((u) => u.unit === 'HH')?.value || 0,
        minutes: timeUnits.find((u) => u.unit === 'mm')?.value || 0,
        seconds: timeUnits.find((u) => u.unit === 'ss')?.value || 0,
        milliseconds: difference,
    }

    return { timeLeft, onChangeValue }
}

export const formatTimeLeft = (
    timeLeft: {
        years: number
        days: number
        hours: number
        minutes: number
        seconds: number
        milliseconds: number
    },
    format: string
) => {
    const formatted = {
        YYYY: String(timeLeft.years).padStart(4, '0'),
        DD: String(timeLeft.days).padStart(2, '0'),
        HH: String(timeLeft.hours).padStart(2, '0'),
        mm: String(timeLeft.minutes).padStart(2, '0'),
        ss: String(timeLeft.seconds).padStart(2, '0'),
        SSS: String(timeLeft.milliseconds).padStart(3, '0'),
    }

    return format.replace(
        /YYYY|DD|HH|mm|ss|SSS/g,
        (match) => formatted[match as keyof typeof formatted]
    )
}
