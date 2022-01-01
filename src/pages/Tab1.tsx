import React, { useState, useEffect } from 'react';
import { Storage } from '@capacitor/storage';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonIcon, IonList, 
  IonFabButton, IonLabel, IonItem, IonProgressBar, IonText, IonModal, IonButton, IonInput, IonGrid, IonRow, IonCol, IonPopover } from '@ionic/react';
import { add } from 'ionicons/icons';
import AddTripModal from '../components/AddTripModal';
import InitialSetupModal from '../components/InitialSetupModal';
import { Settings } from '../interfaces/settings';
import { loadSettings,  updateSettings } from '../util';
import { getNumberOfDaysInCurrentMonth, getDaysInMonth } from '../dateutils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'; 
import 'react-circular-progressbar/dist/styles.css';
import './Tab1.css';

const Tab1: React.FC = () => {

  const [settings, setSettings] = useState(null as Settings | null);
  const [curMonth, setCurrentMonth] = useState<string>();
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  
  // these can either be in km or in percentage, depending on the user's setting
  const [leftDay, setLeftDay] = useState<number>();
  const [leftMonth, setLeftMonth] = useState<number>();
  const [leftYear, setLeftYear] = useState<number>();
  const [leftTotal, setLeftTotal] = useState<number>();
  const [usePercent, setUsePercent] = useState<boolean>(true);
  const [firstTimeUsingApp, setFirstTimeUsingApp] = useState<boolean>(false);
  
   // TODO: get some of these from settings
  const kmBudgetTotal = 42500.0;
  const totalYears = 4;
  const kmBudgetYear = kmBudgetTotal / totalYears;
  const kmBudgetMonth = kmBudgetYear / 12.0;
  const kmBudgetDay = kmBudgetMonth / getNumberOfDaysInCurrentMonth();
  
  const kmLeftTotal = 39242.5;
  const kmLeftYear = 6120.3;
  const kmLeftMonth = 413.9;
  const kmLeftDay = 9.2;
  
  const update = async() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
    const month = formatter.format(now);
    setCurrentMonth(month);
    setLeftMonth(kmLeftMonth);
    setLeftYear(kmLeftYear);
    setLeftTotal(kmLeftTotal);
    setLeftDay(kmLeftDay);
  };
  
  async function closeAddTripModal() {
    await setShowAddTripModal(false);
  }
  
  async function closeFirstTimeUsingAppModal(args: any) {
    if (args !== undefined) {
      // we got some initial data to save
      let budgetPerYear = parseFloat(args[0]);
      let totalYears = parseInt(args[1]);
      updateSettings(budgetPerYear, totalYears);
    }
    setFirstTimeUsingApp(false);
  }
  
  async function togglePercent() {
    setUsePercent(!usePercent);
  }
  
  function createDayItem(day: number, today: number) {
    let is_today = day === today;
    
    if (is_today) {
      return (
        <IonCol><IonButton class="calendar-day-today">{day}</IonButton></IonCol>
      );
    }
    
    return (
      <IonCol><IonButton class="calendar-day">{day}</IonButton></IonCol>
    );
  }
  
  function buildCalendarGrid() {
    let now = new Date();
    let allDaysInMonth = getDaysInMonth(now.getUTCMonth(), now.getFullYear());
    let days = allDaysInMonth.map(e => e.getDate());
    let today = now.getDate();
    
    let cells = [...Array(5)].map(e => Array(7));
    let toFill = -1;
    for (let i = 0; i < 5; i++) {
      cells[i] = days.slice(i*7, (i+1)*7).map(e => <IonCol>{createDayItem(e, today)}</IonCol>)
      if ((i+1)*7 >= days.length) {
        toFill = (i+1)*7 - days.length;
      }
    }
    
    for (let i = 0; i < toFill; i++) {
      cells[4].push(<IonCol></IonCol>);
    }
    
    let toRender = cells.map(row => <IonRow> {row}</IonRow>)
    
    return (
      <IonGrid>
          {toRender}
      </IonGrid>
    );
  }
  
  function buildProgressCircle(val: number, maxValue: any, precision: number) {
     if (usePercent) {
       const percent = parseFloat((100.0 / maxValue! * val).toPrecision(precision));
       return (
         <CircularProgressbar value={percent} text={`${percent}%`} styles={buildStyles({textSize: '14px'})} />
       );
     }
     
     const value = parseFloat(val.toPrecision(precision));
     return (
       <CircularProgressbar value={val} text={`${val}km`} maxValue={maxValue} styles={buildStyles({textSize: '14px'})} />
     );
  }
  
  const getSettings = (): void => {
    loadSettings().then((result) => {
      if (result) {
        console.log("settings found");
        setSettings(result);
      } else {
        console.log("no settings found");
        setFirstTimeUsingApp(true);
      }
    })
  };

  useEffect(() => {
    getSettings();
    update();
  }, [])
  
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Drive</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowAddTripModal(true)} color="secondary">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        
        <IonToolbar>
          <IonTitle class="ion-text-center">Month: {curMonth}</IonTitle>
        </IonToolbar>
        
        <IonList>
          <IonItem lines="none">
            <IonText>Left today: {kmLeftDay}km</IonText>
            <IonProgressBar color="secondary" value={1.0/kmBudgetDay*kmLeftDay}></IonProgressBar>
          </IonItem>
          
          <IonItem lines="none">
            <IonGrid>
              <IonRow>
                <IonCol>Month</IonCol>
                <IonCol>Year</IonCol>
                <IonCol>Total</IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <div style={{ width: 80, height: 80 }} onClick={() => togglePercent()}>
                      {buildProgressCircle(kmLeftMonth!, kmBudgetMonth, 3)}
                   </div>
                 </IonCol>
                 <IonCol>
                   <div style={{ width: 80, height: 80 }} onClick={() => togglePercent()}>
                      {buildProgressCircle(kmLeftYear!, kmBudgetYear, 3)}
                   </div>
                 </IonCol>
                 <IonCol>
                   <div style={{ width: 80, height: 80 }} onClick={() => togglePercent()}>
                      {buildProgressCircle(kmLeftTotal!, kmBudgetTotal, 2)}
                   </div>
                 </IonCol>
               </IonRow>
             </IonGrid>
          </IonItem>
        </IonList>
        
        <IonModal isOpen={firstTimeUsingApp}>
          <InitialSetupModal closeAction={closeFirstTimeUsingAppModal}></InitialSetupModal>
        </IonModal>
        
        {buildCalendarGrid()}
        
        <IonModal isOpen={showAddTripModal}>
            <AddTripModal closeAction={closeAddTripModal}></AddTripModal>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
