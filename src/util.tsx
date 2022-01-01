import { Storage } from '@capacitor/storage';
import { Settings } from './interfaces/settings';
import { Trip } from './interfaces/trip';

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
        totalYears: totalYears
    };
    return settings;
};

export function buildTrip(name: string, description: any, kilometers: number): Trip {
  let trip: Trip = {
    kilometers: kilometers,
    name: name,
    description: description
  };
  return trip;
}

export const loadTrips = async (): Promise<Trip[] | null> => {
    const trips = await Storage.get({
        key: 'trips',
    });
    return (trips && trips.value)
        ? JSON.parse(trips.value)
        : null;
};

export const saveTemplateTrip = async (name: string, description: any, kilometers: number): Promise<Trip | null> => {
  const trip = buildTrip(name, description, kilometers);
  await Storage.set({
            key: 'trip',
            value: JSON.stringify(trip)
        });
    return trip;
}

