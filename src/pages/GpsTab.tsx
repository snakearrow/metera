import React, { useState, useEffect } from 'react';
import { Storage } from '@capacitor/storage';
import { registerPlugin } from "@capacitor/core";
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonIcon, IonList,
    IonFabButton, IonLabel, IonItem, IonProgressBar, IonText, IonModal, IonButton, IonInput, IonGrid, IonRow, IonCol, IonPopover, useIonToast, withIonLifeCycle,
    IonListHeader
} from '@ionic/react';
import { Geolocation } from '@ionic-native/geolocation';
import { Insomnia } from '@awesome-cordova-plugins/insomnia';
import { Toast } from '@awesome-cordova-plugins/toast';

import './GpsTab.css';

export type MyPosition = [number, number, number];

type GpsTabProps = {

}

type GpsTabState = {
    running: boolean,
    paused: boolean
    watchId: string,
    positions: MyPosition[],
    distance: number,
    previousPosition: MyPosition | undefined,
    accuracy: number,
    measurements: number,
    intervalId: any | undefined,
    startTimestamp: Date | undefined,
    timeElapsed: number
}

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

class GpsTab extends React.Component<GpsTabProps, GpsTabState> {


    constructor(props: any) {
        super(props);
        this.state = {
            running: false,
            paused: false,
            positions: [],
            distance: 0,
            previousPosition: undefined,
            accuracy: 0,
            measurements: 0,
            watchId: "0",
            intervalId: 0,
            startTimestamp: undefined,
            timeElapsed: 0
        };

        this.onLocationUpdate = this.onLocationUpdate.bind(this);
        this.updateTime = this.updateTime.bind(this);
        this.onCallback = this.onCallback.bind(this);
    }

    ionViewDidEnter() {
        Insomnia.keepAwake();
    }

    ionViewDidLeave() {
        Insomnia.allowSleepAgain();
    }

    onLocationUpdate(position: any) {
        console.log(position);
        const lat = position.latitude;
        const lon = position.longitude;
        const timestamp = position.time;
        const accuracy = position.accuracy;

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
                distance: this.state.distance + totalDistance,
                positions: [],
                measurements: this.state.measurements + 1
            });
        }
    }

    async askToTurnOnGPS(): Promise<boolean> {
        return await new Promise((resolve, reject) => {
            LocationAccuracy.canRequest().then((canRequest: boolean) => {
                if (canRequest) {
                    LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                        () => {
                            resolve(true);
                        },
                        error => {
                            resolve(false);
                        }
                    );
                }
                else { resolve(false); }
            });
        })
    }

    clearToStart() {
        // reset state
        this.setState({
            positions: [],
            distance: 0,
            running: true,
            paused: false,
            previousPosition: undefined,
            accuracy: 0,
            measurements: 0,
            watchId: "0",
            intervalId: 0,
            startTimestamp: undefined,
            timeElapsed: 0
        });

        const interval = setInterval(this.updateTime, 1000);
        this.setState({
            intervalId: interval,
            startTimestamp: new Date()
        });
        
        BackgroundGeolocation.addWatcher(
            {
                // If the "backgroundMessage" option is defined, the watcher will
                // provide location updates whether the app is in the background or the
                // foreground. If it is not defined, location updates are only
                // guaranteed in the foreground. This is true on both platforms.


                // On Android, a notification must be shown to continue receiving
                // location updates in the background. This option specifies the text of
                // that notification.
                backgroundMessage: "Metera - Background GPS Tracking in Progress",

                // The title of the notification mentioned above. Defaults to "Using
                // your location".
                backgroundTitle: "Metera GPS Tracking in Progress",

                // Whether permissions should be requested from the user automatically,
                // if they are not already granted. Defaults to "true".
                requestPermissions: true,

                // If "true", stale locations may be delivered while the device
                // obtains a GPS fix. You are responsible for checking the "time"
                // property. If "false", locations are guaranteed to be up to date.
                // Defaults to "false".
                stale: false,

                // The minimum number of metres between subsequent locations. Defaults
                // to 0.
                distanceFilter: 0
            },
            this.onCallback
        ).then(watcher_id => this.setWatchId(watcher_id))
    }

    onCallback(location: any, error: any) {
        if (this.state.paused) {
          return;
        }
        if (location) {
            console.log("my location is: " + location.longitude + ", " + location.latitude);
            this.onLocationUpdate(location);
        } else {
            console.log("location is undefined");
        }
    }

    startOrPause() {
        if (this.state.running) {
          this.setState({
            running: false,
            paused: true
          });
          return;
        }
        if (this.state.paused) {
          this.setState({
            running: true,
            paused: false
          });
          return;
        }
        
        this.askToTurnOnGPS().then(result => {
            if (result) {
                this.clearToStart();
            } else {
                // GPS disabled, cannot proceed
                Toast.show(`GPS needed to continue.`, '5000', 'bottom').subscribe(
                    toast => {
                        console.log(toast);
                    });
                return;
            }
        });
    }

    setWatchId(watcher_id: any) {
        this.setState({
            watchId: watcher_id
        });
    }

    updateTime() {
        if (this.state.startTimestamp === undefined) {
          return;
        }
        const now = new Date();
        const diffInSec = (now.getTime() - this.state.startTimestamp.getTime())/1000;
        
        this.setState({
            timeElapsed: Math.floor(diffInSec)
        });
    }

    stop() {
        if (!this.state.running && !this.state.paused) {
          return;
        }
        this.setState({
          running: false,
          paused: false
        });
        console.log("stopping...");
        
        BackgroundGeolocation.removeWatcher({
            id: this.state.watchId
        });
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
    
    timeElapsedAsString() {
      const t = this.state.timeElapsed;
      const seconds = Math.floor(t%60);
      const secondsStr = seconds < 10 ? "0" + seconds : seconds;
      const minutes = Math.floor(t/60);
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      const hours = Math.floor(minutes/60);
      const hoursStr = hours < 10 ? "0" + hours : hours;
      return hoursStr + ":" + minutesStr + ":" + secondsStr;
    }

    render() {
        return (
            <IonPage>
                <IonContent>
                    <IonList>
                        <IonListHeader class="label-heading">Record Trip via GPS</IonListHeader>
                    </IonList>
                    <IonButton color="success" expand="block" onClick={e => this.startOrPause()} style={{width:180, height: 40}}>
                      {this.state.running ? "Pause" : (this.state.paused ? "Resume" : "Start")}</IonButton><br/>
                    <IonButton color="danger" expand="block" onClick={e => this.stop()} style={{width:180, height: 40}}>Stop</IonButton>
                    <IonList>
                        <IonItem lines="none">
                          <IonLabel>Distance: {(this.state.distance/1000.0).toFixed(2)} km</IonLabel>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>Accuracy: {this.state.accuracy} m</IonLabel>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>Last GPS Update: {this.getLastUpdateTime()}</IonLabel>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>Time elapsed: {this.timeElapsedAsString()}</IonLabel>
                        </IonItem>
                    </IonList>
                </IonContent>
            </IonPage>
        )
    }
}

export default withIonLifeCycle(GpsTab) 
