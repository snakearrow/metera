export interface Stats {
    mileage: number,
    monthStats: MonthStats[]
}

export interface MonthStats {
    year: number,
    month: number,
    kilometers: number[]; // km per day
}

