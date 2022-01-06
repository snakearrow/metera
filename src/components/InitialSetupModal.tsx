import React from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonGrid, IonCol, IonRow } from '@ionic/react';
import { happy } from 'ionicons/icons';
import { Settings } from '../interfaces/settings';
import './InitialSetupModal.css';

type InitialSetupModalProps = {
  closeAction: Function;
}

type InitialSetupModalState = {
  kmPerYear: number,
  totalYears: number,
  mileage: number;
}

class InitialSetupModal extends React.Component<InitialSetupModalProps, InitialSetupModalState> {

  constructor(props: any) {
    super(props)
    this.state ={
      kmPerYear: 10000,
      totalYears: 4,
      mileage: 0
    }
  }
  
  handleKmChange(_km: any) {
    const km = parseInt(_km.detail.value);
    this.setState({
      kmPerYear: km
    });
  }
  
  handleYearsChange(_years: any) {
    const years = parseInt(_years.detail.value);
    this.setState({
      totalYears: years
    });
  }
  
  handleMileageChange(_km: any) {
    const mileage = parseInt(_km.detail.value);
    this.setState({
      mileage: mileage
    });
  }

  render() {
    return <>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonLabel class="label-heading">Hi there!</IonLabel>
            </IonCol>
            <IonCol>
              <IonIcon icon={happy} style={{height:40, width:40}}></IonIcon>
            </IonCol>
          </IonRow>
        </IonGrid>

          <IonLabel>This seems to be the first time you open this App. You can either</IonLabel>
          <div style={{padding:10, textAlign:'center'}}>
            <IonButton color="secondary" style={{height:25}} onClick={() => this.props.closeAction()}>have a look</IonButton>
          </div>
          <IonLabel>or enter some initial data and start using the App:</IonLabel>
          <IonList>
            <IonItem lines="none">
              <IonLabel position="stacked">Kilometer Budger p.a.:</IonLabel>
              <IonInput value={this.state.kmPerYear} placeholder="10000" type="number" onIonChange={(e) => this.handleKmChange(e)}></IonInput>
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="stacked">Years:</IonLabel>
              <IonInput value={this.state.totalYears} placeholder="4" type="number" onIonChange={(e) => this.handleYearsChange(e)}></IonInput>
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="stacked">Current Mileage:</IonLabel>
              <IonInput value={this.state.mileage} placeholder="0" type="number" onIonChange={(e) => this.handleMileageChange(e)}></IonInput>
            </IonItem>
          </IonList>
          <div style={{padding:10, textAlign:'center'}}>
              <IonButton color="success" style={{height:40, width: 120}} 
                onClick={() => this.props.closeAction([this.state.kmPerYear, this.state.totalYears, this.state.mileage])}>Start</IonButton>
          </div>
        </IonContent>
    </>
  };

}

export default ({closeAction}: { closeAction: Function }) => (
  <InitialSetupModal closeAction={closeAction}>
  </InitialSetupModal>
)

