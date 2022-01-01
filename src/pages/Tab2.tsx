import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonLabel, IonToolbar, IonList, IonListHeader, IonItem, IonInput, IonButton, IonIcon, IonModal } from '@ionic/react';
import { Settings } from '../interfaces/settings';
import { Trip } from '../interfaces/trip';
import AddTemplateTripModal from '../components/AddTemplateTripModal';
import { cart, briefcase, barbell, people, home, add, trash } from 'ionicons/icons';
import { loadSettings, updateSettings, defaultSettings, loadTrips, saveTemplateTrip } from '../util';
import './Tab2.css';

const Tab2: React.FC = () => {

  const [settings, setSettings] = useState(null as Settings | null);
  const [kmPerYear, setKmPerYear] = useState<number>(10000);
  const [totalYears, setTotalYears] = useState<number>(4);
  const [trips, setTrips] = useState(null as Trip[] | null);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  
  async function closeAddTripModal(args: any) {
    if (args !== undefined) {
      let name = args[0];
      let description = (args[1] === undefined ? "" : args[1]);
      let km = args[2];
      saveTemplateTrip(name, description, km);
    }
    await setShowAddTripModal(false);
  }
  
  const handleKmPerYearChanged = async(e: any) => {
    const kmBudget = +e.detail.value;
    setKmPerYear(kmBudget);
    updateSettings(kmBudget, totalYears!).then((result) => {
      if (result) {
        console.log(result);
        setSettings(result);
      } else {
        console.log("failed to save settings");
      }
    });
  };
  
  const handleTotalYearsChanged = async(e: any) => {
    let years = +e.detail.value;
    setTotalYears(years);
    updateSettings(kmPerYear, years).then((result) => {
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
        setSettings(defaultSettings());
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
              <IonListHeader class="label-heading">General</IonListHeader>
              
              <IonItem lines="none">
                <IonLabel>Kilometer p.a.:</IonLabel>
                <IonInput type="number" placeholder={settings.budgetPerYear.toString()} onIonChange={e => handleKmPerYearChanged(e)} value={kmPerYear} ></IonInput>
                <IonLabel>km</IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="fixed">Years:</IonLabel>
                <IonInput type="number" placeholder={settings.totalYears.toString()} onIonChange={e => handleTotalYearsChanged(e)} value={totalYears}></IonInput>
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="fixed">Total:</IonLabel>
                <IonInput placeholder={settings.totalYears.toString()} readonly={true} value={totalYears * kmPerYear}></IonInput>
                <IonLabel>km</IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="fixed">Per month:</IonLabel>
                <IonInput value={(settings.budgetPerYear/12).toFixed(2).toString()} readonly={true}></IonInput>
                <IonLabel>km</IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel position="fixed">Per day:</IonLabel>
                <IonInput value={(settings.budgetPerYear/12/30).toFixed(2).toString()}></IonInput>
                <IonLabel>km</IonLabel>
              </IonItem>
            </IonList>
       )}
       
       <IonList>
        <IonListHeader class="label-heading">Trips</IonListHeader>
         <IonItem>
            <IonButton color="success" style={{width:80, height: 30}} onClick={() => setShowAddTripModal(true)}>Add&nbsp;
              <IonIcon icon={add}></IonIcon>
            </IonButton>
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
        <IonListHeader class="label-heading">Danger Zone</IonListHeader>
        <IonItem>
          <IonButton color="danger" style={{width: 120, height: 30}}>Reset All&nbsp;
            <IonIcon icon={trash}></IonIcon>
          </IonButton>
        </IonItem>
      </IonList>
      
      <IonModal isOpen={showAddTripModal}>
        <AddTemplateTripModal closeAction={closeAddTripModal}></AddTemplateTripModal>
      </IonModal>
     </IonContent>
    </IonPage>
  );
};

export default Tab2;
