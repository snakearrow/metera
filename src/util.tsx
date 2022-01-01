import { Storage } from '@capacitor/storage';
import { Settings } from './interfaces/settings';
import { Trip } from './interfaces/trip';

export const loadSettings = async (): Promise<Settings | null> => {
    const budgetPerYear = await Storage.get({
        key: 'settings',
    });
    return (budgetPerYear && budgetPerYear.value)
        ? JSON.parse(budgetPerYear.value)
        : null;
};

export const updateSettings = async (budgetPerYear: number): Promise<Settings | null> => {
    let settings: Settings = {
        budgetPerYear: budgetPerYear
    };
    
    await Storage.set({
            key: 'settings',
            value: JSON.stringify(settings),
        });
    return settings;
};

export const defaultSettings = async (): Promise<Settings | null> => {
    let settings: Settings = {
        budgetPerYear: 0
    };
    return settings;
};

export const loadTrips = async (): Promise<Trip[] | null> => {
    const trips = await Storage.get({
        key: 'trips',
    });
    return (trips && trips.value)
        ? JSON.parse(trips.value)
        : null;
};

