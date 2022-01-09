import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonLabel, IonToolbar, IonList, IonListHeader, 
  IonItem, IonInput, IonButton, IonIcon, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle, IonRow, IonGrid, IonCol, withIonLifeCycle, useIonViewDidEnter } from '@ionic/react';
import { Settings } from '../interfaces/settings';
import { Trip } from '../interfaces/trip';
import { Stats } from '../interfaces/stats';
import { loadSettings, loadStatistics, getAverageMonthlyKm, getBudgetLeftTotal, getMonthStatsFor } from '../util';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'; 
import 'react-circular-progressbar/dist/styles.css';
import './Tab3.css';

const Tab3: React.FC = () => {

  const [settings, setSettings] = useState(null as Settings | null);
  const [statistics, setStatistics] = useState(null as Stats | null);
  const [budgetMonth, setBudgetMonth] = useState<number>();
  
  const budgetGood = "#32a840";
  const budgetOkay = "#ffa600";
  const budgetBad = "#c20000";
  
  useIonViewDidEnter(() => {
    getStatistics();
  });
  
  function buildMonthCard(year: number, month: number) {
    if (budgetMonth === null || budgetMonth === undefined || statistics === null || settings === null) {
      return;
    }
    
    const kmDriven = getMonthStatsFor(statistics, settings, year, month);
    if (kmDriven === null) {
      return (<IonCard></IonCard>);
    }
    
    let color = budgetGood;
    let diff = budgetMonth - kmDriven;
    if (diff < 0) {
      color = budgetBad;
    } else if (diff < 50.0) {
      color = budgetOkay;
    }
    let percent = parseFloat(Math.min(100.0, 100.0/budgetMonth*kmDriven).toPrecision(3));
    let sign = (diff >= 0 ? '+' : '-');
    const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
    let now = new Date();
    now.setMonth(month);
    const monthStr = formatter.format(now);
    
    return (
       <IonCard style={{}}>
         <IonCardHeader>
           <IonCardTitle class="card-heading">{monthStr} {year}</IonCardTitle>
         </IonCardHeader>
         <IonCardContent>
           <IonGrid>
             <IonRow>
               <IonCol>
                 <IonGrid>
                   <IonRow>
                     <IonCol>Km Driven:</IonCol>
                   </IonRow>
                   <IonRow>
                     <IonCol>{kmDriven}km / {budgetMonth.toPrecision(5)}km</IonCol>
                   </IonRow>
                   <IonRow>
                     <IonCol>Difference: {sign}{Math.abs(diff).toPrecision(4)}km</IonCol>
                   </IonRow>
                 </IonGrid>
               </IonCol>
               <IonCol>
                 <IonRow>
                 <div style={{ width: 100, height: 100, marginLeft: '20%' }}>
                   <CircularProgressbar value={percent} text={`${percent}%`} styles={buildStyles({textSize: '18px', pathColor: color, trailColor: 'white', textColor: 'black'})} />
                 </div>
                 </IonRow>
               </IonCol>
             </IonRow>
           </IonGrid>
         </IonCardContent>
       </IonCard>
     );
  }
  
  function buildMonthCards() {
    let now = new Date();
    let month = now.getMonth();
    let year = now.getFullYear();
    if (month <= 5) {
      year--;
      month = 5 + month;
    } else {
      month = month - 6;
    }
    
    let cards = [];
    let count = 0;
    while (count <= 6) {
      cards.push(buildMonthCard(year, month));
      count++;
      console.log("rendering " + (month+1) + "," + year);
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }
    return cards.reverse();
  }
  
  const getStatistics = (): void => {
    loadStatistics().then(result => {
        if (result) {
          setStatistics(result);
        }
    })
  };
  
  const getSettings = (): void => {
    loadSettings().then(result => {
      if (result) {
        setSettings(result);
        setBudgetMonth(result.budgetPerYear/12.0);
      }
    });
  }

  
  useEffect(() => {
    getStatistics();
    getSettings();
  }, [])

  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Report</IonTitle>
          </IonToolbar>
        </IonHeader>
        {statistics && settings && (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle class="card-heading">Statistics</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol>Total Mileage:</IonCol>
                <IonCol>{statistics.mileage}km</IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6">Kilometers Left:</IonCol>
                <IonCol>{getBudgetLeftTotal(statistics, settings)}km</IonCol>
              </IonRow>
              <IonRow>
                <IonCol>Average km / month:</IonCol>
                <IonCol>{getAverageMonthlyKm(statistics).toFixed(1)}km</IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
        
        )}
        
        {buildMonthCards()}
        
     </IonContent>
    </IonPage>
  );
};

export default withIonLifeCycle(Tab3);
