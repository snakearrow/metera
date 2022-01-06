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
          break;
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

