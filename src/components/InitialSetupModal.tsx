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
  totalYears: number;
}

class InitialSetupModal extends React.Component<InitialSetupModalProps, InitialSetupModalState> {

  constructor(props: any) {
    super(props)
    this.state ={
      kmPerYear: 10000,
      totalYears: 4
    }
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
              <IonInput value={this.state.kmPerYear} placeholder="10000" type="number"></IonInput>
            </IonItem>
            <IonItem lines="none">
              <IonLabel position="stacked">Years:</IonLabel>
              <IonInput value={this.state.totalYears} placeholder="4" type="number"></IonInput>
            </IonItem>
          </IonList>
          <div style={{padding:10, textAlign:'center'}}>
              <IonButton color="success" style={{height:40, width: 120}} onClick={() => this.props.closeAction([this.state.kmPerYear, this.state.totalYears])}>Start</IonButton>
          </div>
        </IonContent>
    </>
  };

}

export default ({closeAction}: { closeAction: Function }) => (
  <InitialSetupModal closeAction={closeAction}>
  </InitialSetupModal>
)

