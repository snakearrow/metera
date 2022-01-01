import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonLabel, IonToolbar, IonList, IonListHeader, IonItem, IonInput, IonButton, IonIcon } from '@ionic/react';
import { Settings } from '../interfaces/settings';
import { Trip } from '../interfaces/trip';
import { cart, briefcase, barbell, people, home } from 'ionicons/icons';
import { loadSettings, updateSettings, defaultSettings, loadTrips } from '../util';
import './Tab2.css';

const Tab2: React.FC = () => {

  const [settings, setSettings] = useState(null as Settings | null);
  const [trips, setTrips] = useState(null as Trip[] | null);
  
  const handleChange = async(e: any) => {
    updateSettings(+e.detail.value).then((result) => {
      if (result) {
        console.log(result);
        setSettings(result);
      } else {
        console.log("failed to save settings");
      }
    });
  };
  
  const applySettings = (): void => {
    loadSettings().then((result) => {
      if (result) {
        setSettings(result);
      } else {
        console.log("no settings founds, initializing with empty");
        defaultSettings().then((result) => {
            if (result) {
              setSettings(result);
            } else {
              console.log("failed to initialize with empty settings");
            }
        })
      }
    })
  };
  
  const getTrips = (): void => {
    loadTrips().then((result) => {
        if (result) {
          setTrips(result);
        } else {
          console.log("could not load trips");
        }
    })
  };
  
  useEffect(() => {
    applySettings();
    getTrips();
  }, [])

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        {(settings) && (
            <IonList>
              <IonItem>
                <IonLabel position="fixed">Budget p.a.:</IonLabel>
                <IonInput placeholder={settings.budgetPerYear.toString()} onIonChange={e => handleChange(e)}></IonInput>
                <IonLabel>km</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel position="fixed">Per month:</IonLabel>
                <IonInput> {(settings.budgetPerYear/12).toFixed(2).toString()}</IonInput>
                <IonLabel>km</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel position="fixed">Per day:</IonLabel>
                <IonInput> {(settings.budgetPerYear/12/30).toFixed(2).toString()}</IonInput>
                <IonLabel>km</IonLabel>
              </IonItem>
            </IonList>
       )}
       
       <IonList>
        <IonListHeader>Trips</IonListHeader>
         <IonItem>
            <IonButton color="success">Add</IonButton>
          </IonItem>
         <IonItem>
            <IonIcon slot="start" icon={cart}/>
            <IonLabel>
              <h2>Shopping</h2>
              <h3>Netto Salem</h3>
              <p>5km</p>
            </IonLabel>
            <IonButton slot="end">Delete</IonButton>
          </IonItem>
          <IonItem>
            <IonIcon slot="start" icon={briefcase}/>
            <IonLabel>
              <h2>Work</h2>
              <h3>Diehl Ueberlingen</h3>
              <p>22km</p>
            </IonLabel>
            <IonButton slot="end">Delete</IonButton>
          </IonItem>
       </IonList>
        
       <IonList>
        <IonListHeader>Danger Zone</IonListHeader>
        <IonItem>
          <IonButton color="danger">Reset All</IonButton>
        </IonItem>
      </IonList>
     </IonContent>
    </IonPage>
  );
};

export default Tab2;
