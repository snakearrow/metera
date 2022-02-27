import React from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSegment, IonSegmentButton } from '@ionic/react';
import { add } from 'ionicons/icons';
import { Trip } from '../interfaces/trip';
import { Stats } from '../interfaces/stats';
import { loadTemplateTrips, getIconForKeyword, loadStatistics } from '../util';  


type SaveGpsTripModalProps = {
  closeAction: Function,
  km: number;
}

type SaveGpsTripModalState = {
  name: string,
  description: string,
  kilometers: number
}


class SaveGpsTripModal extends React.Component<SaveGpsTripModalProps, SaveGpsTripModalState> {

  constructor(props: any) {
    super(props);
    this.state = {
      name: "GPS Trip",
      description: "Automatically rec. via GPS",
      kilometers: this.props.km
    }
  }
  
  /*
  addTemplateTrip(name: string) {
    this.props.closeAction(["template", name]);
  }
  
  addMileage() {
    this.props.closeAction(["mileage", this.state.mileage]);
  }
  
  addCustom() {
    this.props.closeAction(["custom", this.state.name, this.state.description, this.state.kilometers]);
  }*/
  
  handleNameChange(name: any) {
    this.setState({
      name: name
    });
  }
  
  handleDescChange(description: any) {
    this.setState({
      description: description
    });
  }
  
  handleKilometersChange(event: any) {
    let km = +event.detail.value;
    this.setState({
      kilometers: km
    });
  }
  
  closeFunc() {
    const km = this.state.kilometers;
    if (this.state.name.length <= 0 || km <= 0) {
      //this.setState({ showWarning: true});
      return;
    }
    this.props.closeAction([this.state.name, this.state.description, km]);
  }
  
  render() {
    return <>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Save GPS Trip</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem lines="none">
            <IonLabel position="fixed">Name:</IonLabel>
            <IonInput value={this.state.name} onIonChange={(e) => this.handleNameChange(e)}></IonInput>
          </IonItem>
          <IonItem lines="none">
            <IonLabel position="fixed">Description:</IonLabel>
            <IonInput placeholder="(optional)" value={this.state.description} onIonChange={(e) => this.handleDescChange(e)}></IonInput>
          </IonItem>
          <IonItem lines="none">
            <IonLabel position="fixed">Kilometers:</IonLabel>
            <IonInput value={this.state.kilometers} onIonChange={(e) => this.handleKilometersChange(e)}></IonInput>
          </IonItem>
          <IonItem lines="none">
            <IonButton color="secondary" style={{width: 100, height: 30}} 
              onClick={() => this.props.closeAction()}>Cancel</IonButton>
            <IonButton color="success" style={{width: 100, height: 30}} onClick={() => this.closeFunc()}>Add&nbsp;
                <IonIcon icon={add} />
            </IonButton>
          </IonItem>
        </IonList>
      </IonContent>
    </>
  };

}

export default ({closeAction, km}: { closeAction: Function, km: number }) => (
  <SaveGpsTripModal closeAction={closeAction} km={km}>
  </SaveGpsTripModal>
)

