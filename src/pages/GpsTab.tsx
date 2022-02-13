import React, { useState, useEffect } from 'react';
import { Storage } from '@capacitor/storage';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonIcon, IonList,
    IonFabButton, IonLabel, IonItem, IonProgressBar, IonText, IonModal, IonButton, IonInput, IonGrid, IonRow, IonCol, IonPopover, useIonToast, withIonLifeCycle,
} from '@ionic/react';
import { Geolocation } from '@ionic-native/geolocation';
import { Insomnia } from '@awesome-cordova-plugins/insomnia';

import './GpsTab.css';

export type MyPosition = [number, number, number];

type GpsTabProps = {

}

type GpsTabState = {
    watchId: number,
    positions: MyPosition[],
    distance: number,
    previousPosition: MyPosition | undefined,
    accuracy: number,
    measurements: number,
    intervalId: any | undefined,
    timeElapsed: number
}

class GpsTab extends React.Component<GpsTabProps, GpsTabState> {



    constructor(props: any) {
        super(props);
        this.state = {
            positions: [],
            distance: 0,
            previousPosition: undefined,
            accuracy: 0,
            measurements: 0,
            watchId: 0,
            intervalId: 0,
            timeElapsed: 0
        };

        this.onLocationUpdate = this.onLocationUpdate.bind(this);
        this.updateTime = this.updateTime.bind(this);
    }

    ionViewDidEnter() {
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
        const accuracy = position.coords.accuracy;
        
        // discard low accuracy measurements
        if (accuracy > 10.0) {
          return;
        }

        // check if we can discard this measurement because of (almost) zero movement
        if (this.state.previousPosition !== undefined) {
            const diff = this.measureDistance(lat, lon, this.state.previousPosition[0], this.state.previousPosition[1]);
            if (diff < 0.1) {
                console.log("omitting");
                return;
            }
        }

        const entry: MyPosition = [lat, lon, timestamp];

        this.setState({
            positions: [...this.state.positions, entry],
            accuracy: accuracy,
            //measurements: this.state.measurements + 1,
            previousPosition: entry
        })

        this.updateDistance(10);
    }

    onLocationError(err: any) {
        console.log(err);
    }

    measureDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return Math.abs(d * 1000);
    }

    deg2rad(deg: number) {
        return deg * (Math.PI / 180)
    }

    updateDistance(min_samples: number) {
        const positions = this.state.positions;
        let totalDistance = 0.0;
        if (positions.length >= min_samples) {
            for (let i = 1; i < positions.length; i++) {
                const pos1 = positions[i - 1];
                const pos2 = positions[i];
                const diff = this.measureDistance(pos1[0], pos1[1], pos2[0], pos2[1]);
                totalDistance += diff;
            }
            this.setState({
                distance: totalDistance,
                positions: [],
                measurements: this.state.measurements + 1
            });
        }
    }
    
    start() {
        // reset state
        this.setState({
            positions: [],
            distance: 0,
            previousPosition: undefined,
            accuracy: 0,
            measurements: 0,
            watchId: 0,
            intervalId: 0,
            timeElapsed: 0
        })
        
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        const watch = navigator.geolocation.watchPosition(this.onLocationUpdate, this.onLocationError, options);
        const interval = setInterval(this.updateTime, 1000);
        this.setState({
            watchId: watch,
            intervalId: interval
        });
    }
    
    updateTime() {
        this.setState({
            timeElapsed: this.state.timeElapsed+1
        });
    }
    
    stop() {
        navigator.geolocation.clearWatch(this.state.watchId);
        this.updateDistance(2);
        clearInterval(this.state.intervalId);
    }
    
    getLastUpdateTime() {
        if (this.state.previousPosition === undefined) {
            return "n/a";
        }
        const unixTimestamp = this.state.previousPosition[2];
        const date = new Date(unixTimestamp).toLocaleTimeString("de-DE");
        return date;
    }
    
    render() {
        return (
            <IonPage>
                <IonContent>
                    <br/>
                    <IonButton color="success" onClick={e => this.start()}>Start</IonButton>
                    <IonButton color="danger" onClick={e => this.stop()}>Stop</IonButton><br/>
                    <IonLabel>{this.state.distance} m</IonLabel><br />
                    <IonLabel>Accuracy: {this.state.accuracy} m</IonLabel><br/>
                    <IonLabel>Measurements: {this.state.measurements}</IonLabel><br/>
                    <IonLabel>Last update: {this.getLastUpdateTime()}</IonLabel><br/>
                    <IonLabel>Time elapsed: {(this.state.timeElapsed/60.0).toFixed(1)}m</IonLabel>
                </IonContent>
            </IonPage>
        )
    }
}

export default withIonLifeCycle(GpsTab) 
