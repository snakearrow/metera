import { Storage } from '@capacitor/storage';
import { Settings } from './interfaces/settings';
import { Trip } from './interfaces/trip';
import { Stats, MonthStats } from './interfaces/stats';
import { getNumberOfDaysInCurrentMonth } from './dateutils';
import { cart, briefcase, barbell, people, home, add, trash, car } from 'ionicons/icons';

export function getIconForKeyword(_keyword: string) {
  const keyword = _keyword.toLowerCase();
  if (keyword.includes("home")) {
    return home;
  }
  if (keyword.includes("work")) {
    return briefcase;
  }
  if (keyword.includes("shopping") || keyword.includes("grocer")) {
    return cart;
  }
  if (keyword.includes("sport") || keyword.includes("fitness")) {
    return barbell;
  }
  if (keyword.includes("friend")) {
    return people;
  }
  return car;
}

export const loadSettings = async (): Promise<Settings | null> => {
    const settings = await Storage.get({
        key: 'settings',
    });
    return (settings && settings.value)
        ? JSON.parse(settings.value)
        : null;
};

export const updateSettings = async (budgetPerYear: number, totalYears: number): Promise<Settings | null> => {
    const settings = buildSettings(budgetPerYear, totalYears);
    await Storage.set({
            key: 'settings',
            value: JSON.stringify(settings)
        });
    return settings;
};

export function defaultSettings(): Settings {
    let settings: Settings = {
        budgetPerYear: 0,
        totalBudget: 0,
        totalYears: 0
    };
    return settings;
};

export function buildSettings(budgetPerYear: number, totalYears: number): Settings {
    let totalBudget = budgetPerYear * totalYears;
    
    let settings: Settings = {
        budgetPerYear: budgetPerYear,
        totalBudget: totalBudget,
        totalYears: totalYears,
    };
    return settings;
};

export function buildTrip(name: string, description: any, kilometers: number): Trip {
  let trip: Trip = {
    kilometers: kilometers,
    name: name,
    description: description,
  };
  return trip;
}

export const loadTemplateTrips = async (): Promise<Trip[] | null> => {
    const trips = await Storage.get({
        key: 'templateTrips',
    });
    return (trips && trips.value)
        ? JSON.parse(trips.value)
        : null;
};

export const saveTemplateTrip = async (name: string, description: any, kilometers: number): Promise<Trip[] | null> => {
  let newTrips = null;
  await loadTemplateTrips().then((result) => {
    if (result) {
      // append to existing trips
      newTrips = [
        {
          kilometers: kilometers,
          name: name,
          description: description,
        },
        ...result,
      ];
      Storage.set({
          key: 'templateTrips',
          value: JSON.stringify(newTrips)
      });
      return newTrips;
    } else {
      // first trip to save
      const trip = [buildTrip(name, description, kilometers)];
      Storage.set({
            key: 'templateTrips',
            value: JSON.stringify(trip)
        });
      newTrips = trip;
    }
  });
  
  return newTrips;
}

export const deleteTemplateTripByName = async(name: string): Promise<Trip[] | null> => {
  let newTrips = null;
  await loadTemplateTrips().then((result) => {
    if (result) {
      for (let i = 0; i < result.length; i++) {
        const trip = result[i];
        if (trip.name === name) {
          newTrips = result;
          newTrips.splice(i, 1);
          Storage.set({
            key: 'templateTrips',
            value: JSON.stringify(newTrips)
          });
          return newTrips;
        }
      }
    }
  });
  return newTrips;
}

export const initStatistics = async(mileage: number): Promise<Stats | null> => {
  const now = new Date();
  let monthStats: MonthStats = {
    year: now.getFullYear(),
    month: now.getMonth(),
    kilometers: Array(getNumberOfDaysInCurrentMonth()).fill(0)
  };
  
  let statistics: Stats = {
    mileage: mileage,
    monthStats: [monthStats]
  }
  
  await Storage.set({
    key: 'statistics',
    value: JSON.stringify(statistics)
  });
  return statistics;
}

export const loadStatistics = async(): Promise<Stats | null> => {
  const stats = await Storage.get({
    key: 'statistics'
  });
  return (stats && stats.value)
    ? JSON.parse(stats.value)
    : null;
}

export const saveStatistics = async(statistics: Stats) => {
  await Storage.set({
    key: 'statistics',
    value: JSON.stringify(statistics)
  });
}

export const saveCustomTrip = async(name: any, description: any, kilometers: number): Promise<Stats | null> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  let newStats = null;
  
  console.log("save trip with kilometers: " + kilometers);
  await loadStatistics().then(stats => {
    if (stats) {
      const newMileage = stats.mileage + kilometers;
      const monthStats = stats.monthStats;
      for (let i = 0; i < monthStats.length; i++) {
        let monthStat = monthStats[i];
        if (monthStat.year === year && monthStat.month === month) {
          monthStat.kilometers[day] += kilometers;
          newStats = stats;
          newStats.mileage = newMileage;
          newStats.monthStats[i] = monthStat;
          saveStatistics(newStats);
          return newStats;
        }
      }
    }
  });
  return newStats;
}

export const saveMileageTrip = async(kmTrip: number): Promise<Stats | null> => {
  let newStats = await saveCustomTrip(null, null, kmTrip);
  return newStats;
}

export const addTripFromTemplate = async(name: string): Promise<Stats | null> => {
  let newStats = null;
  await loadTemplateTrips().then(result => {
    if (result) {
      const trips = result;
      for (let i = 0; i < trips.length; i++) {
        if (name === trips[i].name) {
          const km = trips[i].kilometers;
          newStats = saveCustomTrip(null, null, km);
          return newStats;
        }
      }
    }
  });
  return newStats;
}

export function getStatsForDay(stats: Stats, settings: Settings, day: number, month: number, year: number) {
  for (let i = 0; i < stats.monthStats.length; i++) {
    const monthStat = stats.monthStats[i];
    if (monthStat.year === year && monthStat.month === month) {
      return monthStat.kilometers[day];
    }
  }
  return null;
}

export function getBudgetLeftToday(stats: Stats, settings: Settings): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  
  const budgetPerMonth = settings.budgetPerYear / 12.0;
  const budgetPerDay = budgetPerMonth / getNumberOfDaysInCurrentMonth();
  
  for (let i = 0; i < stats.monthStats.length; i++) {
    const monthStat = stats.monthStats[i];
    if (monthStat.year === year && monthStat.month === month) {
      const kilometersToday = monthStat.kilometers[day];
      return budgetPerDay - kilometersToday;
      break;
    }
  }
  return budgetPerDay;
}

export function getBudgetLeftMonth(stats: Stats, settings: Settings): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const budgetPerMonth = settings.budgetPerYear / 12.0;
  for (let i = 0; i < stats.monthStats.length; i++) {
    const monthStat = stats.monthStats[i];
    if (monthStat.year === year && monthStat.month === month) {
      return budgetPerMonth - monthStat.kilometers.reduce((pv, cv) => pv + cv, 0);
      break;
    }
  }
  return budgetPerMonth;
}

export function getBudgetLeftYear(stats: Stats, settings: Settings): number {
  const now = new Date();
  const year = now.getFullYear();
  let sum = 0.0;
  
  for (let i = 0; i < stats.monthStats.length; i++) {
    const monthStat = stats.monthStats[i];
    if (monthStat.year === year) {
      sum += monthStat.kilometers.reduce((pv, cv) => pv + cv, 0);
      break;
    }
  }
  return settings.budgetPerYear - sum;
}

export function getBudgetLeftTotal(stats: Stats, settings: Settings): number {
  let sum = 0.0;
  for (let i = 0; i < stats.monthStats.length; i++) {
    const monthStat = stats.monthStats[i];
    sum += monthStat.kilometers.reduce((pv, cv) => pv + cv, 0);
  }
  return settings.totalBudget - sum;
}

export function getAverageMonthlyKm(stats: Stats): number {
  let monthlySums = [];
  let count = 0;
  for (let i = 0; i < stats.monthStats.length; i++) {
    const monthStat = stats.monthStats[i];
    const sum = monthStat.kilometers.reduce((pv, cv) => pv + cv, 0);
    monthlySums.push(sum);
    count++;
  }
  let sum = monthlySums.reduce((pv, cv) => pv + cv, 0);
  return sum / count;
}

export function getMonthStatsFor(stats: Stats, settings: Settings, year: number, month: number) {
  for (let i = 0; i < stats.monthStats.length; i++) {
    const monthStat = stats.monthStats[i];
    if (monthStat.year === year && monthStat.month === month) {
      return monthStat.kilometers.reduce((pv, cv) => pv + cv, 0);
    }
  }
  return null;
}

