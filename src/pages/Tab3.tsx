import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonLabel, IonToolbar, IonList, IonListHeader, 
  IonItem, IonInput, IonButton, IonIcon, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle, IonRow, IonGrid, IonCol } from '@ionic/react';
import { Settings } from '../interfaces/settings';
import { Trip } from '../interfaces/trip';
import { loadSettings, updateSettings, defaultSettings, loadTrips } from '../util';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'; 
import 'react-circular-progressbar/dist/styles.css';
import './Tab3.css';

const Tab3: React.FC = () => {

  const [settings, setSettings] = useState(null as Settings | null);
  
  const budgetGood = "#32a840";
  const budgetOkay = "#ffa600";
  const budgetBad = "#c20000";
  
  function buildMonthCard(month: string, kmBudgetMonth: number, kmDriven: number) {
    let color = budgetGood;
    let diff = kmBudgetMonth - kmDriven;
    if (diff < 0) {
      color = budgetBad;
    } else if (diff < 50.0) {
      color = budgetOkay;
    }
    let percent = parseFloat(Math.min(100.0, 100.0/kmBudgetMonth*kmDriven).toPrecision(3));
    let sign = (diff >= 0 ? '+' : '-');
    
    return (
       <IonCard style={{}}>
         <IonCardHeader>
           <IonCardTitle class="card-heading">{month}</IonCardTitle>
         </IonCardHeader>
         <IonCardContent>
           <IonGrid>
             <IonRow>
               <IonCol>
                 <IonGrid>
                   <IonRow>
                     <IonCol>Kilometer Driven:</IonCol>
                   </IonRow>
                   <IonRow>
                     <IonCol>{kmDriven}km / {kmBudgetMonth}km</IonCol>
                   </IonRow>
                   <IonRow>
                     <IonCol>Difference: {sign}{Math.abs(diff)}km</IonCol>
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

  
  useEffect(() => {

  }, [])

  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Report</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle class="card-heading">Statistics</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="6">Kilometers Left:</IonCol>
                <IonCol>39012km</IonCol>
              </IonRow>
              <IonRow>
                <IonCol>Average km / month:</IonCol>
                <IonCol>724.1km</IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
        
        {buildMonthCard("December", 800, 632.0)}
        {buildMonthCard("November", 800, 790.0)}
        {buildMonthCard("October", 800, 890.0)}
        
     </IonContent>
    </IonPage>
  );
};

export default Tab3;
