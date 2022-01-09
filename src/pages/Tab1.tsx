import React, { useState, useEffect } from 'react';
import { Storage } from '@capacitor/storage';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonIcon, IonList, 
  IonFabButton, IonLabel, IonItem, IonProgressBar, IonText, IonModal, IonButton, IonInput, IonGrid, IonRow, IonCol, IonPopover } from '@ionic/react';
import { add } from 'ionicons/icons';
import AddTripModal from '../components/AddTripModal';
import InitialSetupModal from '../components/InitialSetupModal';
import { Settings } from '../interfaces/settings';
import { Stats } from '../interfaces/stats';
import { loadSettings,  updateSettings, initStatistics, saveCustomTrip, loadStatistics, getBudgetLeftToday, getBudgetLeftMonth, saveMileageTrip, addTripFromTemplate,
 getBudgetLeftTotal, getBudgetLeftYear, getStatsForDay } from '../util';
import { getNumberOfDaysInCurrentMonth, getDaysInMonth } from '../dateutils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'; 
import 'react-circular-progressbar/dist/styles.css';
import './Tab1.css';

const Tab1: React.FC = () => {

  const [settings, setSettings] = useState(null as Settings | null);
  const [stats, setStats] = useState(null as Stats | null);
  const [curMonth, setCurrentMonth] = useState<string>();
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  
  // these can either be in km or in percentage, depending on the user's setting
  const [leftDay, setLeftDay] = useState<number>();
  const [leftMonth, setLeftMonth] = useState<number>();
  const [leftYear, setLeftYear] = useState<number>();
  const [leftTotal, setLeftTotal] = useState<number>();
  
  const [budgetDay, setBudgetDay] = useState<number>();
  const [budgetMonth, setBudgetMonth] = useState<number>();
  const [budgetYear, setBudgetYear] = useState<number>();
  const [budgetTotal, setBudgetTotal] = useState<number>();
  const [usePercent, setUsePercent] = useState<boolean>(true);
  const [firstTimeUsingApp, setFirstTimeUsingApp] = useState<boolean>(false); 
  
  const [selectedDay, setSelectedDay] = useState<number>();

  const update = async(statistics: Stats) => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
    const month = formatter.format(now);
    
    setCurrentMonth(month);

    loadSettings().then(settings => {
      if (settings && statistics !== null) {
        const leftToday = getBudgetLeftToday(statistics, settings);
        const leftMonth = getBudgetLeftMonth(statistics, settings);
        const leftTotal = getBudgetLeftTotal(statistics, settings);
        const leftYear = getBudgetLeftYear(statistics, settings);
        setLeftDay(leftToday);
        setLeftMonth(leftMonth);
        setLeftTotal(leftTotal);
        setLeftYear(leftYear);
      }
    });
    
  };
  
  async function closeAddTripModal(args: any) {
    if (args !== undefined) {
      const type = args[0];
      
      if (type === "custom") {
        const name = args[1];
        const description = args[2];
        // TODO: what to do with name + description ?
        const kilometers = parseInt(args[3]);
        await saveCustomTrip(name, description, kilometers).then(result => {
          if (result) {
            setStats(result);
            update(result);
          }
        });
      }
      
      else if (type === "template") {
        const name = args[1];
        await addTripFromTemplate(name).then(result => {
          if (result) {
            setStats(result);
            update(result);
          }
        });
      }
      
      else if (type === "mileage") {
        const mileage = args[1];
        if (stats) {
          const kmTrip = mileage - stats.mileage;
          await saveMileageTrip(kmTrip).then(result => {
            if (result){
              setStats(result);
              update(result);
            }
          });
        }
      }
    }
    await setShowAddTripModal(false);
  }
  
  async function closeFirstTimeUsingAppModal(args: any) {
    if (args !== undefined) {
      // we got some initial data to save
      let budgetPerYear = parseFloat(args[0]);
      let totalYears = parseInt(args[1]);
      let mileage = parseInt(args[2]);
      await updateSettings(budgetPerYear, totalYears).then(result => {
        if (result) {
          setSettings(result);
          updateBudgets(result);
        }
      });
      await initStatistics(mileage).then(result => {
        if (result) {
          setStats(result);
          update(result);
        }
      });
    }
    setFirstTimeUsingApp(false);
  }
  
  async function togglePercent() {
    setUsePercent(!usePercent);
  }
  
  async function calendarItemClicked(item: any) {
    setSelectedDay(+item.target.textContent);
  }
  
  function createDayItem(day: number, today: number) {
    let is_today = day === today;
    
    if (is_today) {
      return (
        <IonCol><IonButton class="calendar-day-today" onClick={e => calendarItemClicked(e)}>{day}</IonButton></IonCol>
      );
    }
    
    return (
      <IonCol><IonButton class="calendar-day" onClick={e => calendarItemClicked(e)}>{day}</IonButton></IonCol>
    );
  }
  
  
  function buildDayOverview() {
    let now = new Date();
    let today = now.getDate();
    if (selectedDay === today) {
      return (<IonList></IonList>);
    }
    
    const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
    const month = formatter.format(now);
    
    if (stats && settings && selectedDay && budgetDay) {
      const kmDriven = getStatsForDay(stats, settings, selectedDay, now.getMonth(), now.getFullYear());
      if (kmDriven !== null) {
        const diff = budgetDay - kmDriven;
        const sign = (diff >= 0 ? '+' : '-');
        
        return (
          <IonList>
            <IonItem lines="none">
              <IonLabel>{month} {selectedDay}</IonLabel>
              <IonLabel>Total: {kmDriven}km</IonLabel>
            </IonItem>
            <IonItem lines="none" class="item-small">
              <IonLabel></IonLabel>
              <IonLabel>Diff: {sign}{diff.toFixed(1)}km</IonLabel>
            </IonItem>
          </IonList>
        );
      }
    }
    
    return (<IonLabel>ERR</IonLabel>);
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
       <CircularProgressbar value={value} text={`${value}km`} maxValue={maxValue} styles={buildStyles({textSize: '14px'})} />
     );
  }
  
  const updateBudgets = (settings: Settings): void => {
    setBudgetMonth(settings.budgetPerYear / 12.0);
    setBudgetDay(settings.budgetPerYear / 12.0 / getNumberOfDaysInCurrentMonth());
    setBudgetTotal(settings.totalBudget);
    setBudgetYear(settings.budgetPerYear);
  }
  
  const getSettings = (): void => {
    loadSettings().then((result) => {
      if (result) {
        console.log("settings found");
        setSettings(result);
        updateBudgets(result);
      } else {
        console.log("no settings found");
        setFirstTimeUsingApp(true);
      }
    })
  };
  
  const getStatistics = (): void => {
    loadStatistics().then(result => {
      if (result) {
        setStats(result);
        update(result);
      } else {
        console.log("no statistics found");
      }
    })
  };
  
  const init = (): void => {
    let now = new Date();
    let today = now.getDate();
    setSelectedDay(today);
  };
  
  const progressBarColor = (percent: number): string => {
    percent = percent*100.0;
    if (percent >= 50.0) {
      return "success";
    }
    else if (percent >= 10.0) {
      return "warning";
    }
    return "danger";
  }

  useEffect(() => {
    init();
    getSettings();
    getStatistics();
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
          {stats && leftDay && budgetDay && (
          <IonItem lines="none">
            <IonText>Left today: {leftDay.toFixed(1)}km</IonText>
            <IonProgressBar color={progressBarColor(1.0/budgetDay*leftDay)} value={1.0/budgetDay*leftDay}></IonProgressBar>
          </IonItem>
          )}
          
          <IonItem lines="none">
            <IonGrid>
              <IonRow>
                <IonCol>Month</IonCol>
                <IonCol>Year</IonCol>
                <IonCol>Total</IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  {stats && leftMonth && budgetMonth && (
                  <div style={{ width: 80, height: 80 }} onClick={() => togglePercent()}>
                      {buildProgressCircle(leftMonth!, budgetMonth, 3)}
                   </div>
                   )}
                 </IonCol>
                 <IonCol>
                   {stats && leftYear && budgetYear && (
                   <div style={{ width: 80, height: 80 }} onClick={() => togglePercent()}>
                      {buildProgressCircle(leftYear!, budgetYear, 3)}
                   </div>
                   )}
                 </IonCol>
                 <IonCol>
                   {stats && leftTotal && budgetTotal && (
                   <div style={{ width: 80, height: 80 }} onClick={() => togglePercent()}>
                      {buildProgressCircle(leftTotal!, budgetTotal, 2)}
                   </div>
                   )}
                 </IonCol>
               </IonRow>
             </IonGrid>
          </IonItem>
        </IonList>
        
        <IonModal isOpen={firstTimeUsingApp}>
          <InitialSetupModal closeAction={closeFirstTimeUsingAppModal}></InitialSetupModal>
        </IonModal>
        
        {buildCalendarGrid()}
        {buildDayOverview()}
        
        <IonModal isOpen={showAddTripModal}>
            <AddTripModal closeAction={closeAddTripModal}></AddTripModal>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
