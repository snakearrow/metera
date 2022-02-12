import React, { useState, useEffect } from 'react';
import { Storage } from '@capacitor/storage';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonIcon, IonList, 
  IonFabButton, IonLabel, IonItem, IonProgressBar, IonText, IonModal, IonButton, IonInput, IonGrid, IonRow, IonCol, IonPopover, useIonToast, withIonLifeCycle,
   } from '@ionic/react';
import { Geolocation } from '@ionic-native/geolocation';
import { Insomnia } from '@awesome-cordova-plugins/insomnia';

import './GpsTab.css';

export type MyPosition = [number, number, number];

type GpsTabProps = {

}

type GpsTabState = {
  positions: MyPosition[],
  distance: number
}

class GpsTab extends React.Component<GpsTabProps, GpsTabState> {

  constructor(props: any) {
    super(props);
    this.state = {
      positions: [],
      distance: 0
    };
    
    this.onLocationUpdate = this.onLocationUpdate.bind(this);
  }

  ionViewDidEnter() {
    const options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      };
      
      console.log("enter");
      
      let watch = navigator.geolocation.watchPosition(this.onLocationUpdate, this.onLocationError, options);
      Insomnia.keepAwake();
  }
  
  ionViewDidLeave() {
    Insomnia.allowSleepAgain();
  }
  
  onLocationUpdate(position: any) {
      console.log(position);
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const timestamp = position.timestamp;
      
      const entry: MyPosition = [lat, lon, timestamp];
      
      
      
    this.setState({
      positions: [...this.state.positions, entry]
    })
    
    console.log(this.state.positions);
    this.updateDistance();
   }
    
    onLocationError(err: any) {
      console.log(err);
    }
    
  measureDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return Math.abs(d*1000);
  }

   deg2rad(deg: number) {
    return deg * (Math.PI/180)
  }
    
    updateDistance() {
      let totalDistance = 0.0;
      for (let i = 1; i < this.state.positions.length; i++) {
        const pos1 = this.state.positions[i-1];
        const pos2 = this.state.positions[i];
        const diff = this.measureDistance(pos1[0], pos1[1], pos2[0], pos2[1]);
        totalDistance += diff;
      }
      console.log(totalDistance);
      this.setState({
        distance: totalDistance
      });
    }
    
  render() {
    return (
      <IonPage>
        <IonContent>
          <IonButton onClick={e => this.updateDistance()}>Update</IonButton><br/>
          <IonLabel>{this.state.distance}m</IonLabel>
        </IonContent>
      </IonPage>
    )
  }
}

export default withIonLifeCycle(GpsTab) 
